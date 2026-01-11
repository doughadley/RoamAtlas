
import React, { useState } from 'react';
import { X, Upload, Check, AlertCircle, Building2, FileText, Clipboard } from 'lucide-react';
import { parseAccommodationText } from '@/lib/importService';
import { extractTextFromPdf } from '@/lib/pdfService';
import { createAccommodation } from '@/lib/dataService';
import { Accommodation } from '@/types';

interface AccommodationImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    onImport: () => void;
}

export function AccommodationImportModal({ isOpen, onClose, tripId, onImport }: AccommodationImportModalProps) {
    const [mode, setMode] = useState<'pdf' | 'text'>('pdf');
    const [text, setText] = useState('');
    const [preview, setPreview] = useState<Partial<Accommodation>[]>([]);
    const [step, setStep] = useState<'input' | 'preview'>('input');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const extractedText = await extractTextFromPdf(file);
            setText(extractedText); // Store for debugging/viewing
            processText(extractedText);
        } catch (err) {
            setError('Failed to read PDF. ensuring pdfjs-dist is configured correctly.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextParse = () => {
        if (!text.trim()) {
            setError('Please paste reservation text.');
            return;
        }
        processText(text);
    };

    const processText = (input: string) => {
        try {
            const results = parseAccommodationText(input);
            if (results.length === 0) {
                // FALLBACK: switch to Text mode and show what we found
                setMode('text');
                setText(input);
                setError('No details found automatically. Please check the extracted text below and verify "Check-in" dates and prices are present.');
                return;
            }
            // Add tripId
            const staysWithTrip = results.map(s => ({ ...s, tripId }));
            setPreview(staysWithTrip);
            setStep('preview');
        } catch (e) {
            setError('Error parsing text.');
        }
    };

    const handleImport = () => {
        try {
            let count = 0;
            preview.forEach(s => {
                if (s.propertyName) {
                    // Fill required missing fields
                    const now = new Date();
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    const finalCheckIn = s.checkInDateTime || now.toISOString().split('T')[0] + 'T15:00:00';
                    const finalCheckOut = s.checkOutDateTime || tomorrow.toISOString().split('T')[0] + 'T11:00:00';

                    const fullStay = {
                        ...s,
                        checkInDateTime: finalCheckIn,
                        checkOutDateTime: finalCheckOut,
                        address: s.address || 'Address not found',
                    } as Omit<Accommodation, 'id'>;

                    createAccommodation(fullStay);
                    count++;
                }
            });
            onImport();
            onClose();
            // Reset
            setText('');
            setPreview([]);
            setStep('input');
            alert(`Successfully imported ${count} stays!`);
        } catch (e) {
            setError('Failed to save stays.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-[var(--accent-green)]" />
                        Import Accommodation
                    </h2>
                    <button onClick={onClose} className="p-2 ml-auto text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Mode Toggle */}
                    {step === 'input' && (
                        <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                            <button
                                onClick={() => setMode('pdf')}
                                className={`flex items-center gap-2 pb-2 px-2 text-sm font-medium transition-colors ${mode === 'pdf' ? 'text-[var(--accent-green)] border-b-2 border-[var(--accent-green)]' : 'text-white/60 hover:text-white'}`}
                            >
                                <FileText className="w-4 h-4" /> Upload PDF
                            </button>
                            <button
                                onClick={() => setMode('text')}
                                className={`flex items-center gap-2 pb-2 px-2 text-sm font-medium transition-colors ${mode === 'text' ? 'text-[var(--accent-green)] border-b-2 border-[var(--accent-green)]' : 'text-white/60 hover:text-white'}`}
                            >
                                <Clipboard className="w-4 h-4" /> Paste Text
                            </button>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {step === 'input' ? (
                        <div className="space-y-6">
                            {mode === 'pdf' ? (
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-white/5 hover:bg-white/10 transition-colors relative cursor-pointer group">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isLoading}
                                    />
                                    {isLoading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-[var(--accent-green)]/30 border-t-[var(--accent-green)] rounded-full animate-spin" />
                                            <p className="text-white/70">Extracting text from PDF...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 pointer-events-none">
                                            <div className="w-12 h-12 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Upload className="w-6 h-6 text-[var(--accent-green)]" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-medium text-white group-hover:text-[var(--accent-green)] transition-colors">Drop your Booking.com PDF here</p>
                                                <p className="text-sm text-white/50 mt-1">or click to browse</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Paste content from Booking.com email..."
                                        className="w-full h-48 p-4 bg-[var(--bg-glass)] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent-green)] resize-none font-mono text-sm"
                                    />
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleTextParse}
                                            className="btn-primary"
                                            disabled={!text.trim()}
                                        >
                                            Parse Text
                                        </button>
                                    </div>
                                </div>
                            )}

                            <p className="text-center text-xs text-white/30">
                                Supports standard Booking.com confirmation PDFs and emails.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-medium">Found {preview.length} Stay(s)</h3>
                                <button onClick={() => setStep('input')} className="text-sm text-[var(--accent-green)] hover:underline">
                                    Start Over
                                </button>
                            </div>

                            <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {preview.map((s, i) => (
                                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-[var(--accent-green)]/20 rounded-lg">
                                                    <Building2 className="w-5 h-5 text-[var(--accent-green)]" />
                                                </div>
                                                <div>
                                                    <div className="text-lg text-white font-bold">
                                                        {s.propertyName}
                                                    </div>
                                                    <div className="text-sm text-white/60 mt-1">
                                                        {s.address}
                                                    </div>
                                                    <div className="text-sm text-white/80 mt-1">
                                                        {(s.checkInDateTime && s.checkOutDateTime) ? (
                                                            `${new Date(s.checkInDateTime).toLocaleDateString()} - ${new Date(s.checkOutDateTime).toLocaleDateString()}`
                                                        ) : (
                                                            <span className="text-yellow-400 text-xs">Dates missing (Defaults to today)</span>
                                                        )}
                                                    </div>

                                                    {/* Booking.com Deep Link */}
                                                    {s.confirmationNumber && (
                                                        <a
                                                            href={`https://secure.booking.com/myreservations.html`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-xs text-[var(--accent-cyan)] mt-2 hover:underline"
                                                            onClick={(e) => {
                                                                // Just a helper link, generic dashboard
                                                            }}
                                                        >
                                                            View on Booking.com {"->"}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {s.costAmount && (
                                                    <div className="text-[var(--accent-cyan)] font-bold text-lg mb-1">
                                                        ${s.costAmount.toFixed(2)}
                                                    </div>
                                                )}
                                                <div className="text-xs text-white/40 mb-1">Confirmation</div>
                                                <div className="font-mono text-white/80">{s.confirmationNumber || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button onClick={() => setStep('input')} className="btn-secondary">Back</button>
                                <button onClick={handleImport} className="btn-primary flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    Import Stays
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
