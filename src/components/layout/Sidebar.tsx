'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    ChevronRight
} from 'lucide-react';

// Navigation items for the current trip
const tripNavItems = [
    { href: '/trips', icon: LayoutDashboard, label: 'Overview' },
    { href: '/trips/flights', icon: Plane, label: 'Flights' },
    { href: '/trips/accommodations', icon: Building2, label: 'Accommodations' },
    { href: '/trips/cars', icon: Car, label: 'Car Rental' },
    { href: '/trips/trains', icon: Train, label: 'Trains' },
    { href: '/trips/excursions', icon: Ticket, label: 'Excursions' },
    { href: '/trips/expenses', icon: Receipt, label: 'Expenses' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
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

            {/* All Trips Link */}
            <div className="p-4 border-b border-[var(--border-glass)]">
                <Link
                    href="/trips"
                    className={`nav-item w-full ${pathname === '/trips' ? 'active' : ''}`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>All Trips</span>
                </Link>
                <button className="glass-button w-full mt-3 flex items-center justify-center gap-2 text-sm">
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
                    <div className="glass-card p-3 mb-4">
                        <p className="text-sm font-medium text-[var(--text-primary)]">No trip selected</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">Select or create a trip to get started</p>
                    </div>
                </div>

                {/* Trip Navigation */}
                <nav className="space-y-1">
                    {tripNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

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
                                <ChevronRight className={`w-4 h-4 opacity-0 transition-opacity ${isActive ? 'opacity-100' : 'group-hover:opacity-50'}`} />
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Settings Footer */}
            <div className="p-4 border-t border-[var(--border-glass)]">
                <Link href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}>
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </Link>
            </div>
        </aside>
    );
}
