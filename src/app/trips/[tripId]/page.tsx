'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar, MainPanel, TripTabs, TripBackground } from '@/components/layout';
import { useTrips } from '@/contexts/TripContext';
import { Trip } from '@/types';
import { getTrip, getTripStats } from '@/lib/dataService';
import {
    MapPin,
    Calendar,
    Plane,
    Building2,
    Car,
    Train,
    Ticket,
    Receipt,
    Edit,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { TripModal } from '@/components/trips';

export default function TripOverviewPage() {
    const params = useParams();
    const tripId = params.tripId as string;
    const { setCurrentTrip, refreshTrips } = useTrips();

    const [trip, setTrip] = useState<Trip | null>(null);
    const [stats, setStats] = useState<ReturnType<typeof getTripStats> | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    // Stat cards configuration
    const statCards = [
        { label: 'Flights', value: stats?.flights || 0, icon: Plane, color: 'var(--accent-blue)', href: `/trips/${tripId}/flights` },
        { label: 'Stays', value: stats?.accommodations || 0, icon: Building2, color: 'var(--accent-green)', href: `/trips/${tripId}/accommodations` },
        { label: 'Car Rentals', value: stats?.cars || 0, icon: Car, color: 'var(--accent-orange)', href: `/trips/${tripId}/cars` },
        { label: 'Trains', value: stats?.trains || 0, icon: Train, color: 'var(--accent-orange)', href: `/trips/${tripId}/trains` },
        { label: 'Activities', value: stats?.excursions || 0, icon: Ticket, color: 'var(--accent-purple)', href: `/trips/${tripId}/excursions` },
        { label: 'Expenses', value: `$${stats?.totalExpenses || 0}`, icon: Receipt, color: 'var(--text-muted)', href: `/trips/${tripId}/expenses` },
    ];

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

                {/* Trip Info Card */}
                <div className="glass-panel p-6 mb-8">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] flex items-center justify-center shadow-lg">
                            <MapPin className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-5 h-5 text-[var(--text-secondary)]" />
                                <span className="text-[var(--text-primary)]">
                                    {formatDate(startDate)} — {formatDate(endDate)}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 rounded-full bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] text-sm font-medium">
                                    {duration} {duration === 1 ? 'day' : 'days'}
                                </span>
                                {trip.status === 'archived' && (
                                    <span className="px-3 py-1 rounded-full bg-[var(--text-muted)]/20 text-[var(--text-muted)] text-sm font-medium">
                                        Archived
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {trip.notes && (
                        <div className="mt-4 pt-4 border-t border-[var(--border-glass)]">
                            <p className="text-[var(--text-secondary)] text-sm">{trip.notes}</p>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Trip Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Link key={stat.label} href={stat.href}>
                                <div className="glass-card p-5 text-center group cursor-pointer h-full">
                                    <div
                                        className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110"
                                        style={{ background: `${stat.color}20` }}
                                    >
                                        <Icon className="w-6 h-6" style={{ color: stat.color }} />
                                    </div>
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                                    <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href={`/trips/${tripId}/flights`} className="glass-card p-6 group">
                        <Plane className="w-8 h-8 text-[var(--accent-blue)] mb-3" />
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Add Flight</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Add your flight bookings</p>
                    </Link>
                    <Link href={`/trips/${tripId}/accommodations`} className="glass-card p-6 group">
                        <Building2 className="w-8 h-8 text-[var(--accent-green)] mb-3" />
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Add Accommodation</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Add hotels and stays</p>
                    </Link>
                    <Link href={`/trips/${tripId}/excursions`} className="glass-card p-6 group">
                        <Ticket className="w-8 h-8 text-[var(--accent-purple)] mb-3" />
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Add Activity</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Plan tours and excursions</p>
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
        </TripBackground>
    );
}
