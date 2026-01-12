
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ItineraryItem } from '@/lib/itineraryService';

interface Props {
    item: ItineraryItem;
}

export function ItineraryCard({ item }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none' // Essential for mobile drag
    };

    // Type-based styling
    const getBorderColor = () => {
        switch (item.type) {
            case 'flight_departure': return 'border-blue-500/50';
            case 'flight_arrival': return 'border-blue-400/30';
            case 'check_in': return 'border-green-500/50';
            case 'check_out': return 'border-green-400/30';
            case 'car_pickup': return 'border-orange-500/50';
            case 'car_dropoff': return 'border-orange-400/30';
            case 'train_departure': return 'border-orange-500/50';
            case 'train_arrival': return 'border-orange-400/30';
            case 'activity': return 'border-purple-500/50';
            default: return 'border-white/10';
        }
    };

    const getIcon = () => {
        switch (item.type) {
            case 'flight_departure': return '🛫';
            case 'flight_arrival': return '🛬';
            case 'check_in': return '🏨';
            case 'check_out': return '👋';
            case 'car_pickup': return '🚗';
            case 'car_dropoff': return '🔑';
            case 'train_departure': return '🚆';
            case 'train_arrival': return '🚆';
            case 'activity': return '🎫';
            default: return '📍';
        }
    };

    // Format time
    const timeStr = new Date(item.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                group relative p-3 mb-3 rounded-xl 
                bg-glass border ${getBorderColor()}
                hover:bg-glass-hover cursor-grab active:cursor-grabbing
                shadow-sm backdrop-blur-md transition-all
            `}
        >
            <div className="flex items-start gap-3">
                <div className="text-xl mt-0.5 select-none">{getIcon()}</div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{item.title}</h4>
                    {item.subtitle && (
                        <p className="text-white/60 text-xs truncate">{item.subtitle}</p>
                    )}
                </div>
                <div className="text-right">
                    <div className="text-accent-cyan text-sm font-mono">{timeStr}</div>
                </div>
            </div>

            {/* Drag Handle Indicator (visible on hover) */}
            <div className="absolute top-1/2 left-1 -translate-y-1/2 opacity-0 group-hover:opacity-30">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
            </div>
        </div>
    );
}
