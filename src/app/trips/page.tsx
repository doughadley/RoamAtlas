'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Sidebar, MainPanel } from '@/components/layout';
import { TripModal, TripCard } from '@/components/trips';
import { useTrips } from '@/contexts/TripContext';
import { deleteTrip, updateTrip } from '@/lib/dataService';
import { Trip } from '@/types';
import { Plus, MapPin, Archive } from 'lucide-react';
import Link from 'next/link';

export default function TripsPage() {
    const router = useRouter();
    const { trips, currentTrip, refreshTrips, setCurrentTrip } = useTrips();
    const [showTripModal, setShowTripModal] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
    const [showArchived, setShowArchived] = useState(false);

    // Filter trips
    const activeTrips = trips.filter(t => t.status === 'active');
    const archivedTrips = trips.filter(t => t.status === 'archived');
    const displayedTrips = showArchived ? archivedTrips : activeTrips;

    const handleCreateTrip = () => {
        setEditingTrip(null);
        setShowTripModal(true);
    };

    const handleEditTrip = (trip: Trip) => {
        setEditingTrip(trip);
        setShowTripModal(true);
    };

    const handleArchiveTrip = (trip: Trip) => {
        updateTrip(trip.id, {
            status: trip.status === 'archived' ? 'active' : 'archived'
        });
        refreshTrips();
    };

    const handleDeleteTrip = (trip: Trip) => {
        if (confirm(`Are you sure you want to delete "${trip.name}"? This action cannot be undone.`)) {
            deleteTrip(trip.id);
            if (currentTrip?.id === trip.id) {
                setCurrentTrip(null);
            }
            refreshTrips();
        }
    };

    const handleSelectTrip = (trip: Trip) => {
        setCurrentTrip(trip.id);
    };

    const handleTripSaved = (savedTrip: Trip) => {
        refreshTrips();
        // If it's a new trip (not editing), redirect to it immediately
        if (!editingTrip) {
            router.push(`/trips/${savedTrip.id}`);
        }
    };

    return (
        <>
            <Sidebar />
            <MainPanel
                title="My Trips"
                subtitle={`${activeTrips.length} active trip${activeTrips.length !== 1 ? 's' : ''}`}
                actions={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={`glass-button flex items-center gap-2 text-sm ${showArchived ? 'text-[var(--accent-cyan)]' : ''}`}
                        >
                            <Archive className="w-4 h-4" />
                            {showArchived ? 'Show Active' : 'Show Archived'}
                        </button>
                        <button
                            onClick={handleCreateTrip}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            New Trip
                        </button>
                    </div>
                }
            >
                {displayedTrips.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedTrips.map((trip) => (
                            <Link key={trip.id} href={`/trips/${trip.id}`}>
                                <TripCard
                                    trip={trip}
                                    isSelected={currentTrip?.id === trip.id}
                                    onSelect={handleSelectTrip}
                                    onEdit={handleEditTrip}
                                    onArchive={handleArchiveTrip}
                                    onDelete={handleDeleteTrip}
                                />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel p-12 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] mx-auto mb-6 flex items-center justify-center shadow-lg">
                            <MapPin className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                            {showArchived ? 'No archived trips' : 'No trips yet'}
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                            {showArchived
                                ? 'Trips you archive will appear here.'
                                : 'Create your first trip to start organizing your travel plans.'}
                        </p>
                        {!showArchived && (
                            <button onClick={handleCreateTrip} className="btn-primary text-lg px-8 py-3">
                                <span className="flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Create Your First Trip
                                </span>
                            </button>
                        )}
                    </div>
                )}
            </MainPanel>

            {/* Trip Modal */}
            <TripModal
                isOpen={showTripModal}
                onClose={() => setShowTripModal(false)}
                trip={editingTrip}
                onSave={handleTripSaved}
            />
        </>
    );
}
