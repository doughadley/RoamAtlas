
import React, { useState } from 'react';
import { X, Upload, Check, AlertCircle, Plane } from 'lucide-react';
import { parseFlightText } from '@/lib/importService';
import { createFlight } from '@/lib/dataService';
import { Flight } from '@/types';

interface FlightImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    onImport: () => void;
}

export function FlightImportModal({ isOpen, onClose, tripId, onImport }: FlightImportModalProps) {
    const [text, setText] = useState('');
    const [preview, setPreview] = useState<Partial<Flight>[]>([]);
    const [step, setStep] = useState<'input' | 'preview'>('input');
    const [error, setError] = useState('');

    const handleParse = () => {
        setError('');
        try {
            const results = parseFlightText(text);
            if (results.length === 0) {
                setError('No flights found. Please make sure the text contains standard airline confirmation details (United supported).');
                return;
            }
            // Add tripId
            const flightsWithTrip = results.map(f => ({ ...f, tripId }));
            setPreview(flightsWithTrip);
            setStep('preview');
        } catch (e) {
            setError('Error parsing text. Please check the format.');
        }
    };

    const handleImport = () => {
        try {
            let count = 0;
            preview.forEach(f => {
                // Validate required fields
                if (f.origin && f.destination && f.departureDateTime && f.arrivalDateTime && f.airline && f.flightNumber) {
                    createFlight(f as Omit<Flight, 'id'>);
                    count++;
                }
            });
            onImport(); // Refresh parent
            onClose();
            // Reset state
            setText('');
            setPreview([]);
            setStep('input');
            alert(`Successfully imported ${count} flights!`);
        } catch (e) {
            setError('Failed to save flights.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-[var(--accent-blue)]" />
                        Import Flights
                    </h2>
                    <button onClick={onClose} className="p-2 ml-auto text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {step === 'input' ? (
                        <div className="space-y-4">
                            <p className="text-white/70 text-sm">
                                Paste the text from your airline confirmation email (e.g., United Airlines).
                                We'll automatically extract the flight details.
                            </p>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste email content here..."
                                className="w-full h-64 p-4 bg-[var(--bg-glass)] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] resize-none font-mono text-sm"
                            />
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={onClose} className="btn-secondary">Cancel</button>
                                <button
                                    onClick={handleParse}
                                    className="btn-primary"
                                    disabled={!text.trim()}
                                >
                                    Parse Details
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-medium">Found {preview.length} Flights</h3>
                                <button onClick={() => setStep('input')} className="text-sm text-[var(--accent-blue)] hover:underline">
                                    Edit Text
                                </button>
                            </div>

                            <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {preview.map((f, i) => (
                                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 text-[var(--accent-cyan)] font-bold">
                                                    <Plane className="w-4 h-4" />
                                                    {f.airline} {f.flightNumber}
                                                </div>
                                                <div className="text-lg text-white font-medium mt-1">
                                                    {f.origin} → {f.destination}
                                                </div>
                                                <div className="text-sm text-white/60 mt-1">
                                                    {new Date(f.departureDateTime!).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-white/40 mb-1">Confirmation</div>
                                                <div className="font-mono text-white/80">{f.confirmationNumber}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button onClick={() => setStep('input')} className="btn-secondary">Back</button>
                                <button onClick={handleImport} className="btn-primary flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    Import {preview.length} Flights
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
