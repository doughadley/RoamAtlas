'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar, MainPanel, TripTabs } from '@/components/layout';
import { FlightModal, FlightCard, FlightImportModal } from '@/components/bookings';
import { Flight } from '@/types';
import { getFlights, deleteFlight, getTrip } from '@/lib/dataService';
import { Plus, Plane, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';

export default function FlightsPage() {
    const params = useParams();
    const tripId = params.tripId as string;

    const [flights, setFlights] = useState<Flight[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
    const [tripName, setTripName] = useState('');

    useEffect(() => {
        loadFlights();
        const trip = getTrip(tripId);
        if (trip) setTripName(trip.name);
    }, [tripId]);

    // ... loadFlights ...
    const loadFlights = () => {
        const data = getFlights(tripId);
        data.sort((a, b) => new Date(a.departureDateTime).getTime() - new Date(b.departureDateTime).getTime());
        setFlights(data);
    };

    const handleAddFlight = () => {
        setEditingFlight(null);
        setShowModal(true);
    };

    const handleEditFlight = (flight: Flight) => {
        setEditingFlight(flight);
        setShowModal(true);
    };

    const handleDeleteFlight = (flight: Flight) => {
        if (confirm(`Delete flight ${flight.flightNumber}?`)) {
            deleteFlight(flight.id);
            loadFlights();
        }
    };

    return (
        <>
            <Sidebar />
            <MainPanel
                title="Flights"
                subtitle={tripName}
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => setShowImportModal(true)} className="btn-glass flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            <span className="hidden sm:inline">Import</span>
                        </button>
                        <button onClick={handleAddFlight} className="btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" /> Add Flight
                        </button>
                    </div>
                }
            >
                <TripTabs tripId={tripId} />

                {flights.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {flights.map((flight) => (
                            <FlightCard
                                key={flight.id}
                                flight={flight}
                                onEdit={handleEditFlight}
                                onDelete={handleDeleteFlight}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel p-12 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-[var(--accent-blue)]/20 mx-auto mb-6 flex items-center justify-center">
                            <Plane className="w-10 h-10 text-[var(--accent-blue)]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">No flights yet</h2>
                        <p className="text-[var(--text-secondary)] mb-6">Add your first flight or import from email.</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowImportModal(true)} className="btn-secondary flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Import from Text
                            </button>
                            <button onClick={handleAddFlight} className="btn-primary flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Flight
                            </button>
                        </div>
                    </div>
                )}
            </MainPanel>

            <FlightModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                tripId={tripId}
                flight={editingFlight}
                onSave={loadFlights}
            />

            <FlightImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                tripId={tripId}
                onImport={loadFlights}
            />
        </>
    );
}
