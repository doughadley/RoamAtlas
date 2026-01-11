
'use client';

import React, { useState, useEffect } from 'react';
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
import { ItineraryItem, DayItinerary, getDidItineraryByDay, updateItemDate } from '@/lib/itineraryService';
import { DayColumn } from './DayColumn';
import { ItineraryCard } from './ItineraryCard';

interface Props {
    tripId: string;
}

export function ItineraryBoard({ tripId }: Props) {
    const [days, setDays] = useState<{ [key: string]: ItineraryItem[] }>({});
    const [activeId, setActiveId] = useState<string | null>(null);

    // Load initial data
    useEffect(() => {
        const data = getDidItineraryByDay(tripId);
        const dayMap: { [key: string]: ItineraryItem[] } = {};
        data.forEach(d => {
            dayMap[d.date] = d.items;
        });
        setDays(dayMap);
    }, [tripId]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const findContainer = (id: string): string | undefined => {
        if (id in days) return id;
        return Object.keys(days).find(key => days[key].find(item => item.id === id));
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) return;

        // Move item to new container during drag
        setDays((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            const activeIndex = activeItems.findIndex(i => i.id === activeId);
            const overIndex = overItems.findIndex(i => i.id === overId);

            let newIndex;
            if (overId in prev) {
                // We're over a container
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter(item => item.id !== activeId)
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    activeItems[activeIndex],
                    ...prev[overContainer].slice(newIndex, prev[overContainer].length)
                ]
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(over?.id as string || '');

        if (activeContainer && overContainer && activeContainer === overContainer) {
            const activeIndex = days[activeContainer].findIndex(i => i.id === active.id);
            const overIndex = days[activeContainer].findIndex(i => i.id === over?.id);

            if (activeIndex !== overIndex) {
                setDays((prev) => ({
                    ...prev,
                    [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
                }));
            }
        }

        // Persist changes if item moved to a new day
        const finalContainer = findContainer(active.id as string);
        if (finalContainer) {
            const item = days[finalContainer].find(i => i.id === active.id);
            if (item) {
                const currentContainerDate = finalContainer;
                const itemDate = item.dateTime.split('T')[0];

                if (currentContainerDate !== itemDate) {
                    console.log(`Moving item ${item.title} from ${itemDate} to ${currentContainerDate}`);
                    updateItemDate(item, currentContainerDate);

                    // Update item state
                    item.dateTime = item.dateTime.replace(itemDate, currentContainerDate);

                    setDays(prev => ({
                        ...prev,
                        [finalContainer]: prev[finalContainer].map(i =>
                            i.id === item.id ? { ...i, dateTime: item.dateTime } : i
                        )
                    }));
                }
            }
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

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar">
                {Object.keys(days).sort().map((date) => (
                    <DayColumn key={date} date={date} items={days[date]} />
                ))}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeId ? (
                    <div className="transform scale-105 rotate-2 cursor-grabbing">
                        {(() => {
                            const container = findContainer(activeId);
                            const item = container ? days[container].find(i => i.id === activeId) : null;
                            return item ? <ItineraryCard item={item} /> : null;
                        })()}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
