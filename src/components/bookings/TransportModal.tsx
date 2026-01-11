'use client';

import { useState, useEffect } from 'react';
import { X, Train, Bus, MapPin, Clock, Hash, DollarSign, Calendar, Building2 } from 'lucide-react';
import { createTrain, updateTrain } from '@/lib/dataService';
import { Train as TrainType } from '@/types';

interface TransportModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    transport?: TrainType | null;
    onSave?: () => void;
    defaultType?: 'train' | 'bus';
}

export default function TransportModal({ isOpen, onClose, tripId, transport, onSave, defaultType = 'train' }: TransportModalProps) {
    const [type, setType] = useState<'train' | 'bus'>(defaultType);
    const [operator, setOperator] = useState('');
    const [serviceNumber, setServiceNumber] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [arrivalDate, setArrivalDate] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [confirmationNumber, setConfirmationNumber] = useState('');
    const [seatInfo, setSeatInfo] = useState('');
    const [cost, setCost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!transport;

    useEffect(() => {
        if (transport) {
            setType(transport.type);
            setOperator(transport.operator);
            setServiceNumber(transport.serviceNumber);
            setOrigin(transport.origin);
            setDestination(transport.destination);
            const depDate = new Date(transport.departureDateTime);
            const arrDate = new Date(transport.arrivalDateTime);
            setDepartureDate(depDate.toISOString().split('T')[0]);
            setDepartureTime(depDate.toTimeString().slice(0, 5));
            setArrivalDate(arrDate.toISOString().split('T')[0]);
            setArrivalTime(arrDate.toTimeString().slice(0, 5));
            setConfirmationNumber(transport.confirmationNumber || '');
            setSeatInfo(transport.seatInfo || '');
            setCost(transport.costAmount?.toString() || '');
        } else {
            resetForm();
        }
        setError('');
    }, [transport, isOpen]);

    const resetForm = () => {
        setType(defaultType);
        setOperator('');
        setServiceNumber('');
        setOrigin('');
        setDestination('');
        setDepartureDate('');
        setDepartureTime('');
        setArrivalDate('');
        setArrivalTime('');
        setConfirmationNumber('');
        setSeatInfo('');
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

            const transportData = {
                tripId,
                type,
                operator,
                serviceNumber,
                origin,
                destination,
                departureDateTime,
                arrivalDateTime,
                confirmationNumber: confirmationNumber || undefined,
                seatInfo: seatInfo || undefined,
                costAmount: cost ? parseFloat(cost) : undefined,
                costCurrency: cost ? 'USD' : undefined,
            };

            if (isEditing && transport) {
                updateTrain(transport.id, transportData);
            } else {
                createTrain(transportData);
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
                        {type === 'train' ? <Train className="w-5 h-5 text-[var(--accent-orange)]" /> : <Bus className="w-5 h-5 text-[var(--accent-green)]" />}
                        {isEditing ? 'Edit' : 'Add'} {type === 'train' ? 'Train' : 'Bus'} Journey
                    </h2>
                    <button onClick={onClose} className="p-2 ml-auto text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Type Toggle */}
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setType('train')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${type === 'train' ? 'bg-[var(--accent-orange)] text-white' : 'text-white/60 hover:text-white'}`}
                        >
                            <Train className="w-4 h-4" /> Train
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('bus')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${type === 'bus' ? 'bg-[var(--accent-green)] text-white' : 'text-white/60 hover:text-white'}`}
                        >
                            <Bus className="w-4 h-4" /> Bus
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">{error}</div>
                    )}

                    {/* Operator & Service Number */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <Building2 className="w-4 h-4 inline mr-1" /> Operator
                            </label>
                            <input
                                type="text"
                                value={operator}
                                onChange={(e) => setOperator(e.target.value)}
                                placeholder={type === 'train' ? 'e.g., Amtrak' : 'e.g., FlixBus'}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <Hash className="w-4 h-4 inline mr-1" /> Service #
                            </label>
                            <input
                                type="text"
                                value={serviceNumber}
                                onChange={(e) => setServiceNumber(e.target.value)}
                                placeholder="e.g., 123"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                            />
                        </div>
                    </div>

                    {/* Origin & Destination */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" /> Origin
                            </label>
                            <input
                                type="text"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                placeholder="e.g., New York"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" /> Destination
                            </label>
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="e.g., Boston"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                                required
                            />
                        </div>
                    </div>

                    {/* Departure */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" /> Departure Date
                            </label>
                            <input
                                type="date"
                                value={departureDate}
                                onChange={(e) => setDepartureDate(e.target.value)}
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
                                value={departureTime}
                                onChange={(e) => setDepartureTime(e.target.value)}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                                required
                            />
                        </div>
                    </div>

                    {/* Arrival */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" /> Arrival Date
                            </label>
                            <input
                                type="date"
                                value={arrivalDate}
                                onChange={(e) => setArrivalDate(e.target.value)}
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
                                value={arrivalTime}
                                onChange={(e) => setArrivalTime(e.target.value)}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                                required
                            />
                        </div>
                    </div>

                    {/* Confirmation, Seat, Cost */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Confirmation #</label>
                            <input
                                type="text"
                                value={confirmationNumber}
                                onChange={(e) => setConfirmationNumber(e.target.value)}
                                placeholder="Optional"
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Seat Info</label>
                            <input
                                type="text"
                                value={seatInfo}
                                onChange={(e) => setSeatInfo(e.target.value)}
                                placeholder="e.g., Car 5, Seat 12"
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
