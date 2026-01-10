'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface UserMenuProps {
    onSignInClick: () => void;
}

export default function UserMenu({ onSignInClick }: UserMenuProps) {
    const { user, isAuthenticated, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isAuthenticated) {
        return (
            <button
                onClick={onSignInClick}
                className="glass-button flex items-center gap-2 text-sm"
            >
                <User className="w-4 h-4" />
                Sign In
            </button>
        );
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 glass-button pr-3"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)] max-w-[120px] truncate">
                    {user?.name}
                </span>
                <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 glass-panel p-2 animate-slide-up z-50">
                    <div className="px-3 py-2 border-b border-[var(--border-glass)] mb-2">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                    </div>

                    <button
                        onClick={() => {
                            signOut();
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-colors text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}
