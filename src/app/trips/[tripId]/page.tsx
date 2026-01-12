'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar, MainPanel, TripTabs, TripBackground } from '@/components/layout';
import { useTrips } from '@/contexts/TripContext';
import { Trip } from '@/types';
import { getTrip, getTripStats, getExpenseBreakdown, getFlights, getAccommodations, getCars, getTrains, getExcursions } from '@/lib/dataService';
import {
    MapPin,
    Calendar,
    Plane,
    Building2,
    Car,
    Ticket,
    Receipt,
    Edit,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { TripModal } from '@/components/trips';
import JourneyHero from '@/components/overview/JourneyHero';
import BudgetWidget from '@/components/overview/BudgetWidget';
import ExpenseWidget from '@/components/overview/ExpenseWidget';
import UpcomingWidget from '@/components/overview/UpcomingWidget';
import MapWidget from '@/components/overview/MapWidget';
import { aggregateCalendarEvents, CalendarEvent } from '@/components/calendar/calendarUtils';
import FlightModal from '@/components/bookings/FlightModal';
import AccommodationModal from '@/components/bookings/AccommodationModal';
import TransportModal from '@/components/bookings/TransportModal';
import ExcursionModal from '@/components/bookings/ExcursionModal';
import CarRentalModal from '@/components/bookings/CarRentalModal';
import { Flight, Accommodation, CarRental, Train, Excursion } from '@/types';

export default function TripOverviewPage() {
    const params = useParams();
    const tripId = params.tripId as string;
    const { setCurrentTrip, refreshTrips } = useTrips();

    const [trip, setTrip] = useState<Trip | null>(null);
    const [stats, setStats] = useState<ReturnType<typeof getTripStats> | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    useEffect(() => {
        if (tripId) {
            const loadedTrip = getTrip(tripId);
            setTrip(loadedTrip || null);
            if (loadedTrip) {
                setCurrentTrip(tripId);
                setStats(getTripStats(tripId));
            }
            setIsLoading(false);
        }
    }, [tripId, setCurrentTrip]);

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
                        <p className="text-[var(--text-secondary)] mb-6">
                            This trip may have been deleted or doesn't exist.
                        </p>
                        <Link href="/trips" className="btn-primary inline-flex items-center gap-2">
                            <ArrowLeft className="w-5 h-5" />
                            Back to Trips
                        </Link>
                    </div>
                </MainPanel>
            </>
        );
    }

    // Format dates
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Aggregate calendar events for upcoming widget
    const calendarEvents = aggregateCalendarEvents(
        getFlights(tripId),
        getAccommodations(tripId),
        getExcursions(tripId),
        getCars(tripId),
        getTrains(tripId)
    );

    const expenseBreakdown = getExpenseBreakdown(tripId);

    const handleTripUpdated = () => {
        const updatedTrip = getTrip(tripId);
        setTrip(updatedTrip || null);
        refreshTrips();
    };

    return (
        <TripBackground destination={trip.primaryDestination}>
            <Sidebar />
            <MainPanel
                title={trip.name}
                subtitle={trip.primaryDestination}
                actions={
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="glass-button flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Trip
                    </button>
                }
            >
                {/* Trip Navigation Tabs */}
                <TripTabs tripId={tripId} />

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left Main Column */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Journey Timeline */}
                        <div className="h-[400px]">
                            <JourneyHero trip={trip} events={calendarEvents} onEventClick={setSelectedEvent} />
                        </div>
                        {/* Map Explored Cities */}
                        <div className="h-[300px]">
                            <MapWidget trip={trip} />
                        </div>
                    </div>

                    {/* Right Info Column */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        {/* Budget/Cost Donut */}
                        <div className="h-[350px]">
                            <BudgetWidget trip={trip} breakdown={expenseBreakdown} />
                        </div>
                        {/* Upcoming Events */}
                        <div className="min-h-[250px]">
                            <UpcomingWidget events={calendarEvents} />
                        </div>
                        {/* Expenses Bar Chart */}
                        <div className="h-[300px]">
                            <ExpenseWidget breakdown={expenseBreakdown} />
                        </div>
                    </div>
                </div>

                {/* Quick Actions Footer - moved to a simpler row if needed, or kept as is? 
                    The design doesn't explicitly show quick actions buttons, but we should keep them for functionality.
                */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href={`/trips/${tripId}/flights`} className="glass-card p-6 group hover:translate-y-[-2px] transition-transform">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[var(--accent-blue)]/20 flex items-center justify-center">
                                <Plane className="w-6 h-6 text-[var(--accent-blue)]" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--text-primary)]">Add Flight</h3>
                                <p className="text-xs text-[var(--text-secondary)]">Create a new booking</p>
                            </div>
                        </div>
                    </Link>
                    <Link href={`/trips/${tripId}/accommodations`} className="glass-card p-6 group hover:translate-y-[-2px] transition-transform">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[var(--accent-green)]/20 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-[var(--accent-green)]" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--text-primary)]">Add Stay</h3>
                                <p className="text-xs text-[var(--text-secondary)]">Book a hotel room</p>
                            </div>
                        </div>
                    </Link>
                    <Link href={`/trips/${tripId}/excursions`} className="glass-card p-6 group hover:translate-y-[-2px] transition-transform">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[var(--accent-purple)]/20 flex items-center justify-center">
                                <Ticket className="w-6 h-6 text-[var(--accent-purple)]" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--text-primary)]">Add Activity</h3>
                                <p className="text-xs text-[var(--text-secondary)]">Plan an excursion</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </MainPanel>

            {/* Edit Modal */}
            <TripModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                trip={trip}
                onSave={handleTripUpdated}
            />

            {/* Event Detail Modals */}
            {selectedEvent?.type === 'flight' && (
                <FlightModal
                    isOpen={true}
                    onClose={() => setSelectedEvent(null)}
                    tripId={tripId}
                    flight={selectedEvent.data as Flight}
                    onSave={handleTripUpdated}
                />
            )}
            {selectedEvent?.type === 'accommodation' && (
                <AccommodationModal
                    isOpen={true}
                    onClose={() => setSelectedEvent(null)}
                    tripId={tripId}
                    accommodation={selectedEvent.data as Accommodation}
                    onSave={handleTripUpdated}
                />
            )}
            {selectedEvent?.type === 'excursion' && (
                <ExcursionModal
                    isOpen={true}
                    onClose={() => setSelectedEvent(null)}
                    tripId={tripId}
                    excursion={selectedEvent.data as Excursion}
                    onSave={handleTripUpdated}
                />
            )}
            {selectedEvent?.type === 'car' && (
                <CarRentalModal
                    isOpen={true}
                    onClose={() => setSelectedEvent(null)}
                    tripId={tripId}
                    car={selectedEvent.data as CarRental}
                    onSave={handleTripUpdated}
                />
            )}
            {selectedEvent?.type === 'train' && (
                <TransportModal
                    isOpen={true}
                    onClose={() => setSelectedEvent(null)}
                    tripId={tripId}
                    transport={selectedEvent.data as Train}
                    defaultType="train"
                    onSave={handleTripUpdated}
                />
            )}
        </TripBackground>
    );
}
