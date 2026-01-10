'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    MapPin,
    LayoutDashboard,
    PlusCircle,
    Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrips } from '@/contexts/TripContext';
import { UserMenu, AuthModal } from '@/components/auth';
import { TripModal } from '@/components/trips';

export default function Sidebar() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();
    const { currentTrip, trips } = useTrips();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showTripModal, setShowTripModal] = useState(false);

    return (
        <>
            <aside className="fixed left-0 top-0 h-screen w-[280px] glass-panel border-r border-[var(--border-glass)] flex flex-col z-50">
                {/* Logo */}
                <div className="p-6 border-b border-[var(--border-glass)]">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] flex items-center justify-center shadow-lg group-hover:shadow-[var(--shadow-glow)] transition-all">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gradient">RoamAtlas</h1>
                            <p className="text-xs text-[var(--text-muted)]">Travel Dashboard</p>
                        </div>
                    </Link>
                </div>

                {/* User Menu */}
                <div className="p-4 border-b border-[var(--border-glass)]">
                    <UserMenu onSignInClick={() => setShowAuthModal(true)} />
                </div>

                {/* All Trips Link */}
                <div className="p-4 border-b border-[var(--border-glass)]">
                    <Link
                        href="/trips"
                        className={`nav-item w-full ${pathname === '/trips' ? 'active' : ''}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>All Trips ({trips.filter(t => t.status === 'active').length})</span>
                    </Link>
                    <button
                        onClick={() => setShowTripModal(true)}
                        className="glass-button w-full mt-3 flex items-center justify-center gap-2 text-sm"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>New Trip</span>
                    </button>
                </div>

                {/* Current Trip Section */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-4">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-3 mb-2">
                            Current Trip
                        </h2>
                        {currentTrip ? (
                            <Link href={`/trips/${currentTrip.id}`}>
                                <div className="glass-card p-3 hover:bg-[var(--bg-glass-hover)]">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-[var(--accent-cyan)]" />
                                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                            {currentTrip.name}
                                        </p>
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
                                        {currentTrip.primaryDestination}
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">
                                        {new Date(currentTrip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(currentTrip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </Link>
                        ) : (
                            <div className="glass-card p-3">
                                {isAuthenticated ? (
                                    <>
                                        <p className="text-sm font-medium text-[var(--text-primary)]">No trip selected</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">Select or create a trip to get started</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-[var(--text-primary)]">Welcome, Guest</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">Sign in to save your trips</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Settings Footer */}
                <div className="p-4 border-t border-[var(--border-glass)]">
                    <Link href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}>
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                    </Link>
                </div>
            </aside>

            {/* Modals */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            <TripModal isOpen={showTripModal} onClose={() => setShowTripModal(false)} />
        </>
    );
}
