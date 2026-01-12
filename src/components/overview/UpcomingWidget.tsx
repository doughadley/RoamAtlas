import { CalendarEvent } from '@/components/calendar/calendarUtils';
import { Plane, Building2, Ticket, Car, Train, Calendar } from 'lucide-react';

interface UpcomingWidgetProps {
    events: CalendarEvent[];
}

const IconMap = {
    plane: Plane,
    building: Building2,
    ticket: Ticket,
    car: Car,
    train: Train,
};

export default function UpcomingWidget({ events }: UpcomingWidgetProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter future events and take top 3
    const upcoming = events
        .filter(e => new Date(e.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);

    return (
        <div className="glass-panel p-6">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                Upcoming Bookings
            </h3>

            <div className="space-y-4">
                {upcoming.length === 0 ? (
                    <div className="text-center py-4 text-[var(--text-muted)] text-sm italic">
                        No upcoming events.
                    </div>
                ) : (
                    upcoming.map((event) => {
                        const Icon = IconMap[event.icon] || Ticket;
                        const date = new Date(event.date);

                        return (
                            <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-glass)] hover:bg-[var(--bg-glass-hover)] transition-colors">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${event.color}20` }}>
                                    <Icon className="w-5 h-5" style={{ color: event.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-[var(--text-primary)] text-sm truncate">{event.title.replace(/^(In:|Out:)\s*/, '')}</h4>
                                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                        <span>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        {event.startTime && <span>• {event.startTime}</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
