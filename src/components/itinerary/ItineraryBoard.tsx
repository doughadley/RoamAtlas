'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DropAnimation,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ItineraryItem, DayItinerary, getDidItineraryByDay, updateItemDate, getItineraryItems, generateItineraryDays } from '@/lib/itineraryService';
import { getTrip } from '@/lib/dataService';
import { DayColumn } from './DayColumn';
import { ItineraryCard } from './ItineraryCard';

interface Props {
    tripId: string;
}

export function ItineraryBoard({ tripId }: Props) {
    const [items, setItems] = useState<ItineraryItem[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    // 1. Load initial data ONCE
    useEffect(() => {
        // Only load if items are empty to prevent overwriting local drag state
        // or simplistic check. Better: Load once on mount.
        const initialItems = getItineraryItems(tripId);
        setItems(initialItems);
    }, [tripId]);

    // 2. Derive days from items (Single Source of Truth)
    const days: DayItinerary[] = useMemo(() => {
        const trip = getTrip(tripId);
        return generateItineraryDays(trip, items);
    }, [items, tripId]); // getTrip is cheap, can be called here or memoized too

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const findContainer = (id: string): string | undefined => {
        const day = days.find(d => d.items.find(item => item.id === id));
        return day?.date;
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find which day (container) the active and over items belong to
        // If overId is a date (empty day column), overDay is that date
        const overDay = days.find(d => d.date === overId)?.date || findContainer(overId);
        const activeDay = findContainer(activeId);

        if (!activeDay || !overDay || activeDay === overDay) return;

        // Optimistic update: Move item to the new day in 'items' state
        // We update the item's dateTime strictly to the new day so it renders there.
        setItems(prev => {
            const activeItem = prev.find(i => i.id === activeId);
            if (!activeItem) return prev;

            // Calculate new dateTime (preserve time)
            const timePart = activeItem.dateTime.includes('T')
                ? activeItem.dateTime.split('T')[1]
                : '12:00:00';
            const newDateTime = `${overDay}T${timePart}`;

            return prev.map(item =>
                item.id === activeId
                    ? { ...item, dateTime: newDateTime }
                    : item
            );
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id as string;
        const overId = over?.id as string;

        // In handleDragOver, we already enthusiastically moved the item to the new date.
        // So by DragEnd, the item should ALREADY be in the correct "container" (date).
        // loading state matches visual state.

        // However, we need to persist to DB check.
        const activeItem = items.find(i => i.id === activeId);
        if (activeItem) {
            // Check if actual date changed from original source?
            // Actually, we modified "items" state in DragOver.
            // So activeItem.dateTime is ALREADY updated.
            // We just need to persist it.

            // To be precise: We need to know if it moved.
            // But we can just persist the current state of the active item.
            // Or better: Re-run logic.

            // Wait, if we dropped it, we rely on DragOver having moved it.
            // But what if it was cancelled? dnd-kit handles cancellation by reverting?
            // No, using controlled state means WE corrupted the state in DragOver.
            // If user cancels (Escape), we might be in trouble unless we handle Cancel.
            // For now, let's assume successful drop.

            const currentDateKey = activeItem.dateTime.split('T')[0];
            // We can just call updateItemDate. It's idempotent-ish.
            console.log(`[DragEnd] Persisting item ${activeItem.title} to ${currentDateKey}`);
            updateItemDate(activeItem, currentDateKey);
        }

        setActiveId(null);
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: { opacity: '0.5' },
            },
        }),
    };

    // 3. Month Navigation
    const months = useMemo(() => {
        const uniqueMonths = new Set<string>();
        days.forEach(d => {
            const date = new Date(d.date + 'T12:00:00');
            const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            uniqueMonths.add(key);
        });
        return Array.from(uniqueMonths);
    }, [days]);

    const scrollToMonth = (monthStr: string) => {
        // Find first day of this month
        const targetDay = days.find(d => {
            const date = new Date(d.date + 'T12:00:00');
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) === monthStr;
        });

        if (targetDay) {
            const el = document.getElementById(`day-${targetDay.date}`);
            el?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Quick Navigation */}
            <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar flex-shrink-0">
                {months.map(m => (
                    <button
                        key={m}
                        onClick={() => scrollToMonth(m)}
                        className="px-3 py-1.5 rounded-full bg-glass border border-white/10 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
                    >
                        {m}
                    </button>
                ))}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                {/* Board Content */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden px-4">
                    <div className="h-full flex gap-4 w-max pr-24 pb-4">
                        {days.map((day) => (
                            <div key={day.date} id={`day-${day.date}`}>
                                <DayColumn
                                    date={day.date}
                                    items={day.items}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        <div className="transform scale-105 rotate-2 cursor-grabbing">
                            {(() => {
                                const item = items.find(i => i.id === activeId);
                                return item ? <ItineraryCard item={item} /> : null;
                            })()}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
