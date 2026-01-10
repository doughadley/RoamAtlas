'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    MapPin,
    Plane,
    Building2,
    Car,
    Train,
    Ticket,
    Receipt,
    LayoutDashboard,
    PlusCircle,
    Settings,
    ChevronRight,
    Calendar
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

    // Generate navigation items based on current trip
    const tripNavItems = currentTrip ? [
        { href: `/trips/${currentTrip.id}`, icon: LayoutDashboard, label: 'Overview' },
        { href: `/trips/${currentTrip.id}/calendar`, icon: Calendar, label: 'Calendar' },
        { href: `/trips/${currentTrip.id}/flights`, icon: Plane, label: 'Flights' },
        { href: `/trips/${currentTrip.id}/accommodations`, icon: Building2, label: 'Accommodations' },
        { href: `/trips/${currentTrip.id}/cars`, icon: Car, label: 'Car Rental' },
        { href: `/trips/${currentTrip.id}/trains`, icon: Train, label: 'Trains' },
        { href: `/trips/${currentTrip.id}/excursions`, icon: Ticket, label: 'Excursions' },
        { href: `/trips/${currentTrip.id}/expenses`, icon: Receipt, label: 'Expenses' },
    ] : [];

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
                                <div className="glass-card p-3 mb-4 hover:bg-[var(--bg-glass-hover)]">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-[var(--accent-cyan)]" />
                                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                            {currentTrip.name}
                                        </p>
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
                                        {currentTrip.primaryDestination}
                                    </p>
                                </div>
                            </Link>
                        ) : (
                            <div className="glass-card p-3 mb-4">
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

                    {/* Trip Navigation - Only show if trip selected */}
                    {currentTrip && (
                        <nav className="space-y-1">
                            {tripNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`nav-item justify-between ${isActive ? 'active' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-5 h-5" />
                                            <span>{item.label}</span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 opacity-0 transition-opacity ${isActive ? 'opacity-100' : ''}`} />
                                    </Link>
                                );
                            })}
                        </nav>
                    )}
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
