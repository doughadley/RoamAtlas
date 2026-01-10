'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, FileText, Plane } from 'lucide-react';
import { Trip, createTrip, updateTrip } from '@/lib/dataService';

interface TripModalProps {
    isOpen: boolean;
    onClose: () => void;
    trip?: Trip | null;
    onSave?: (trip: Trip) => void;
}

export default function TripModal({ isOpen, onClose, trip, onSave }: TripModalProps) {
    const [name, setName] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!trip;

    // Populate form when editing
    useEffect(() => {
        if (trip) {
            setName(trip.name);
            setDestination(trip.primaryDestination);
            setStartDate(trip.startDate);
            setEndDate(trip.endDate);
            setNotes(trip.notes || '');
        } else {
            // Reset form for new trip
            setName('');
            setDestination('');
            setStartDate('');
            setEndDate('');
            setNotes('');
        }
        setError('');
    }, [trip, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Validate dates
            if (new Date(endDate) < new Date(startDate)) {
                setError('End date must be after start date');
                setIsLoading(false);
                return;
            }

            let savedTrip: Trip | undefined;

            if (isEditing && trip) {
                savedTrip = updateTrip(trip.id, {
                    name,
                    primaryDestination: destination,
                    startDate,
                    endDate,
                    notes,
                });
            } else {
                savedTrip = createTrip({
                    name,
                    primaryDestination: destination,
                    startDate,
                    endDate,
                    notes,
                    status: 'active',
                });
            }

            if (savedTrip && onSave) {
                onSave(savedTrip);
            }

            onClose();
        } catch (err) {
            setError('Failed to save trip. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="glass-panel relative z-10 w-full max-w-lg p-8 mx-4 animate-slide-up">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors"
                >
                    <X className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <Plane className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        {isEditing ? 'Edit Trip' : 'Create New Trip'}
                    </h2>
                    <p className="text-[var(--text-secondary)] mt-2">
                        {isEditing ? 'Update your trip details' : 'Start planning your next adventure'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Trip Name */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Trip Name *
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Summer Vacation 2026"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="glass-input pl-12"
                                required
                            />
                        </div>
                    </div>

                    {/* Destination */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Primary Destination *
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Paris, France"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="glass-input pl-12"
                                required
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Start Date *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="glass-input pl-12"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                End Date *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="glass-input pl-12"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            placeholder="Any additional notes about your trip..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="glass-input min-h-[100px] resize-none"
                            rows={3}
                        />
                    </div>

                    {error && (
                        <p className="text-[var(--accent-red)] text-sm text-center bg-[var(--accent-red)]/10 py-2 rounded-lg">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="glass-button flex-1 py-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isEditing ? 'Save Changes' : 'Create Trip'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
