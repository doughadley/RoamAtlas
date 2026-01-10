'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar, MainPanel } from '@/components/layout';
import { ExcursionModal } from '@/components/bookings';
import { Excursion, getExcursions, deleteExcursion, getTrip } from '@/lib/dataService';
import { Plus, Ticket, ArrowLeft, MapPin, Clock, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_COLORS: Record<string, string> = {
    tour: 'var(--accent-purple)',
    museum: 'var(--accent-blue)',
    reservation: 'var(--accent-orange)',
    personal: 'var(--accent-cyan)',
    other: 'var(--text-muted)',
};

export default function ExcursionsPage() {
    const params = useParams();
    const tripId = params.tripId as string;

    const [excursions, setExcursions] = useState<Excursion[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Excursion | null>(null);
    const [tripName, setTripName] = useState('');
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        loadData();
        const trip = getTrip(tripId);
        if (trip) setTripName(trip.name);
    }, [tripId]);

    const loadData = () => {
        const data = getExcursions(tripId);
        data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setExcursions(data);
    };

    const handleDelete = (item: Excursion) => {
        if (confirm(`Delete ${item.title}?`)) {
            deleteExcursion(item.id);
            loadData();
        }
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const filtered = filter === 'all' ? excursions : excursions.filter(e => e.category === filter);

    return (
        <>
            <Sidebar />
            <MainPanel
                title="Activities & Excursions"
                subtitle={tripName}
                actions={
                    <div className="flex items-center gap-3">
                        <Link href={`/trips/${tripId}`} className="glass-button flex items-center gap-2 text-sm"><ArrowLeft className="w-4 h-4" /> Back</Link>
                        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Activity</button>
                    </div>
                }
            >
                {/* Filter pills */}
                {excursions.length > 0 && (
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {['all', 'tour', 'museum', 'reservation', 'personal', 'other'].map(cat => (
                            <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${filter === cat ? 'bg-[var(--accent-purple)] text-white' : 'glass-button'}`}>{cat}</button>
                        ))}
                    </div>
                )}

                {filtered.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((item) => (
                            <div key={item.id} className="glass-card p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${CATEGORY_COLORS[item.category]}20` }}>
                                            <Ticket className="w-5 h-5" style={{ color: CATEGORY_COLORS[item.category] }} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</p>
                                            <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: `${CATEGORY_COLORS[item.category]}20`, color: CATEGORY_COLORS[item.category] }}>{item.category}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setEditing(item); setShowModal(true); }} className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)]"><Edit className="w-4 h-4 text-[var(--text-secondary)]" /></button>
                                        <button onClick={() => handleDelete(item)} className="p-2 rounded-lg hover:bg-[var(--accent-red)]/10"><Trash2 className="w-4 h-4 text-[var(--accent-red)]" /></button>
                                    </div>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] mb-2">{formatDate(item.date)}</p>
                                {(item.startTime || item.endTime) && <p className="text-sm text-[var(--text-muted)] flex items-center gap-1"><Clock className="w-3 h-3" /> {item.startTime}{item.endTime && ` - ${item.endTime}`}</p>}
                                {item.location && <p className="text-sm text-[var(--text-muted)] flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {item.location}</p>}
                                {item.costAmount && <p className="text-[var(--accent-cyan)] font-medium text-sm mt-2">${item.costAmount.toFixed(2)}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel p-12 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-[var(--accent-purple)]/20 mx-auto mb-6 flex items-center justify-center">
                            <Ticket className="w-10 h-10 text-[var(--accent-purple)]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">{filter === 'all' ? 'No activities yet' : `No ${filter} activities`}</h2>
                        <p className="text-[var(--text-secondary)] mb-6">Add tours, museums, and activities.</p>
                        <button onClick={() => setShowModal(true)} className="btn-primary"><span className="flex items-center gap-2"><Plus className="w-5 h-5" /> Add Activity</span></button>
                    </div>
                )}
            </MainPanel>
            <ExcursionModal isOpen={showModal} onClose={() => setShowModal(false)} tripId={tripId} excursion={editing} onSave={loadData} />
        </>
    );
}
