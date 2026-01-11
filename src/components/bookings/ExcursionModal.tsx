'use client';

import { useState, useEffect } from 'react';
import { X, Ticket, MapPin, Clock, DollarSign } from 'lucide-react';
import { createExcursion, updateExcursion } from '@/lib/dataService';
import { Excursion } from '@/types';

interface ExcursionModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    excursion?: Excursion | null;
    onSave?: () => void;
}

const CATEGORIES = [
    { value: 'tour', label: 'Tour' },
    { value: 'museum', label: 'Museum' },
    { value: 'reservation', label: 'Reservation' },
    { value: 'personal', label: 'Personal' },
    { value: 'other', label: 'Other' },
];

export default function ExcursionModal({ isOpen, onClose, tripId, excursion, onSave }: ExcursionModalProps) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<'tour' | 'museum' | 'reservation' | 'personal' | 'other'>('tour');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [provider, setProvider] = useState('');
    const [notes, setNotes] = useState('');
    const [cost, setCost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!excursion;

    useEffect(() => {
        if (excursion) {
            setTitle(excursion.title);
            setCategory(excursion.category);
            setDate(excursion.date);
            setStartTime(excursion.startTime || '');
            setEndTime(excursion.endTime || '');
            setLocation(excursion.location || '');
            setProvider(excursion.provider || '');
            setNotes(excursion.notes || '');
            setCost(excursion.costAmount?.toString() || '');
        } else {
            setTitle(''); setCategory('tour'); setDate(''); setStartTime(''); setEndTime('');
            setLocation(''); setProvider(''); setNotes(''); setCost('');
        }
        setError('');
    }, [excursion, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = {
                tripId, title, category, date,
                startTime: startTime || undefined,
                endTime: endTime || undefined,
                location: location || undefined,
                provider: provider || undefined,
                notes: notes || undefined,
                costAmount: cost ? parseFloat(cost) : undefined,
                costCurrency: cost ? 'USD' : undefined,
            };

            if (isEditing && excursion) {
                updateExcursion(excursion.id, data);
            } else {
                createExcursion(data);
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
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-purple)] to-pink-500 mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <Ticket className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">{isEditing ? 'Edit Activity' : 'Add Activity'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title *</label>
                        <input type="text" placeholder="Colosseum Tour" value={title} onChange={(e) => setTitle(e.target.value)} className="glass-input" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category *</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="glass-input">
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Date *</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="glass-input" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Start Time</label>
                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="glass-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">End Time</label>
                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="glass-input" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input type="text" placeholder="Meeting point address" value={location} onChange={(e) => setLocation(e.target.value)} className="glass-input pl-10" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
                            <input type="text" placeholder="Tour company" value={provider} onChange={(e) => setProvider(e.target.value)} className="glass-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Cost</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input type="number" step="0.01" placeholder="50.00" value={cost} onChange={(e) => setCost(e.target.value)} className="glass-input pl-10" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notes</label>
                        <textarea placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="glass-input min-h-[80px] resize-none" />
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
