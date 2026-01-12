'use client';

import { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle, FileJson, CheckCircle } from 'lucide-react';
import { exportData, importData, clearAllData } from '@/lib/dataService';

export default function DataSettings() {
    const [importStrategy, setImportStrategy] = useState<'merge' | 'replace'>('merge');
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);

    const handleExport = () => {
        try {
            const dataStr = exportData();
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `roamatlas-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setStatus({ type: 'success', message: 'Data exported successfully!' });
            setTimeout(() => setStatus({ type: null, message: '' }), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to export data.' });
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const success = importData(event.target.result as string, importStrategy);
                if (success) {
                    setStatus({ type: 'success', message: 'Data imported successfully! Reloading...' });
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    setStatus({ type: 'error', message: 'Failed to import data. Invalid JSON file.' });
                }
            }
        };
        reader.readAsText(file);

        // Reset input
        e.target.value = '';
    };

    const handleClearData = () => {
        if (!isConfirmingClear) {
            setIsConfirmingClear(true);
            return;
        }

        clearAllData();
        setStatus({ type: 'success', message: 'All data cleared. Reloading...' });
        setTimeout(() => window.location.reload(), 1500);
    };

    return (
        <div className="space-y-8">
            {/* Status Message */}
            {status.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success'
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                        : 'bg-red-500/20 text-red-200 border border-red-500/30'
                    }`}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {status.message}
                </div>
            )}

            {/* Export Section */}
            <div className="glass-card p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent-blue)]/20 flex items-center justify-center flex-shrink-0">
                        <Download className="w-6 h-6 text-[var(--accent-blue)]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Export Data</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            Download a JSON backup of all your trips, bookings, and expenses. Keep this file safe to restore your data later.
                        </p>
                        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
                            <FileJson className="w-4 h-4" />
                            Download Backup
                        </button>
                    </div>
                </div>
            </div>

            {/* Import Section */}
            <div className="glass-card p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent-purple)]/20 flex items-center justify-center flex-shrink-0">
                        <Upload className="w-6 h-6 text-[var(--accent-purple)]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Import Data</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            Restore data from a backup file.
                        </p>

                        {/* Strategy Selection */}
                        <div className="bg-black/20 p-4 rounded-lg mb-4 border border-white/5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-3">
                                Import Strategy
                            </label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${importStrategy === 'merge' ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/20' : 'border-white/30'
                                        }`}>
                                        {importStrategy === 'merge' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)]" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="strategy"
                                        value="merge"
                                        checked={importStrategy === 'merge'}
                                        onChange={() => setImportStrategy('merge')}
                                        className="hidden"
                                    />
                                    <div>
                                        <span className={`block font-medium ${importStrategy === 'merge' ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'}`}>Merge Data</span>
                                        <span className="text-xs text-[var(--text-muted)]">Add to existing trips (duplicates skipped/merged)</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${importStrategy === 'replace' ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/20' : 'border-white/30'
                                        }`}>
                                        {importStrategy === 'replace' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)]" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="strategy"
                                        value="replace"
                                        checked={importStrategy === 'replace'}
                                        onChange={() => setImportStrategy('replace')}
                                        className="hidden"
                                    />
                                    <div>
                                        <span className={`block font-medium ${importStrategy === 'replace' ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'}`}>Replace All</span>
                                        <span className="text-xs text-[var(--text-muted)]">Overwrite all current data</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <button className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                                <Upload className="w-4 h-4" />
                                Select Backup File
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-card p-6 border-red-500/20">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-100 mb-1">Danger Zone</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            Permanently delete all local data. This action cannot be undone.
                        </p>
                        <button
                            onClick={handleClearData}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${isConfirmingClear
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600'
                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                }`}
                        >
                            <Trash2 className="w-4 h-4" />
                            {isConfirmingClear ? 'Click again to confirm delete' : 'Clear All Data'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
