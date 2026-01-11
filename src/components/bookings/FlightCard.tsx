'use client';

import { deleteFlight } from '@/lib/dataService';
import { Flight } from '@/types';
import { Plane, Clock, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface FlightCardProps {
    flight: Flight;
    onEdit?: (flight: Flight) => void;
    onDelete?: (flight: Flight) => void;
}

export default function FlightCard({ flight, onEdit, onDelete }: FlightCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const depDate = new Date(flight.departureDateTime);
    const arrDate = new Date(flight.arrivalDateTime);

    const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Calculate duration
    const durationMs = arrDate.getTime() - depDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

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
        <div className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-blue)]/20 flex items-center justify-center">
                        <Plane className="w-5 h-5 text-[var(--accent-blue)]" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--text-secondary)]">{flight.airline}</p>
                        <p className="text-lg font-semibold text-[var(--text-primary)]">{flight.flightNumber}</p>
                    </div>
                </div>

                <div ref={menuRef} className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors">
                        <MoreVertical className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-32 glass-panel p-1 z-20 animate-fade-in">
                            <button onClick={() => { onEdit?.(flight); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)] rounded-lg">
                                <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => { onDelete?.(flight); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 rounded-lg">
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Route Display */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{flight.origin}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{formatTime(depDate)}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(depDate)}</p>
                </div>

                <div className="flex-1 mx-4 relative">
                    <div className="border-t border-dashed border-[var(--border-glass)] w-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-primary)] px-2 text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {hours}h {minutes}m
                    </div>
                    <Plane className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-4 text-[var(--accent-blue)]" />
                </div>

                <div className="text-center">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{flight.destination}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{formatTime(arrDate)}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(arrDate)}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm pt-3 border-t border-[var(--border-glass)]">
                {flight.confirmationNumber && (
                    <span className="text-[var(--text-muted)]">Conf: {flight.confirmationNumber}</span>
                )}
                {flight.costAmount && (
                    <span className="text-[var(--accent-cyan)] font-medium">${flight.costAmount.toFixed(2)}</span>
                )}
            </div>
        </div>
    );
}
