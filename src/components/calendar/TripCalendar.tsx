'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plane, Building2, Ticket, Car, Train } from 'lucide-react';
import { CalendarEvent, getMonthDates, getEventsForDate } from './calendarUtils';
import DayModal from './DayModal';

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

    // Day modal state
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [dayModalOpen, setDayModalOpen] = useState(false);

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

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setDayModalOpen(true);
    };

    const selectedDateEvents = selectedDate ? getEventsForDate(events, formatDateKey(selectedDate)) : [];

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
                            onClick={() => handleDayClick(date)}
                            className={`
                                min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer
                                ${isCurrentMonth ? 'bg-[var(--bg-glass)]' : 'bg-transparent opacity-40'}
                                ${inTrip ? 'border-[var(--accent-cyan)]/30' : 'border-[var(--border-glass)]'}
                                ${today ? 'ring-2 ring-[var(--accent-cyan)]' : ''}
                                hover:bg-[var(--bg-glass-hover)] hover:border-[var(--accent-cyan)]/50
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
                                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs truncate"
                                            style={{ background: `${event.color}30`, color: event.color }}
                                            title={event.title}
                                        >
                                            <Icon className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{event.startTime && `${event.startTime} `}{event.title}</span>
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
                <div className="ml-auto text-xs text-[var(--text-muted)]">
                    Click on any day to see details
                </div>
            </div>

            {/* Day Modal */}
            <DayModal
                isOpen={dayModalOpen}
                onClose={() => setDayModalOpen(false)}
                date={selectedDate || new Date()}
                events={selectedDateEvents}
                isInTripRange={selectedDate ? isInTripRange(selectedDate) : false}
            />
        </div>
    );
}
