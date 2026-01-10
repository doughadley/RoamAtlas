'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plane, Building2, Ticket, Car, Train } from 'lucide-react';
import { CalendarEvent, getMonthDates, getEventsForDate } from './calendarUtils';

interface TripCalendarProps {
    events: CalendarEvent[];
    tripStartDate: string;
    tripEndDate: string;
    onEventClick?: (event: CalendarEvent) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const IconMap = {
    plane: Plane,
    building: Building2,
    ticket: Ticket,
    car: Car,
    train: Train,
};

export default function TripCalendar({ events, tripStartDate, tripEndDate, onEventClick }: TripCalendarProps) {
    // Initialize to trip start month
    const tripStart = new Date(tripStartDate);
    const [currentMonth, setCurrentMonth] = useState(tripStart.getMonth());
    const [currentYear, setCurrentYear] = useState(tripStart.getFullYear());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const monthDates = useMemo(() => getMonthDates(currentYear, currentMonth), [currentYear, currentMonth]);

    const tripStartObj = new Date(tripStartDate);
    const tripEndObj = new Date(tripEndDate);

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(y => y - 1);
        } else {
            setCurrentMonth(m => m - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(y => y + 1);
        } else {
            setCurrentMonth(m => m + 1);
        }
    };

    const isInTripRange = (date: Date): boolean => {
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const start = new Date(tripStartObj.getFullYear(), tripStartObj.getMonth(), tripStartObj.getDate());
        const end = new Date(tripEndObj.getFullYear(), tripEndObj.getMonth(), tripEndObj.getDate());
        return d >= start && d <= end;
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const formatDateKey = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    return (
        <div className="glass-panel p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors">
                    <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                    {MONTHS[currentMonth]} {currentYear}
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors">
                    <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-[var(--text-muted)] py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {monthDates.map((date, idx) => {
                    const dateKey = formatDateKey(date);
                    const dayEvents = getEventsForDate(events, dateKey);
                    const isCurrentMonth = date.getMonth() === currentMonth;
                    const inTrip = isInTripRange(date);
                    const today = isToday(date);

                    return (
                        <div
                            key={idx}
                            className={`
                min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer
                ${isCurrentMonth ? 'bg-[var(--bg-glass)]' : 'bg-transparent opacity-40'}
                ${inTrip ? 'border-[var(--accent-cyan)]/30' : 'border-[var(--border-glass)]'}
                ${today ? 'ring-2 ring-[var(--accent-cyan)]' : ''}
                hover:bg-[var(--bg-glass-hover)]
              `}
                        >
                            <div className={`text-sm font-medium mb-1 ${today ? 'text-[var(--accent-cyan)]' : isCurrentMonth ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                                {date.getDate()}
                            </div>

                            {/* Events */}
                            <div className="space-y-1">
                                {dayEvents.slice(0, 3).map(event => {
                                    const Icon = IconMap[event.icon];
                                    return (
                                        <div
                                            key={event.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedEvent(event);
                                                onEventClick?.(event);
                                            }}
                                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs truncate cursor-pointer hover:opacity-80 transition-opacity"
                                            style={{ background: `${event.color}30`, color: event.color }}
                                            title={event.title}
                                        >
                                            <Icon className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{event.startTime && `${event.startTime} `}{event.title.split(':')[0]}</span>
                                        </div>
                                    );
                                })}
                                {dayEvents.length > 3 && (
                                    <div className="text-xs text-[var(--text-muted)] px-1.5">
                                        +{dayEvents.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Event Detail Popup */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setSelectedEvent(null)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="glass-panel relative z-10 p-6 max-w-md mx-4 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: `${selectedEvent.color}20` }}
                            >
                                {(() => {
                                    const Icon = IconMap[selectedEvent.icon];
                                    return <Icon className="w-5 h-5" style={{ color: selectedEvent.color }} />;
                                })()}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{selectedEvent.title}</h3>
                                {selectedEvent.subtitle && <p className="text-sm text-[var(--text-secondary)]">{selectedEvent.subtitle}</p>}
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p className="text-[var(--text-secondary)]">
                                <span className="text-[var(--text-muted)]">Date:</span> {new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                            {selectedEvent.startTime && (
                                <p className="text-[var(--text-secondary)]">
                                    <span className="text-[var(--text-muted)]">Time:</span> {selectedEvent.startTime}{selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="mt-4 w-full glass-button py-2"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-[var(--border-glass)] flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded" style={{ background: 'var(--accent-blue)' }} />
                    <span className="text-[var(--text-secondary)]">Flights</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded" style={{ background: 'var(--accent-green)' }} />
                    <span className="text-[var(--text-secondary)]">Accommodations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded" style={{ background: 'var(--accent-purple)' }} />
                    <span className="text-[var(--text-secondary)]">Activities</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded" style={{ background: 'var(--accent-orange)' }} />
                    <span className="text-[var(--text-secondary)]">Transport</span>
                </div>
            </div>
        </div>
    );
}
