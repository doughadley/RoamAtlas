import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionLink?: string;
    onAction?: () => void;
    children?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionLink, onAction, children }: EmptyStateProps) {
    const Button = () => (
        <button
            onClick={onAction}
            className="px-4 py-2 bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border border-[var(--accent-blue)]/20 rounded-lg hover:bg-[var(--accent-blue)]/20 transition-colors text-sm font-medium"
        >
            {actionLabel}
        </button>
    );

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-[var(--border-glass)] bg-white/5 border-dashed">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-glass)] flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-[var(--text-muted)] opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">{title}</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">{description}</p>

            {children ? (
                children
            ) : actionLabel && (
                actionLink ? (
                    <Link href={actionLink}>
                        <Button />
                    </Link>
                ) : (
                    <Button />
                )
            )}
        </div>
    );
}
