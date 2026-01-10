'use client';

import { useState, useEffect } from 'react';
import { X, Building2, MapPin, Calendar, DollarSign, Hash } from 'lucide-react';
import { Accommodation, createAccommodation, updateAccommodation } from '@/lib/dataService';

interface AccommodationModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    accommodation?: Accommodation | null;
    onSave?: () => void;
}

export default function AccommodationModal({ isOpen, onClose, tripId, accommodation, onSave }: AccommodationModalProps) {
    const [propertyName, setPropertyName] = useState('');
    const [address, setAddress] = useState('');
    const [checkInDate, setCheckInDate] = useState('');
    const [checkInTime, setCheckInTime] = useState('15:00');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [checkOutTime, setCheckOutTime] = useState('11:00');
    const [confirmationNumber, setConfirmationNumber] = useState('');
    const [cost, setCost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!accommodation;

    useEffect(() => {
        if (accommodation) {
            setPropertyName(accommodation.propertyName);
            setAddress(accommodation.address);
            const checkIn = new Date(accommodation.checkInDateTime);
            const checkOut = new Date(accommodation.checkOutDateTime);
            setCheckInDate(checkIn.toISOString().split('T')[0]);
            setCheckInTime(checkIn.toTimeString().slice(0, 5));
            setCheckOutDate(checkOut.toISOString().split('T')[0]);
            setCheckOutTime(checkOut.toTimeString().slice(0, 5));
            setConfirmationNumber(accommodation.confirmationNumber || '');
            setCost(accommodation.costAmount?.toString() || '');
        } else {
            setPropertyName(''); setAddress(''); setCheckInDate(''); setCheckInTime('15:00');
            setCheckOutDate(''); setCheckOutTime('11:00'); setConfirmationNumber(''); setCost('');
        }
        setError('');
    }, [accommodation, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const checkInDateTime = `${checkInDate}T${checkInTime}:00`;
            const checkOutDateTime = `${checkOutDate}T${checkOutTime}:00`;

            if (new Date(checkOutDateTime) <= new Date(checkInDateTime)) {
                setError('Check-out must be after check-in');
                setIsLoading(false);
                return;
            }

            const data = {
                tripId, propertyName, address, checkInDateTime, checkOutDateTime,
                confirmationNumber: confirmationNumber || undefined,
                costAmount: cost ? parseFloat(cost) : undefined,
                costCurrency: cost ? 'USD' : undefined,
            };

            if (isEditing && accommodation) {
                updateAccommodation(accommodation.id, data);
            } else {
                createAccommodation(data);
            }
            onSave?.();
            onClose();
        } catch (err) {
            setError('Failed to save. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="glass-panel relative z-10 w-full max-w-lg p-8 mx-4 animate-slide-up max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--bg-glass-hover)]">
                    <X className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-green)] to-emerald-400 mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">{isEditing ? 'Edit Accommodation' : 'Add Accommodation'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Property Name *</label>
                        <input type="text" placeholder="Hotel Roma" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} className="glass-input" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Address *</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input type="text" placeholder="Via Roma 123, Rome, Italy" value={address} onChange={(e) => setAddress(e.target.value)} className="glass-input pl-10" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Check-in *</label>
                            <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} className="glass-input mb-2" required />
                            <input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className="glass-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Check-out *</label>
                            <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} className="glass-input mb-2" required />
                            <input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className="glass-input" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Confirmation #</label>
                            <input type="text" placeholder="ABC123" value={confirmationNumber} onChange={(e) => setConfirmationNumber(e.target.value)} className="glass-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Total Cost</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input type="number" step="0.01" placeholder="500.00" value={cost} onChange={(e) => setCost(e.target.value)} className="glass-input pl-10" />
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-[var(--accent-red)] text-sm text-center bg-[var(--accent-red)]/10 py-2 rounded-lg">{error}</p>}
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="glass-button flex-1 py-3">Cancel</button>
                        <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-3 disabled:opacity-50">
                            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : (isEditing ? 'Save' : 'Add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
