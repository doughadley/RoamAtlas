import { Trip } from '@/types';
import { Plane, Building2, Ticket, Car, MapPin, Train } from 'lucide-react';
import { CalendarEvent } from '@/components/calendar/calendarUtils';
import { useState } from 'react';

interface JourneyHeroProps {
    trip: Trip;
    events: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
}

const IconMap = {
    plane: Plane,
    building: Building2,
    ticket: Ticket,
    car: Car,
    train: Train,
};

export default function JourneyHero({ trip, events, onEventClick }: JourneyHeroProps) {
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const [filter, setFilter] = useState<'ALL' | 'FLIGHT' | 'STAY' | 'ACTIVITY' | 'TRANSPORT'>('ALL');

    // Sort and filter events to avoid overcrowding
    const sortedEvents = events
        .filter(e => {
            const d = new Date(e.date);
            return d >= startDate && d <= endDate;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Apply User Filter
    const displayEvents = sortedEvents.filter(e => {
        if (filter === 'ALL') return true;
        if (filter === 'FLIGHT') return e.icon === 'plane';
        if (filter === 'STAY') return e.icon === 'building';
        if (filter === 'ACTIVITY') return e.icon === 'ticket';
        if (filter === 'TRANSPORT') return e.icon === 'car' || e.icon === 'train'; // Group ground transport
        return true;
    });

    // Helper to get X position based on date
    // We'll use equal spacing for events instead of strict time-based to ensure legibility of labels
    // But we maintain order.

    // Status Logic
    const now = new Date();
    let status = 'Upcoming Adventure';
    if (now >= startDate && now <= endDate) status = 'Current Adventure';
    if (now > endDate) status = 'Completed Journey';

    return (
        <div className="glass-panel p-8 relative overflow-hidden group h-full flex flex-col">
            {/* Header with Filter Controls */}
            <div className="mb-8 z-10 relative flex justify-between items-start">
                <div>
                    <h3 className="text-[var(--text-secondary)] text-xs font-bold tracking-widest uppercase mb-1">
                        {status}
                    </h3>
                    <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                        {trip.name}
                    </h2>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-glass)] shadow-sm">
                    {(['ALL', 'FLIGHT', 'STAY', 'TRANSPORT', 'ACTIVITY'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`
                                px-2 py-1 text-[9px] font-bold rounded transition-all uppercase tracking-wider
                                ${filter === f
                                    ? 'bg-[var(--accent-cyan)] text-[var(--bg-primary)] shadow-sm'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                                }
                            `}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>
            {/* Visualization Layer */}
            <div className="relative flex-1 min-h-[200px] w-full">
                <svg className="w-full h-full absolute inset-0 text-[var(--text-primary)]" viewBox="0 0 800 120" preserveAspectRatio="none">
                    <defs>
                        <marker id="dot-marker" markerWidth="8" markerHeight="8" refX="4" refY="4">
                            <circle cx="4" cy="4" r="2" fill="currentColor" className="text-emerald-500" />
                        </marker>
                    </defs>

                    {/* Render Connectors & Nodes */}
                    {displayEvents.map((event, i) => {
                        // Calculate absolute grid position
                        // x: 10% (80px) to 90% (720px)
                        const x = 80 + (i * (640 / (Math.max(displayEvents.length - 1, 1))));
                        const isTop = i % 2 === 0;
                        const yCenter = 60; // 50% of 120
                        const yTarget = isTop ? 30 : 90; // 25% or 75%

                        // Bezier Curve
                        // Start at center spine (x, yCenter)
                        // Curve to target (x, yTarget)
                        // Use a simple curve or straight line? The reference usually has curved branches.

                        return (
                            <g key={event.id}>
                                {/* Connector Line */}
                                <path
                                    d={`M ${x} ${yCenter} Q ${x} ${yCenter + ((yTarget - yCenter) / 2)} ${x} ${yTarget}`}
                                    fill="none"
                                    stroke="var(--accent-cyan)"
                                    strokeWidth="2"
                                    className="opacity-60"
                                />

                                {/* Center Node (On Spine) */}
                                <circle cx={x} cy={yCenter} r="4" fill="var(--bg-primary)" stroke="var(--accent-cyan)" strokeWidth="2" />

                                {/* Day Marker Text on Spine - Only show if date changed */}
                                {(i === 0 || new Date(displayEvents[i - 1].date).toDateString() !== new Date(event.date).toDateString()) && (
                                    <text
                                        x={x}
                                        y={yCenter + (isTop ? 20 : -12)}
                                        textAnchor="middle"
                                        fill="var(--text-secondary)"
                                        fontSize="8"
                                        fontWeight="bold"
                                        className="opacity-70"
                                    >
                                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Main Spine */}
                    <path
                        d="M 40 60 L 760 60"
                        stroke="var(--accent-cyan)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="opacity-40"
                        strokeDasharray="4 4"
                    />
                </svg>

                {/* HTML Overlay for Content */}
                {
                    displayEvents.map((event, i) => {
                        // Calculate exact percentage to match SVG logic
                        const xPercent = 10 + (i * (80 / (Math.max(displayEvents.length - 1, 1))));
                        const isTop = i % 2 === 0;
                        const targetY = isTop ? 25 : 75; // Matches SVG yTarget (30/120 and 90/120)

                        const Icon = IconMap[event.icon as keyof typeof IconMap] || Ticket;
                        const cleanTitle = event.title.replace(/^(In:|Out:)\s*/, '');
                        const category = event.icon === 'building' ? 'STAY' :
                            event.icon === 'plane' ? 'FLIGHT' :
                                event.icon === 'car' ? 'TRANSPORT' : 'ACTIVITY';

                        return (
                            <div
                                key={event.id}
                                className={`absolute flex items-center justify-center w-8 h-8 ${onEventClick ? 'cursor-pointer' : ''}`}
                                style={{
                                    left: `${xPercent}%`,
                                    top: `${targetY}%`,
                                    transform: 'translate(-50%, -50%)', // Centers this 32x32 div exactly on the coordinate
                                }}
                                onClick={() => onEventClick?.(event)}
                            >
                                {/* Icon Circle */}
                                <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center 
                                border-2 shadow-lg z-10 hover:scale-110 transition-transform cursor-pointer
                                ${isTop ? 'bg-[var(--accent-cyan)] border-[var(--bg-primary)] text-[var(--bg-primary)]' : 'bg-[var(--bg-primary)] border-[var(--accent-cyan)] text-[var(--accent-cyan)]'}
                            `}>
                                    <Icon size={14} strokeWidth={3} />
                                </div>

                                {/* Text Block - Absolute relative to the Icon center to avoid shifting layout */}
                                <div className={`absolute w-32 text-center pointer-events-none ${isTop ? 'bottom-full mb-3' : 'top-full mt-3'}`}>
                                    <p className="text-[9px] font-bold tracking-widest text-[var(--text-secondary)] uppercase mb-0.5">
                                        {category}
                                    </p>
                                    <p className="text-[11px] font-bold text-[var(--text-primary)] leading-tight line-clamp-2">
                                        {cleanTitle}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                }
            </div >
        </div >
    );
}
