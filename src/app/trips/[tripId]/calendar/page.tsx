'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar, MainPanel } from '@/components/layout';
import { TripCalendar, aggregateCalendarEvents } from '@/components/calendar';
import { Trip } from '@/types';
import { getTrip, getFlights, getAccommodations, getExcursions, getCars, getTrains } from '@/lib/dataService';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
    const params = useParams();
    const tripId = params.tripId as string;

    const [trip, setTrip] = useState<Trip | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (tripId) {
            const loadedTrip = getTrip(tripId);
            setTrip(loadedTrip || null);
            setIsLoading(false);
        }
    }, [tripId]);

    // Aggregate all events
    const calendarEvents = useMemo(() => {
        if (!tripId) return [];

        const flights = getFlights(tripId);
        const accommodations = getAccommodations(tripId);
        const excursions = getExcursions(tripId);
        const cars = getCars(tripId);
        const trains = getTrains(tripId);

        return aggregateCalendarEvents(flights, accommodations, excursions, cars, trains);
    }, [tripId]);

    if (isLoading) {
        return (
            <>
                <Sidebar />
                <MainPanel>
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-[var(--accent-blue)]/30 border-t-[var(--accent-blue)] rounded-full animate-spin" />
                    </div>
                </MainPanel>
            </>
        );
    }

    if (!trip) {
        return (
            <>
                <Sidebar />
                <MainPanel>
                    <div className="glass-panel p-12 text-center">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Trip not found</h2>
                        <Link href="/trips" className="btn-primary inline-flex items-center gap-2">
                            <ArrowLeft className="w-5 h-5" /> Back to Trips
                        </Link>
                    </div>
                </MainPanel>
            </>
        );
    }

    return (
        <>
            <Sidebar />
            <MainPanel
                title="Trip Calendar"
                subtitle={trip.name}
                actions={
                    <Link href={`/trips/${tripId}`} className="glass-button flex items-center gap-2 text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Overview
                    </Link>
                }
            >
                {calendarEvents.length > 0 ? (
                    <TripCalendar
                        events={calendarEvents}
                        tripStartDate={trip.startDate}
                        tripEndDate={trip.endDate}
                    />
                ) : (
                    <div className="glass-panel p-12 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-[var(--accent-cyan)]/20 mx-auto mb-6 flex items-center justify-center">
                            <Calendar className="w-10 h-10 text-[var(--accent-cyan)]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">No events yet</h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            Add flights, accommodations, or activities to see them on the calendar.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Link href={`/trips/${tripId}/flights`} className="btn-primary">Add Flight</Link>
                            <Link href={`/trips/${tripId}/accommodations`} className="glass-button">Add Stay</Link>
                            <Link href={`/trips/${tripId}/excursions`} className="glass-button">Add Activity</Link>
                        </div>
                    </div>
                )}
            </MainPanel>
        </>
    );
}
