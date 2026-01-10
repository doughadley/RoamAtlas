'use client';

import { useState, useEffect } from 'react';
import { X, Plane, MapPin, Clock, Hash, DollarSign, Calendar } from 'lucide-react';
import { Flight, createFlight, updateFlight } from '@/lib/dataService';

interface FlightModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    flight?: Flight | null;
    onSave?: () => void;
}

export default function FlightModal({ isOpen, onClose, tripId, flight, onSave }: FlightModalProps) {
    const [airline, setAirline] = useState('');
    const [flightNumber, setFlightNumber] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [arrivalDate, setArrivalDate] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [confirmationNumber, setConfirmationNumber] = useState('');
    const [cost, setCost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!flight;

    useEffect(() => {
        if (flight) {
            setAirline(flight.airline);
            setFlightNumber(flight.flightNumber);
            setOrigin(flight.origin);
            setDestination(flight.destination);
            // Parse datetime strings
            const depDate = new Date(flight.departureDateTime);
            const arrDate = new Date(flight.arrivalDateTime);
            setDepartureDate(depDate.toISOString().split('T')[0]);
            setDepartureTime(depDate.toTimeString().slice(0, 5));
            setArrivalDate(arrDate.toISOString().split('T')[0]);
            setArrivalTime(arrDate.toTimeString().slice(0, 5));
            setConfirmationNumber(flight.confirmationNumber || '');
            setCost(flight.costAmount?.toString() || '');
        } else {
            resetForm();
        }
        setError('');
    }, [flight, isOpen]);

    const resetForm = () => {
        setAirline('');
        setFlightNumber('');
        setOrigin('');
        setDestination('');
        setDepartureDate('');
        setDepartureTime('');
        setArrivalDate('');
        setArrivalTime('');
        setConfirmationNumber('');
        setCost('');
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const departureDateTime = `${departureDate}T${departureTime}:00`;
            const arrivalDateTime = `${arrivalDate}T${arrivalTime}:00`;

            if (new Date(arrivalDateTime) < new Date(departureDateTime)) {
                setError('Arrival must be after departure');
                setIsLoading(false);
                return;
            }

            const flightData = {
                tripId,
                airline,
                flightNumber,
                origin,
                destination,
                departureDateTime,
                arrivalDateTime,
                confirmationNumber: confirmationNumber || undefined,
                costAmount: cost ? parseFloat(cost) : undefined,
                costCurrency: cost ? 'USD' : undefined,
            };

            if (isEditing && flight) {
                updateFlight(flight.id, flightData);
            } else {
                createFlight(flightData);
            }

            onSave?.();
            onClose();
        } catch (err) {
            setError('Failed to save flight. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="glass-panel relative z-10 w-full max-w-lg p-8 mx-4 animate-slide-up max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors">
                    <X className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <Plane className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        {isEditing ? 'Edit Flight' : 'Add Flight'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Airline *</label>
                            <input type="text" placeholder="United Airlines" value={airline} onChange={(e) => setAirline(e.target.value)} className="glass-input" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Flight # *</label>
                            <input type="text" placeholder="UA 123" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} className="glass-input" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Origin *</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input type="text" placeholder="LAX" value={origin} onChange={(e) => setOrigin(e.target.value)} className="glass-input pl-10" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Destination *</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input type="text" placeholder="FCO" value={destination} onChange={(e) => setDestination(e.target.value)} className="glass-input pl-10" required />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Departure *</label>
                            <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="glass-input mb-2" required />
                            <input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="glass-input" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Arrival *</label>
                            <input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} className="glass-input mb-2" required />
                            <input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className="glass-input" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Confirmation #</label>
                            <input type="text" placeholder="ABC123" value={confirmationNumber} onChange={(e) => setConfirmationNumber(e.target.value)} className="glass-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Cost (USD)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input type="number" step="0.01" placeholder="350.00" value={cost} onChange={(e) => setCost(e.target.value)} className="glass-input pl-10" />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-[var(--accent-red)] text-sm text-center bg-[var(--accent-red)]/10 py-2 rounded-lg">{error}</p>}

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="glass-button flex-1 py-3">Cancel</button>
                        <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-3 disabled:opacity-50">
                            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : (isEditing ? 'Save Changes' : 'Add Flight')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
