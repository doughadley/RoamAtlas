'use client';

import { useParams } from 'next/navigation';
import { Sidebar, MainPanel } from '@/components/layout';
import { Train, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function TrainsPage() {
    const params = useParams();
    const tripId = params.tripId as string;

    return (
        <>
            <Sidebar />
            <MainPanel
                title="Train Journeys"
                subtitle="Manage your train tickets"
                actions={
                    <div className="flex items-center gap-3">
                        <Link href={`/trips/${tripId}`} className="glass-button flex items-center gap-2 text-sm"><ArrowLeft className="w-4 h-4" /> Back</Link>
                        <button className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Train</button>
                    </div>
                }
            >
                <div className="glass-panel p-12 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-[var(--accent-orange)]/20 mx-auto mb-6 flex items-center justify-center">
                        <Train className="w-10 h-10 text-[var(--accent-orange)]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Train Journeys Coming Soon</h2>
                    <p className="text-[var(--text-secondary)]">This feature is currently under development.</p>
                </div>
            </MainPanel>
        </>
    );
}
