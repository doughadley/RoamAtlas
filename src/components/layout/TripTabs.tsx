'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Plane,
    Building2,
    Car,
    Train,
    Ticket,
    Receipt
} from 'lucide-react';

interface TripTabsProps {
    tripId: string;
}

const tabs = [
    { id: 'overview', href: '', icon: LayoutDashboard, label: 'Overview' },
    { id: 'calendar', href: '/calendar', icon: Calendar, label: 'Calendar' },
    { id: 'flights', href: '/flights', icon: Plane, label: 'Flights' },
    { id: 'accommodations', href: '/accommodations', icon: Building2, label: 'Stays' },
    { id: 'cars', href: '/cars', icon: Car, label: 'Cars' },
    { id: 'trains', href: '/trains', icon: Train, label: 'Trains' },
    { id: 'excursions', href: '/excursions', icon: Ticket, label: 'Activities' },
    { id: 'expenses', href: '/expenses', icon: Receipt, label: 'Expenses' },
];

export default function TripTabs({ tripId }: TripTabsProps) {
    const pathname = usePathname();
    const basePath = `/trips/${tripId}`;

    const getIsActive = (tabHref: string) => {
        const fullPath = basePath + tabHref;
        if (tabHref === '') {
            return pathname === basePath;
        }
        return pathname === fullPath || pathname.startsWith(fullPath + '/');
    };

    return (
        <div className="mb-6">
            <div className="glass-panel p-1 flex flex-wrap gap-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = getIsActive(tab.href);
                    const fullHref = basePath + tab.href;

                    return (
                        <Link
                            key={tab.id}
                            href={fullHref}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] text-white shadow-lg'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-primary)]'
                                }
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
