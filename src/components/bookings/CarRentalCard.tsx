'use client';

import { Car, Clock, MapPin, Edit2, Trash2, Hash, Calendar } from 'lucide-react';
import { CarRental } from '@/types';

interface CarRentalCardProps {
    car: CarRental;
    onEdit: () => void;
    onDelete: () => void;
}

export default function CarRentalCard({ car, onEdit, onDelete }: CarRentalCardProps) {
    const formatTime = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getDuration = () => {
        const pickup = new Date(car.pickupDateTime);
        const dropoff = new Date(car.dropoffDateTime);
        const diffMs = dropoff.getTime() - pickup.getTime();
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return `${days} day${days !== 1 ? 's' : ''}`;
    };

    return (
        <div className="glass-panel p-6 hover:border-white/20 transition-all group">
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="p-3 rounded-xl flex-shrink-0 bg-[var(--accent-purple)]/20">
                    <Car className="w-6 h-6 text-[var(--accent-purple)]" />
                </div>

                {/* Main Content */}
                <div className="flex-grow min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-white">{car.company}</span>
                        {car.confirmationNumber && (
                            <span className="text-sm text-white/50 flex items-center gap-1">
                                <Hash className="w-3 h-3" /> {car.confirmationNumber}
                            </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]">
                            Car Rental
                        </span>
                    </div>

                    {/* Locations */}
                    <div className="flex items-center gap-3 text-white/80 mb-3">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-white/50" />
                            {car.pickupLocation}
                        </span>
                        {car.pickupLocation !== car.dropoffLocation && (
                            <>
                                <span className="text-white/30">→</span>
                                <span>{car.dropoffLocation}</span>
                            </>
                        )}
                    </div>

                    {/* Time Info */}
                    <div className="flex items-center gap-6 text-sm">
                        <div>
                            <div className="text-white/50 text-xs mb-1">Pickup</div>
                            <div className="text-white font-medium">{formatTime(car.pickupDateTime)}</div>
                            <div className="text-white/50 text-xs">{formatDate(car.pickupDateTime)}</div>
                        </div>
                        <div className="flex flex-col items-center text-white/30">
                            <div className="w-12 h-px bg-white/20 mb-1"></div>
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs mt-1">{getDuration()}</span>
                        </div>
                        <div>
                            <div className="text-white/50 text-xs mb-1">Drop-off</div>
                            <div className="text-white font-medium">{formatTime(car.dropoffDateTime)}</div>
                            <div className="text-white/50 text-xs">{formatDate(car.dropoffDateTime)}</div>
                        </div>
                    </div>
                </div>

                {/* Cost & Actions */}
                <div className="flex flex-col items-end gap-4">
                    {car.costAmount && (
                        <div className="text-right">
                            <div className="text-lg font-bold text-[var(--accent-cyan)]">
                                ${car.costAmount.toFixed(2)}
                            </div>
                            <div className="text-xs text-white/40">{car.costCurrency || 'USD'}</div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={onEdit}
                            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
