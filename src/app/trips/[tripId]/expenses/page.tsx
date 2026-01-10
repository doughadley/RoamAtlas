'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar, MainPanel, TripTabs, TripBackground } from '@/components/layout';
import { ExpenseSummary, ExpenseList, ExpenseModal } from '@/components/expenses';
import { getExpenses, getTrip, deleteExpense } from '@/lib/dataService';
import { Trip, Expense } from '@/types';
import { Plus } from 'lucide-react';

export default function ExpensesPage() {
    const params = useParams();
    const tripId = params.tripId as string;

    const [trip, setTrip] = useState<Trip | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const loadData = useCallback(() => {
        setTrip(getTrip(tripId) || null);
        setExpenses(getExpenses(tripId));
    }, [tripId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreate = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleDelete = (expense: Expense) => {
        if (confirm('Delete this expense?')) {
            deleteExpense(expense.id);
            loadData();
        }
    };

    const handleSave = () => {
        loadData();
    };

    if (!trip) return null;

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
                    <ExpenseSummary expenses={expenses} />

                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Transactions</h3>
                        {expenses.length > 0 ? (
                            <ExpenseList
                                expenses={expenses}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ) : (
                            <div className="glass-panel p-12 text-center">
                                <p className="text-[var(--text-secondary)]">No expenses added yet.</p>
                                <button onClick={handleCreate} className="mt-4 text-[var(--accent-blue)] hover:underline">
                                    Add your first expense
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <ExpenseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    tripId={tripId}
                    expense={editingExpense}
                    onSave={handleSave}
                />
            </MainPanel>
        </TripBackground>
    );
}
