import { ExpenseCategory } from '@/lib/dataService';

interface ExpenseWidgetProps {
    breakdown: ExpenseCategory[];
}

export default function ExpenseWidget({ breakdown }: ExpenseWidgetProps) {
    const maxAmount = Math.max(...breakdown.map(c => c.amount), 1); // Avoid division by zero

    return (
        <div className="glass-panel p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Expenses by Category</h3>
                <div className="text-xs text-[var(--text-muted)]">
                    Total: ${breakdown.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                </div>
            </div>

            <div className="flex-1 flex items-end justify-around gap-4 min-h-[160px]">
                {breakdown.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] italic text-sm">
                        No expenses recorded yet.
                    </div>
                ) : (
                    breakdown.map((cat) => (
                        <div key={cat.category} className="flex flex-col items-center gap-2 group w-full">
                            {/* Tooltip Amount */}
                            <span className="text-xs font-semibold text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                                ${Math.round(cat.amount)}
                            </span>

                            {/* Bar */}
                            <div
                                className="w-full max-w-[40px] rounded-t-lg transition-all duration-500 hover:opacity-80 relative"
                                style={{
                                    height: `${(cat.amount / maxAmount) * 100}%`,
                                    background: cat.color,
                                    minHeight: '4px'
                                }}
                            >
                            </div>

                            {/* Label */}
                            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] text-center truncate w-full">
                                {cat.label}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
