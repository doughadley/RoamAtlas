'use client';

import { Sidebar, MainPanel } from '@/components/layout';
import DataSettings from '@/components/settings/DataSettings';

export default function SettingsPage() {
    return (
        <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden">
            <Sidebar />
            <MainPanel
                title="Settings"
                subtitle="Manage your data and preferences"
            >
                <div className="max-w-3xl mx-auto py-8">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 px-1">Data Management</h2>
                    <DataSettings />
                </div>
            </MainPanel>
        </div>
    );
}
