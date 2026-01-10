'use client';

import { X, Plane, Building2, Ticket, Car, Train, Clock, MapPin, DollarSign } from 'lucide-react';
import { CalendarEvent } from './calendarUtils';

interface DayModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
    events: CalendarEvent[];
    isInTripRange: boolean;
}

const IconMap = {
    plane: Plane,
    building: Building2,
    ticket: Ticket,
    car: Car,
    train: Train,
};

const TypeLabels: Record<string, string> = {
    flight: 'Flight',
    accommodation: 'Accommodation',
    excursion: 'Activity',
    car: 'Car Rental',
    train: 'Train',
};

export default function DayModal({ isOpen, onClose, date, events, isInTripRange }: DayModalProps) {
    if (!isOpen) return null;

    const formatDate = (d: Date) => {
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Group events by type
    const groupedEvents = events.reduce((acc, event) => {
        if (!acc[event.type]) acc[event.type] = [];
        acc[event.type].push(event);
        return acc;
    }, {} as Record<string, CalendarEvent[]>);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            <div className="glass-panel relative z-10 w-full max-w-2xl p-6 mx-4 animate-slide-up max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                            {formatDate(date)}
                        </h2>
                        {isInTripRange ? (
                            <p className="text-sm text-[var(--accent-cyan)]">During your trip</p>
                        ) : (
                            <p className="text-sm text-[var(--text-muted)]">Outside trip dates</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors"
                    >
                        <X className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {events.length > 0 ? (
                        <div className="space-y-6">
                            {Object.entries(groupedEvents).map(([type, typeEvents]) => (
                                <div key={type}>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                                        {TypeLabels[type] || type} ({typeEvents.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {typeEvents.map(event => {
                                            const Icon = IconMap[event.icon];
                                            return (
                                                <div
                                                    key={event.id}
                                                    className="glass-card p-4"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div
                                                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                                            style={{ background: `${event.color}20` }}
                                                        >
                                                            <Icon className="w-6 h-6" style={{ color: event.color }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-lg font-semibold text-[var(--text-primary)]">
                                                                {event.title}
                                                            </h4>
                                                            {event.subtitle && (
                                                                <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mt-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {event.subtitle}
                                                                </p>
                                                            )}

                                                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                                                                {event.startTime && (
                                                                    <span className="flex items-center gap-1 text-[var(--text-muted)]">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        {event.startTime}
                                                                        {event.endTime && ` - ${event.endTime}`}
                                                                    </span>
                                                                )}

                                                                {/* Show cost if available */}
                                                                {'costAmount' in event.data && (event.data as any).costAmount && (
                                                                    <span className="flex items-center gap-1 text-[var(--accent-cyan)]">
                                                                        <DollarSign className="w-3.5 h-3.5" />
                                                                        {((event.data as any).costAmount as number).toFixed(2)}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Type-specific details */}
                                                            {event.type === 'flight' && (
                                                                <div className="mt-3 p-3 rounded-lg bg-[var(--bg-glass)] text-sm">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[var(--text-muted)]">Confirmation:</span>
                                                                        <span className="text-[var(--text-primary)] font-mono">
                                                                            {(event.data as any).confirmationNumber || 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {event.type === 'accommodation' && (
                                                                <div className="mt-3 p-3 rounded-lg bg-[var(--bg-glass)] text-sm">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[var(--text-muted)]">Confirmation:</span>
                                                                        <span className="text-[var(--text-primary)] font-mono">
                                                                            {(event.data as any).confirmationNumber || 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {event.type === 'excursion' && (event.data as any).notes && (
                                                                <p className="mt-3 text-sm text-[var(--text-muted)] italic">
                                                                    {(event.data as any).notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-glass)] mx-auto mb-4 flex items-center justify-center">
                                <Clock className="w-8 h-8 text-[var(--text-muted)]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                                No events scheduled
                            </h3>
                            <p className="text-sm text-[var(--text-muted)]">
                                {isInTripRange
                                    ? 'This day is free for exploring!'
                                    : 'This day is outside your trip dates.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-[var(--border-glass)]">
                    <button onClick={onClose} className="w-full glass-button py-3">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
