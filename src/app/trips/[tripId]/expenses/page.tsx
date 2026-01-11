'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar, MainPanel, TripTabs, TripBackground } from '@/components/layout';
import { ExpenseSummary, ExpenseModal } from '@/components/expenses';
import { getExpenses, getTrip, deleteExpense, getFlights, getAccommodations, getTrains, getCars, getExcursions } from '@/lib/dataService';
import { Trip, Expense, Flight, Accommodation, Train, CarRental, Excursion } from '@/types';
import { Plus, Plane, Building2, Truck, Ticket, Utensils, MoreHorizontal, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface CombinedExpense {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    currency: string;
    source: 'manual' | 'flight' | 'accommodation' | 'transport' | 'car' | 'excursion';
    originalData?: any;
    isEditable: boolean;
}

export default function ExpensesPage() {
    const params = useParams();
    const tripId = params.tripId as string;

    const [trip, setTrip] = useState<Trip | null>(null);
    const [manualExpenses, setManualExpenses] = useState<Expense[]>([]);
    const [combinedExpenses, setCombinedExpenses] = useState<CombinedExpense[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['flight', 'accommodation', 'transport', 'excursion', 'food', 'other']));

    const loadData = useCallback(() => {
        const tripData = getTrip(tripId);
        setTrip(tripData || null);

        const expenses = getExpenses(tripId);
        setManualExpenses(expenses);

        // Combine all expense sources
        const combined: CombinedExpense[] = [];

        // Check which categories have manual entries (to avoid duplicating auto-imports)
        const manualFlightExpenses = expenses.filter(e => e.category === 'flight');
        const manualAccomExpenses = expenses.filter(e => e.category === 'accommodation');
        const manualTransportExpenses = expenses.filter(e => e.category === 'transport');
        const manualExcursionExpenses = expenses.filter(e => e.category === 'excursion');

        // Manual expenses - always include
        expenses.forEach(e => {
            combined.push({
                id: e.id,
                date: e.date,
                description: e.description,
                category: e.category,
                amount: e.amount,
                currency: e.currency,
                source: 'manual',
                originalData: e,
                isEditable: true
            });
        });

        // Flights - only auto-import if no manual flight expenses exist
        if (manualFlightExpenses.length === 0) {
            const flights = getFlights(tripId);
            flights.forEach(f => {
                combined.push({
                    id: `flight-${f.id}`,
                    date: f.departureDateTime.split('T')[0],
                    description: `${f.airline} ${f.flightNumber}: ${f.origin} → ${f.destination}`,
                    category: 'flight',
                    amount: f.costAmount || 0,
                    currency: f.costCurrency || 'USD',
                    source: 'flight',
                    originalData: f,
                    isEditable: false
                });
            });
        }

        // Accommodations - only auto-import if no manual accommodation expenses exist
        if (manualAccomExpenses.length === 0) {
            const accommodations = getAccommodations(tripId);
            accommodations.forEach(a => {
                combined.push({
                    id: `accom-${a.id}`,
                    date: a.checkInDateTime.split('T')[0],
                    description: a.propertyName,
                    category: 'accommodation',
                    amount: a.costAmount || 0,
                    currency: a.costCurrency || 'USD',
                    source: 'accommodation',
                    originalData: a,
                    isEditable: false
                });
            });
        }

        // Transportation (Trains & Buses) - only if no manual transport expenses
        if (manualTransportExpenses.length === 0) {
            const trains = getTrains(tripId);
            trains.forEach(t => {
                combined.push({
                    id: `train-${t.id}`,
                    date: t.departureDateTime.split('T')[0],
                    description: `${t.operator}: ${t.origin} → ${t.destination}`,
                    category: 'transport',
                    amount: t.costAmount || 0,
                    currency: t.costCurrency || 'USD',
                    source: 'transport',
                    originalData: t,
                    isEditable: false
                });
            });

            // Car Rentals
            const cars = getCars(tripId);
            cars.forEach(c => {
                combined.push({
                    id: `car-${c.id}`,
                    date: c.pickupDateTime.split('T')[0],
                    description: c.company,
                    category: 'transport',
                    amount: c.costAmount || 0,
                    currency: c.costCurrency || 'USD',
                    source: 'car',
                    originalData: c,
                    isEditable: false
                });
            });
        }

        // Excursions - only if no manual excursion expenses
        if (manualExcursionExpenses.length === 0) {
            const excursions = getExcursions(tripId);
            excursions.forEach(ex => {
                combined.push({
                    id: `excursion-${ex.id}`,
                    date: ex.date,
                    description: ex.title,
                    category: 'excursion',
                    amount: ex.costAmount || 0,
                    currency: ex.costCurrency || 'USD',
                    source: 'excursion',
                    originalData: ex,
                    isEditable: false
                });
            });
        }

        console.log('Total combined expenses:', combined.length);
        console.log('By category:', {
            flight: combined.filter(c => c.category === 'flight').length,
            accommodation: combined.filter(c => c.category === 'accommodation').length,
            transport: combined.filter(c => c.category === 'transport').length,
            excursion: combined.filter(c => c.category === 'excursion').length,
        });

        // Sort by date
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCombinedExpenses(combined);
    }, [tripId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreate = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const handleEdit = (expense: CombinedExpense) => {
        if (expense.isEditable && expense.originalData) {
            setEditingExpense(expense.originalData);
            setIsModalOpen(true);
        }
    };

    const handleDelete = (expense: CombinedExpense) => {
        if (expense.isEditable && confirm('Delete this expense?')) {
            deleteExpense(expense.id);
            loadData();
        }
    };

    const toggleCategory = (category: string) => {
        const newSet = new Set(expandedCategories);
        if (newSet.has(category)) {
            newSet.delete(category);
        } else {
            newSet.add(category);
        }
        setExpandedCategories(newSet);
    };

    // Group expenses by category
    const groupedExpenses = combinedExpenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
            acc[expense.category] = [];
        }
        acc[expense.category].push(expense);
        return acc;
    }, {} as Record<string, CombinedExpense[]>);

    const categoryConfig: Record<string, { icon: any; color: string; label: string }> = {
        flight: { icon: Plane, color: 'var(--accent-blue)', label: 'Flights' },
        accommodation: { icon: Building2, color: 'var(--accent-green)', label: 'Accommodations' },
        transport: { icon: Truck, color: 'var(--accent-orange)', label: 'Transportation' },
        excursion: { icon: Ticket, color: 'var(--accent-purple)', label: 'Activities' },
        food: { icon: Utensils, color: 'var(--accent-yellow)', label: 'Food & Dining' },
        other: { icon: MoreHorizontal, color: 'var(--text-secondary)', label: 'Other' },
    };

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getCategoryTotal = (expenses: CombinedExpense[]) => {
        return expenses.reduce((sum, e) => sum + e.amount, 0);
    };

    if (!trip) return null;

    const categoryOrder = ['flight', 'accommodation', 'transport', 'excursion', 'food', 'other'];

    return (
        <TripBackground destination={trip.primaryDestination}>
            <Sidebar />
            <MainPanel
                title="Expenses"
                subtitle="Track and analyze your trip spending"
                actions={
                    <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Expense
                    </button>
                }
            >
                <TripTabs tripId={tripId} />

                <div className="space-y-8 animate-slide-up">
                    <ExpenseSummary expenses={manualExpenses} allExpenses={combinedExpenses} />

                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Transactions by Category</h3>

                        {combinedExpenses.length === 0 ? (
                            <div className="glass-panel p-12 text-center">
                                <p className="text-[var(--text-secondary)]">No expenses added yet.</p>
                                <button onClick={handleCreate} className="mt-4 text-[var(--accent-blue)] hover:underline">
                                    Add your first expense
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {categoryOrder.map(category => {
                                    const expenses = groupedExpenses[category];
                                    if (!expenses || expenses.length === 0) return null;

                                    const config = categoryConfig[category] || categoryConfig.other;
                                    const Icon = config.icon;
                                    const isExpanded = expandedCategories.has(category);
                                    const total = getCategoryTotal(expenses);

                                    return (
                                        <div key={category} className="glass-panel overflow-hidden">
                                            {/* Category Header */}
                                            <button
                                                onClick={() => toggleCategory(category)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="p-2 rounded-lg"
                                                        style={{ backgroundColor: `${config.color}20` }}
                                                    >
                                                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-medium text-white">{config.label}</h4>
                                                        <p className="text-sm text-white/50">{expenses.length} transaction{expenses.length !== 1 ? 's' : ''}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-bold" style={{ color: config.color }}>
                                                        {formatCurrency(total)}
                                                    </span>
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-white/50" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-white/50" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Expense List */}
                                            {isExpanded && (
                                                <div className="border-t border-white/5">
                                                    {expenses.map(expense => (
                                                        <div
                                                            key={expense.id}
                                                            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-center w-12">
                                                                    <div className="text-xs text-white/40 uppercase">
                                                                        {new Date(expense.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' })}
                                                                    </div>
                                                                    <div className="text-lg font-bold text-white">
                                                                        {new Date(expense.date + 'T00:00:00').getDate()}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-white font-medium">{expense.description}</p>
                                                                    {!expense.isEditable && (
                                                                        <p className="text-xs text-white/40">Auto-imported</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-bold text-white">
                                                                    {formatCurrency(expense.amount, expense.currency)}
                                                                </span>
                                                                {expense.isEditable && (
                                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={() => handleEdit(expense)}
                                                                            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
                                                                        >
                                                                            <Edit2 className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(expense)}
                                                                            className="p-2 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <ExpenseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    tripId={tripId}
                    expense={editingExpense}
                    onSave={loadData}
                />
            </MainPanel>
        </TripBackground>
    );
}
