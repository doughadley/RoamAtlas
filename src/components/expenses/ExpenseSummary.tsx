'use client';

import { Expense } from '@/types';
import { DollarSign, PieChart, TrendingUp } from 'lucide-react';

interface CombinedExpense {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    currency: string;
    source: string;
    isEditable: boolean;
}

interface ExpenseSummaryProps {
    expenses: Expense[];
    allExpenses?: CombinedExpense[];
    currency?: string;
}

export default function ExpenseSummary({ expenses, allExpenses, currency = 'USD' }: ExpenseSummaryProps) {
    // Use combined expenses if available, otherwise fall back to manual expenses
    const displayExpenses = allExpenses || expenses.map(e => ({
        id: e.id,
        date: e.date,
        description: e.description,
        category: e.category,
        amount: e.amount,
        currency: e.currency,
        source: 'manual',
        isEditable: true
    }));

    const totalCost = displayExpenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryTotals = displayExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    // Calculate max category for progress bar scaling
    const maxCategoryAmount = Math.max(...Object.values(categoryTotals), 0);

    const categories: { key: string; label: string; color: string }[] = [
        { key: 'flight', label: 'Flights', color: 'bg-blue-500' },
        { key: 'accommodation', label: 'Stays', color: 'bg-green-500' },
        { key: 'transport', label: 'Transport', color: 'bg-orange-500' },
        { key: 'food', label: 'Food', color: 'bg-yellow-500' },
        { key: 'excursion', label: 'Activities', color: 'bg-purple-500' },
        { key: 'other', label: 'Other', color: 'bg-gray-500' },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Total Card */}
            <div className="glass-panel p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <DollarSign className="w-32 h-32 text-[var(--accent-cyan)]" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Total Trip Cost
                    </h3>
                    <div className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                        {formatCurrency(totalCost)}
                    </div>
                    <p className="text-[var(--text-muted)] text-sm mt-2">
                        {displayExpenses.length} transaction{displayExpenses.length !== 1 ? 's' : ''} recorded
                    </p>
                </div>
            </div>

            {/* Breakdown Card */}
            <div className="glass-panel p-6">
                <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-4 flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    Spending by Category
                </h3>
                <div className="space-y-3">
                    {categories.map((cat) => {
                        const amount = categoryTotals[cat.key] || 0;
                        if (amount === 0) return null;
                        const percentage = maxCategoryAmount > 0 ? (amount / maxCategoryAmount) * 100 : 0;

                        return (
                            <div key={cat.key} className="group">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-[var(--text-primary)]">{cat.label}</span>
                                    <span className="font-medium text-[var(--text-secondary)]">
                                        {formatCurrency(amount)}
                                    </span>
                                </div>
                                <div className="h-2 bg-[var(--bg-glass-hover)] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${cat.color} transition-all duration-500 ease-out`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {displayExpenses.length === 0 && (
                        <div className="text-center py-4 text-[var(--text-muted)] text-sm italic">
                            No expenses recorded yet. Note down your first purchase!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
