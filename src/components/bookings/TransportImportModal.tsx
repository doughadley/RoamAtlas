'use client';

import { useState } from 'react';
import { X, Upload, FileText, Bus, Train as TrainIcon, Car, AlertCircle, Check } from 'lucide-react';
import { extractTextFromPdf } from '@/lib/pdfService';
import { parseTransportText, parseCarRentalText } from '@/lib/importService';
import { createTrain, createCar } from '@/lib/dataService';
import { Train as TrainType, CarRental } from '@/types';

interface TransportImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    onImported?: () => void;
}

interface ParsedTransport extends Omit<TrainType, 'id' | 'tripId'> { }
interface ParsedCarRental extends Omit<CarRental, 'id' | 'tripId'> { }

type ParsedItem =
    | { type: 'transport'; data: ParsedTransport }
    | { type: 'car'; data: ParsedCarRental };

export default function TransportImportModal({ isOpen, onClose, tripId, onImported }: TransportImportModalProps) {
    const [tab, setTab] = useState<'pdf' | 'text'>('pdf');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [rawText, setRawText] = useState('');
    const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
    const [importedCount, setImportedCount] = useState(0);

    if (!isOpen) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError('');
        setParsedItems([]);

        try {
            const text = await extractTextFromPdf(file);
            setRawText(text);
            parseAll(text);
        } catch (err: any) {
            setError(err.message || 'Failed to read PDF');
        } finally {
            setIsLoading(false);
        }
    };

    const parseAll = (text: string) => {
        const allItems: ParsedItem[] = [];

        // Try transport (FlixBus)
        const transports = parseTransportText(text);
        transports.forEach(t => allItems.push({ type: 'transport', data: t }));

        // Try car rentals (Priceline)
        const cars = parseCarRentalText(text);
        cars.forEach(c => allItems.push({ type: 'car', data: c }));

        if (allItems.length === 0) {
            setError('No bookings found. Supports FlixBus invoices and Priceline car rentals.');
        } else {
            setParsedItems(allItems);
        }
    };

    const handleTextParse = () => {
        setIsLoading(true);
        setError('');
        setParsedItems([]);

        try {
            parseAll(rawText);
        } catch (err: any) {
            setError(err.message || 'Failed to parse text');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = () => {
        let count = 0;
        parsedItems.forEach(item => {
            if (item.type === 'transport') {
                createTrain({
                    tripId,
                    type: item.data.type,
                    operator: item.data.operator,
                    serviceNumber: item.data.serviceNumber || '',
                    origin: item.data.origin,
                    destination: item.data.destination,
                    departureDateTime: item.data.departureDateTime,
                    arrivalDateTime: item.data.arrivalDateTime,
                    confirmationNumber: item.data.confirmationNumber,
                    seatInfo: item.data.seatInfo,
                    costAmount: item.data.costAmount,
                    costCurrency: item.data.costCurrency
                });
            } else {
                createCar({
                    tripId,
                    company: item.data.company,
                    pickupLocation: item.data.pickupLocation || 'TBD',
                    dropoffLocation: item.data.dropoffLocation || 'TBD',
                    pickupDateTime: item.data.pickupDateTime,
                    dropoffDateTime: item.data.dropoffDateTime,
                    confirmationNumber: item.data.confirmationNumber,
                    costAmount: item.data.costAmount,
                    costCurrency: item.data.costCurrency
                });
            }
            count++;
        });
        setImportedCount(count);
        onImported?.();

        // Close after short delay
        setTimeout(() => {
            onClose();
            setParsedItems([]);
            setImportedCount(0);
            setRawText('');
        }, 1500);
    };

    const formatTime = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-[var(--accent-cyan)]" />
                        Import Transportation
                    </h2>
                    <button onClick={onClose} className="p-2 ml-auto text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl">
                        <button
                            onClick={() => setTab('pdf')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${tab === 'pdf' ? 'bg-[var(--accent-cyan)] text-white' : 'text-white/60 hover:text-white'}`}
                        >
                            <FileText className="w-4 h-4" /> Upload PDF
                        </button>
                        <button
                            onClick={() => setTab('text')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${tab === 'text' ? 'bg-[var(--accent-cyan)] text-white' : 'text-white/60 hover:text-white'}`}
                        >
                            <FileText className="w-4 h-4" /> Paste Text
                        </button>
                    </div>

                    {/* Success State */}
                    {importedCount > 0 && (
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 mx-auto mb-4 flex items-center justify-center">
                                <Check className="w-8 h-8 text-green-400" />
                            </div>
                            <p className="text-lg font-medium text-white">Imported {importedCount} booking(s)!</p>
                        </div>
                    )}

                    {/* Content */}
                    {importedCount === 0 && (
                        <>
                            {tab === 'pdf' && (
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-white/20 transition-colors">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="pdf-upload-transport"
                                    />
                                    <label htmlFor="pdf-upload-transport" className="cursor-pointer">
                                        <div className="flex gap-2 justify-center mb-4">
                                            <Car className="w-10 h-10 text-[var(--accent-purple)]" />
                                            <Bus className="w-10 h-10 text-[var(--accent-green)]" />
                                            <TrainIcon className="w-10 h-10 text-[var(--accent-orange)]" />
                                        </div>
                                        <p className="text-white font-medium mb-2">Drop PDF here or click to upload</p>
                                        <p className="text-white/50 text-sm">Supports FlixBus & Priceline</p>
                                    </label>
                                </div>
                            )}

                            {tab === 'text' && (
                                <div className="space-y-4">
                                    <textarea
                                        value={rawText}
                                        onChange={(e) => setRawText(e.target.value)}
                                        placeholder="Paste your confirmation email here..."
                                        className="w-full h-48 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
                                    />
                                    <button
                                        onClick={handleTextParse}
                                        disabled={!rawText.trim() || isLoading}
                                        className="btn-primary w-full"
                                    >
                                        {isLoading ? 'Parsing...' : 'Parse Text'}
                                    </button>
                                </div>
                            )}

                            {/* Loading */}
                            {isLoading && (
                                <div className="mt-6 text-center text-white/60">
                                    <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-[var(--accent-cyan)] rounded-full mx-auto mb-3"></div>
                                    Analyzing document...
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-yellow-200 font-medium">{error}</p>
                                        {rawText && (
                                            <details className="mt-2">
                                                <summary className="text-yellow-400/70 text-sm cursor-pointer">View extracted text</summary>
                                                <pre className="mt-2 text-xs text-white/50 max-h-32 overflow-auto">{rawText.substring(0, 500)}...</pre>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Parsed Items */}
                            {parsedItems.length > 0 && (
                                <div className="mt-6 space-y-4">
                                    <h3 className="text-white font-medium">Found {parsedItems.length} booking(s):</h3>
                                    {parsedItems.map((item, idx) => {
                                        if (item.type === 'transport') {
                                            const t = item.data;
                                            return (
                                                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Bus className="w-5 h-5 text-[var(--accent-green)]" />
                                                        <span className="font-bold text-white">{t.operator}</span>
                                                        {t.confirmationNumber && (
                                                            <span className="text-xs text-white/50">#{t.confirmationNumber}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-white/80 text-sm">
                                                        <span>{t.origin}</span>
                                                        <span className="text-white/30">→</span>
                                                        <span>{t.destination}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                                                        <span>{formatDate(t.departureDateTime)} {formatTime(t.departureDateTime)}</span>
                                                        {t.costAmount && (
                                                            <span className="text-[var(--accent-cyan)]">${t.costAmount.toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            const c = item.data;
                                            return (
                                                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Car className="w-5 h-5 text-[var(--accent-purple)]" />
                                                        <span className="font-bold text-white">{c.company}</span>
                                                        {c.confirmationNumber && (
                                                            <span className="text-xs text-white/50">#{c.confirmationNumber}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                                                        <span>{formatDate(c.pickupDateTime)} - {formatDate(c.dropoffDateTime)}</span>
                                                        {c.costAmount && (
                                                            <span className="text-[var(--accent-cyan)]">${c.costAmount.toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-yellow-400/70 mt-2">Note: Pickup/dropoff locations will need to be filled in manually</p>
                                                </div>
                                            );
                                        }
                                    })}

                                    <button onClick={handleImport} className="btn-primary w-full mt-4">
                                        Import {parsedItems.length} Booking(s)
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* Footer */}
                    <p className="mt-6 text-center text-white/40 text-xs">
                        Supports FlixBus & Priceline car rental PDFs
                    </p>
                </div>
            </div>
        </div>
    );
}
