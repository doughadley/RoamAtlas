'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar, MainPanel, TripTabs } from '@/components/layout';
import { AccommodationModal } from '@/components/bookings';
import { Accommodation } from '@/types';
import { getAccommodations, deleteAccommodation, getTrip } from '@/lib/dataService';
import { Plus, Building2, ArrowLeft, MapPin, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AccommodationsPage() {
    const params = useParams();
    const tripId = params.tripId as string;

    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Accommodation | null>(null);
    const [tripName, setTripName] = useState('');

    useEffect(() => {
        loadData();
        const trip = getTrip(tripId);
        if (trip) setTripName(trip.name);
    }, [tripId]);

    const loadData = () => {
        const data = getAccommodations(tripId);
        data.sort((a, b) => new Date(a.checkInDateTime).getTime() - new Date(b.checkInDateTime).getTime());
        setAccommodations(data);
    };

    const handleDelete = (item: Accommodation) => {
        if (confirm(`Delete ${item.propertyName}?`)) {
            deleteAccommodation(item.id);
            loadData();
        }
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const getNights = (checkIn: string, checkOut: string) => Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <>
            <Sidebar />
            <MainPanel
                title="Accommodations"
                subtitle={tripName}
                actions={
                    <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Stay</button>
                }
            >
                <TripTabs tripId={tripId} />

                {accommodations.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {accommodations.map((item) => (
                            <div key={item.id} className="glass-card p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--accent-green)]/20 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-[var(--accent-green)]" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-[var(--text-primary)]">{item.propertyName}</p>
                                            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setEditing(item); setShowModal(true); }} className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)]"><Edit className="w-4 h-4 text-[var(--text-secondary)]" /></button>
                                        <button onClick={() => handleDelete(item)} className="p-2 rounded-lg hover:bg-[var(--accent-red)]/10"><Trash2 className="w-4 h-4 text-[var(--accent-red)]" /></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1 text-[var(--text-secondary)]"><Calendar className="w-4 h-4" /> {formatDate(item.checkInDateTime)} - {formatDate(item.checkOutDateTime)}</span>
                                    <span className="px-2 py-1 rounded-full bg-[var(--accent-green)]/20 text-[var(--accent-green)] text-xs font-medium">{getNights(item.checkInDateTime, item.checkOutDateTime)} nights</span>
                                </div>
                                {(item.confirmationNumber || item.costAmount) && (
                                    <div className="flex justify-between text-sm pt-3 mt-3 border-t border-[var(--border-glass)]">
                                        {item.confirmationNumber && <span className="text-[var(--text-muted)]">Conf: {item.confirmationNumber}</span>}
                                        {item.costAmount && <span className="text-[var(--accent-cyan)] font-medium">${item.costAmount.toFixed(2)}</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel p-12 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-[var(--accent-green)]/20 mx-auto mb-6 flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-[var(--accent-green)]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">No accommodations yet</h2>
                        <p className="text-[var(--text-secondary)] mb-6">Add your first hotel or stay.</p>
                        <button onClick={() => setShowModal(true)} className="btn-primary"><span className="flex items-center gap-2"><Plus className="w-5 h-5" /> Add Stay</span></button>
                    </div>
                )}
            </MainPanel>
            <AccommodationModal isOpen={showModal} onClose={() => setShowModal(false)} tripId={tripId} accommodation={editing} onSave={loadData} />
        </>
    );
}
