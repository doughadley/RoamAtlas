
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ItineraryItem } from '@/lib/itineraryService';
import { ItineraryCard } from './ItineraryCard';

interface Props {
    date: string;
    items: ItineraryItem[];
}

export function DayColumn({ date, items }: Props) {
    const { setNodeRef } = useDroppable({
        id: date,
    });

    // Format date header
    const dateObj = new Date(date + 'T12:00:00'); // Noon to avoid DST/timezone issues
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    return (
        <div className="flex-shrink-0 w-80 bg-glass-dark border border-white/5 rounded-2xl h-full flex flex-col max-h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="p-4 border-b border-white/10 sticky top-0 bg-glass/80 backdrop-blur-md rounded-t-2xl z-10">
                <h3 className="text-lg font-bold text-white flex justify-between items-center">
                    <span>{dayName}</span>
                    <span className="text-sm font-normal text-white/50">{dayNum}</span>
                </h3>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className="flex-1 p-3 overflow-y-auto custom-scrollbar"
            >
                <SortableContext
                    id={date}
                    items={items.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map((item) => (
                        <ItineraryCard key={item.id} item={item} />
                    ))}
                    {items.length === 0 && (
                        <div className="h-full flex items-center justify-center text-white/20 text-sm border-2 border-dashed border-white/5 rounded-xl">
                            Empty Day
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
