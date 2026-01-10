'use client';

import { Trip } from '@/types';
import { MapPin, Calendar, MoreVertical, Edit, Archive, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface TripCardProps {
    trip: Trip;
    isSelected?: boolean;
    onSelect?: (trip: Trip) => void;
    onEdit?: (trip: Trip) => void;
    onArchive?: (trip: Trip) => void;
    onDelete?: (trip: Trip) => void;
}

export default function TripCard({
    trip,
    isSelected,
    onSelect,
    onEdit,
    onArchive,
    onDelete
}: TripCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Calculate trip duration
    // Parse "YYYY-MM-DD" explicitly to avoid timezone shifts
    const parseDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const startDate = parseDate(trip.startDate);
    const endDate = parseDate(trip.endDate);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1; // Inclusive duration

    // Format dates
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            className={`glass-card p-5 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-[var(--accent-cyan)] shadow-[var(--shadow-glow)]' : ''
                }`}
            onClick={() => onSelect?.(trip)}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{trip.name}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{trip.primaryDestination}</p>
                    </div>
                </div>

                {/* Menu */}
                <div ref={menuRef} className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors"
                    >
                        <MoreVertical className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-40 glass-panel p-1 z-20 animate-fade-in">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.(trip);
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] rounded-lg transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onArchive?.(trip);
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] rounded-lg transition-colors"
                            >
                                <Archive className="w-4 h-4" />
                                {trip.status === 'archived' ? 'Unarchive' : 'Archive'}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.(trip);
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Date info */}
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
                </div>
                <div className="px-2 py-1 rounded-full bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] text-xs font-medium">
                    {duration} {duration === 1 ? 'day' : 'days'}
                </div>
            </div>

            {/* Status badge */}
            {trip.status === 'archived' && (
                <div className="mt-3 px-2 py-1 rounded-full bg-[var(--text-muted)]/20 text-[var(--text-muted)] text-xs font-medium inline-block">
                    Archived
                </div>
            )}
        </div>
    );
}
