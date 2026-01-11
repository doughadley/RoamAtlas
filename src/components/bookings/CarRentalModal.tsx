'use client';

import { useState, useEffect } from 'react';
import { X, Car, MapPin, Clock, Hash, DollarSign, Calendar, Building2 } from 'lucide-react';
import { createCar, updateCar } from '@/lib/dataService';
import { CarRental } from '@/types';

interface CarRentalModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    car?: CarRental | null;
    onSave?: () => void;
}

export default function CarRentalModal({ isOpen, onClose, tripId, car, onSave }: CarRentalModalProps) {
    const [company, setCompany] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [dropoffLocation, setDropoffLocation] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [dropoffDate, setDropoffDate] = useState('');
    const [dropoffTime, setDropoffTime] = useState('');
    const [confirmationNumber, setConfirmationNumber] = useState('');
    const [cost, setCost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!car;

    useEffect(() => {
        if (car) {
            setCompany(car.company);
            setPickupLocation(car.pickupLocation);
            setDropoffLocation(car.dropoffLocation);
            const pickDate = new Date(car.pickupDateTime);
            const dropDate = new Date(car.dropoffDateTime);
            setPickupDate(pickDate.toISOString().split('T')[0]);
            setPickupTime(pickDate.toTimeString().slice(0, 5));
            setDropoffDate(dropDate.toISOString().split('T')[0]);
            setDropoffTime(dropDate.toTimeString().slice(0, 5));
            setConfirmationNumber(car.confirmationNumber || '');
            setCost(car.costAmount?.toString() || '');
        } else {
            resetForm();
        }
        setError('');
    }, [car, isOpen]);

    const resetForm = () => {
        setCompany('');
        setPickupLocation('');
        setDropoffLocation('');
        setPickupDate('');
        setPickupTime('');
        setDropoffDate('');
        setDropoffTime('');
        setConfirmationNumber('');
        setCost('');
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const pickupDateTime = `${pickupDate}T${pickupTime}:00`;
            const dropoffDateTime = `${dropoffDate}T${dropoffTime}:00`;

            if (new Date(dropoffDateTime) < new Date(pickupDateTime)) {
                setError('Drop-off must be after pickup');
                setIsLoading(false);
                return;
            }

            const carData = {
                tripId,
                company,
                pickupLocation,
                dropoffLocation,
                pickupDateTime,
                dropoffDateTime,
                confirmationNumber: confirmationNumber || undefined,
                costAmount: cost ? parseFloat(cost) : undefined,
                costCurrency: cost ? 'USD' : undefined,
            };

            if (isEditing && car) {
                updateCar(car.id, carData);
            } else {
                createCar(carData);
            }

            onSave?.();
            onClose();
            resetForm();
        } catch (err) {
            setError('Failed to save. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-xl bg-[#0F172A] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Car className="w-5 h-5 text-[var(--accent-purple)]" />
                        {isEditing ? 'Edit' : 'Add'} Car Rental
                    </h2>
                    <button onClick={onClose} className="p-2 ml-auto text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">{error}</div>
                    )}

                    {/* Company */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            <Building2 className="w-4 h-4 inline mr-1" /> Rental Company
                        </label>
                        <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g., Hertz, Enterprise"
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                            required
                        />
                    </div>

                    {/* Pickup & Dropoff Locations */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" /> Pickup Location
                            </label>
                            <input
                                type="text"
                                value={pickupLocation}
                                onChange={(e) => setPickupLocation(e.target.value)}
                                placeholder="e.g., Denver Airport"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" /> Drop-off Location
                            </label>
                            <input
                                type="text"
                                value={dropoffLocation}
                                onChange={(e) => setDropoffLocation(e.target.value)}
                                placeholder="e.g., Denver Airport"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                                required
                            />
                        </div>
                    </div>

                    {/* Pickup Date/Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" /> Pickup Date
                            </label>
                            <input
                                type="date"
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <Clock className="w-4 h-4 inline mr-1" /> Time
                            </label>
                            <input
                                type="time"
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                                required
                            />
                        </div>
                    </div>

                    {/* Dropoff Date/Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" /> Drop-off Date
                            </label>
                            <input
                                type="date"
                                value={dropoffDate}
                                onChange={(e) => setDropoffDate(e.target.value)}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <Clock className="w-4 h-4 inline mr-1" /> Time
                            </label>
                            <input
                                type="time"
                                value={dropoffTime}
                                onChange={(e) => setDropoffTime(e.target.value)}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                                required
                            />
                        </div>
                    </div>

                    {/* Confirmation & Cost */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <Hash className="w-4 h-4 inline mr-1" /> Confirmation #
                            </label>
                            <input
                                type="text"
                                value={confirmationNumber}
                                onChange={(e) => setConfirmationNumber(e.target.value)}
                                placeholder="Optional"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <DollarSign className="w-4 h-4 inline mr-1" /> Cost (USD)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                placeholder="0.00"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={isLoading} className="btn-primary">
                            {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
