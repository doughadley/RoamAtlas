'use client';

import { Train, Bus, Clock, MapPin, Edit2, Trash2, Hash, DollarSign } from 'lucide-react';
import { Train as TrainType } from '@/types';

interface TransportCardProps {
    transport: TrainType;
    onEdit: () => void;
    onDelete: () => void;
}

export default function TransportCard({ transport, onEdit, onDelete }: TransportCardProps) {
    const formatTime = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getDuration = () => {
        const dep = new Date(transport.departureDateTime);
        const arr = new Date(transport.arrivalDateTime);
        const diff = arr.getTime() - dep.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    const Icon = transport.type === 'train' ? Train : Bus;
    const accentColor = transport.type === 'train' ? 'var(--accent-orange)' : 'var(--accent-green)';

    return (
        <div className="glass-panel p-6 hover:border-white/20 transition-all group">
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: `${accentColor}20` }}
                >
                    <Icon className="w-6 h-6" style={{ color: accentColor }} />
                </div>

                {/* Main Content */}
                <div className="flex-grow min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-white">{transport.operator}</span>
                        {transport.serviceNumber && (
                            <span className="text-sm text-white/50 flex items-center gap-1">
                                <Hash className="w-3 h-3" /> {transport.serviceNumber}
                            </span>
                        )}
                        <span
                            className="text-xs px-2 py-0.5 rounded-full capitalize"
                            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                        >
                            {transport.type}
                        </span>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-3 text-white/80 mb-3">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-white/50" />
                            {transport.origin}
                        </span>
                        <span className="text-white/30">→</span>
                        <span>{transport.destination}</span>
                    </div>

                    {/* Time Info */}
                    <div className="flex items-center gap-6 text-sm">
                        <div>
                            <div className="text-white/50 text-xs mb-1">Departure</div>
                            <div className="text-white font-medium">{formatTime(transport.departureDateTime)}</div>
                            <div className="text-white/50 text-xs">{formatDate(transport.departureDateTime)}</div>
                        </div>
                        <div className="flex flex-col items-center text-white/30">
                            <div className="w-12 h-px bg-white/20 mb-1"></div>
                            <Clock className="w-3 h-3" />
                            <span className="text-xs mt-1">{getDuration()}</span>
                        </div>
                        <div>
                            <div className="text-white/50 text-xs mb-1">Arrival</div>
                            <div className="text-white font-medium">{formatTime(transport.arrivalDateTime)}</div>
                            <div className="text-white/50 text-xs">{formatDate(transport.arrivalDateTime)}</div>
                        </div>
                    </div>

                    {/* Extra Info */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-sm text-white/50">
                        {transport.confirmationNumber && (
                            <span>Conf: {transport.confirmationNumber}</span>
                        )}
                        {transport.seatInfo && (
                            <span>{transport.seatInfo}</span>
                        )}
                    </div>
                </div>

                {/* Cost & Actions */}
                <div className="flex flex-col items-end gap-4">
                    {transport.costAmount && (
                        <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: 'var(--accent-cyan)' }}>
                                ${transport.costAmount.toFixed(2)}
                            </div>
                            <div className="text-xs text-white/40">{transport.costCurrency || 'USD'}</div>
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
