import { ExpenseCategory } from '@/lib/dataService';
import { Trip } from '@/types';

interface BudgetWidgetProps {
    trip: Trip;
    breakdown: ExpenseCategory[];
}

export default function BudgetWidget({ trip, breakdown }: BudgetWidgetProps) {
    // Generate conic gradient string
    let currentDeg = 0;
    const gradientParts = breakdown.map(cat => {
        const start = currentDeg;
        const end = currentDeg + (cat.percentage * 3.6);
        currentDeg = end;
        return `${cat.color} ${start}deg ${end}deg`;
    });

    // Fallback if no data
    const gradient = breakdown.length > 0
        ? `conic-gradient(${gradientParts.join(', ')})`
        : 'conic-gradient(var(--bg-secondary) 0deg 360deg)';

    const totalSpent = breakdown.reduce((sum, c) => sum + c.amount, 0);

    return (
        <div className="glass-panel p-6 h-full flex flex-col">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-6">Budget Overview</h3>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 rounded-full mb-8 shadow-inner"
                    style={{ background: gradient }}>
                    {/* Inner hole for Donut */}
                    <div className="absolute inset-4 bg-[#0a1628] rounded-full flex items-center justify-center flex-col">
                        <span className="text-sm text-[var(--text-secondary)]">Total Spent</span>
                        <span className="text-2xl font-bold text-[var(--text-primary)]">
                            ${Math.round(totalSpent).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2">
                    {breakdown.slice(0, 4).map(cat => (
                        <div key={cat.category} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                            <span className="text-xs text-[var(--text-muted)] flex-1">{cat.label}</span>
                            <span className="text-xs font-medium text-[var(--text-primary)]">{Math.round(cat.percentage)}%</span>
                        </div>
                    ))}
                    {breakdown.length > 4 && (
                        <div className="col-span-2 text-center mt-2">
                            <span className="text-xs text-[var(--text-muted)]">+ {breakdown.length - 4} more categories</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
