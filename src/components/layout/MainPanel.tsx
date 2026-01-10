'use client';

import { ReactNode } from 'react';

interface MainPanelProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
}

export default function MainPanel({ children, title, subtitle, actions }: MainPanelProps) {
    return (
        <main className="ml-[280px] min-h-screen p-8">
            {/* Header */}
            {(title || actions) && (
                <header className="mb-8 flex items-start justify-between animate-fade-in">
                    <div>
                        {title && (
                            <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-[var(--text-secondary)] mt-2 text-lg">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-3">
                            {actions}
                        </div>
                    )}
                </header>
            )}

            {/* Content */}
            <div className="animate-slide-up">
                {children}
            </div>
        </main>
    );
}
