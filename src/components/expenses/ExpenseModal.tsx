'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign, FileText, Calendar, Tag, CreditCard } from 'lucide-react';
import { Expense } from '@/types';
import { createExpense, updateExpense } from '@/lib/dataService';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    expense?: Expense | null;
    onSave: () => void;
}

export default function ExpenseModal({ isOpen, onClose, tripId, expense, onSave }: ExpenseModalProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState<Expense['category']>('food');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isEditing = !!expense;

    useEffect(() => {
        if (!isOpen) return;

        if (expense) {
            setDescription(expense.description);
            setAmount(expense.amount.toString());
            setDate(expense.date);
            setCategory(expense.category);
            setPaymentMethod(expense.paymentMethod || '');
        } else {
            setDescription('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setCategory('food');
            setPaymentMethod('');
        }
    }, [expense, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const expenseData = {
            tripId,
            description,
            amount: parseFloat(amount),
            date,
            category,
            paymentMethod: paymentMethod || undefined,
            currency: 'USD', // Default currency for now
        };

        try {
            if (isEditing && expense) {
                updateExpense(expense.id, expenseData);
            } else {
                createExpense(expenseData);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to save expense:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            {/* Modal */}
            <div className="glass-panel relative z-10 w-full max-w-md p-8 mx-4 animate-slide-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors"
                >
                    <X className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>

                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                    {isEditing ? 'Edit Expense' : 'Add Expense'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Cost</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="glass-input pl-12 text-lg font-bold"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Description</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Dinner at..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="glass-input pl-12"
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Category</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as any)}
                                className="glass-input pl-12 appearance-none"
                            >
                                <option value="food">Food & Dining</option>
                                <option value="transport">Transport</option>
                                <option value="accommodation">Accommodation</option>
                                <option value="excursion">Activities</option>
                                <option value="flight">Flights</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="glass-input pl-12"
                                required
                            />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Payment Method</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Credit Card, Cash..."
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="glass-input pl-12"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="glass-button flex-1 py-3">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-3">
                            {isLoading ? 'Saving...' : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
