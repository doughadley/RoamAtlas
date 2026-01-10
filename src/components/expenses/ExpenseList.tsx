'use client';

import { useState } from 'react';
import { Expense } from '@/types';
import { Edit2, Trash2, Tag, Calendar, CreditCard } from 'lucide-react';

interface ExpenseListProps {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (expense: Expense) => void;
    currency?: string;
}

export default function ExpenseList({ expenses, onEdit, onDelete, currency = 'USD' }: ExpenseListProps) {
    const [sort, setSort] = useState<'date' | 'amount'>('date');

    const sortedExpenses = [...expenses].sort((a, b) => {
        if (sort === 'date') {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return b.amount - a.amount;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const getCategoryBadge = (category: string) => {
        const styles: Record<string, string> = {
            flight: 'bg-blue-500/20 text-blue-300',
            accommodation: 'bg-green-500/20 text-green-300',
            transport: 'bg-orange-500/20 text-orange-300',
            food: 'bg-yellow-500/20 text-yellow-300',
            excursion: 'bg-purple-500/20 text-purple-300',
            other: 'bg-gray-500/20 text-gray-300',
        };
        const labels: Record<string, string> = {
            flight: 'Flight',
            accommodation: 'Stay',
            transport: 'Transport',
            food: 'Food',
            excursion: 'Activity',
            other: 'Other',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${styles[category] || styles.other}`}>
                {labels[category] || category}
            </span>
        );
    };

    if (expenses.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-end gap-2 text-sm text-[var(--text-secondary)]">
                <span>Sort by:</span>
                <button
                    onClick={() => setSort('date')}
                    className={`px-3 py-1 rounded-lg transition-colors ${sort === 'date' ? 'bg-[var(--accent-blue)] text-white' : 'hover:bg-[var(--bg-glass-hover)]'}`}
                >
                    Date
                </button>
                <button
                    onClick={() => setSort('amount')}
                    className={`px-3 py-1 rounded-lg transition-colors ${sort === 'amount' ? 'bg-[var(--accent-blue)] text-white' : 'hover:bg-[var(--bg-glass-hover)]'}`}
                >
                    Amount
                </button>
            </div>

            <div className="grid gap-4">
                {sortedExpenses.map((expense) => (
                    <div
                        key={expense.id}
                        className="glass-card p-4 flex items-center justify-between group hover:border-[var(--accent-blue)]/30 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                                <span className="text-xs text-[var(--text-secondary)] uppercase">
                                    {new Date(expense.date).toLocaleString('en-US', { month: 'short' })}
                                </span>
                                <span className="text-lg font-bold text-[var(--text-primary)]">
                                    {new Date(expense.date).getUTCDate()}
                                </span>
                            </div>
                            <div>
                                <h4 className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                                    {expense.description}
                                    {getCategoryBadge(expense.category)}
                                </h4>
                                <div className="flex items-center gap-3 mt-1 text-sm text-[var(--text-secondary)]">
                                    {expense.paymentMethod && (
                                        <span className="flex items-center gap-1">
                                            <CreditCard className="w-3 h-3" />
                                            {expense.paymentMethod}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <span className="text-lg font-bold text-[var(--text-primary)]">
                                {formatCurrency(expense.amount)}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(expense)}
                                    className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)] text-[var(--text-secondary)] hover:text-[var(--accent-blue)]"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(expense)}
                                    className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)] text-[var(--text-secondary)] hover:text-[var(--accent-red)]"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
