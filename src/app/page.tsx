import { Sidebar, MainPanel } from '@/components/layout';
import { Plane, Building2, Car, Ticket, Receipt, MapPin, Plus } from 'lucide-react';

// Temporary stats data
const stats = [
  { label: 'Trips', value: '0', icon: MapPin, color: 'var(--accent-cyan)' },
  { label: 'Flights', value: '0', icon: Plane, color: 'var(--accent-blue)' },
  { label: 'Stays', value: '0', icon: Building2, color: 'var(--accent-green)' },
  { label: 'Rentals', value: '0', icon: Car, color: 'var(--accent-orange)' },
  { label: 'Activities', value: '0', icon: Ticket, color: 'var(--accent-purple)' },
  { label: 'Expenses', value: '$0', icon: Receipt, color: 'var(--text-muted)' },
];

export default function Home() {
  return (
    <>
      <Sidebar />
      <MainPanel
        title="Welcome to RoamAtlas"
        subtitle="Your unified travel workspace for organizing trips, bookings, and expenses."
        actions={
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Trip
          </button>
        }
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="glass-card p-5 text-center group cursor-pointer"
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${stat.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Get Started Section */}
        <div className="glass-panel p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] mx-auto mb-6 flex items-center justify-center shadow-lg">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Ready to plan your next adventure?
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Create your first trip to start organizing flights, accommodations, activities, and expenses all in one place.
          </p>
          <button className="btn-primary text-lg px-8 py-3">
            <span className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Your First Trip
            </span>
          </button>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="glass-card p-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-blue)]20 flex items-center justify-center mb-4">
              <Plane className="w-5 h-5 text-[var(--accent-blue)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Organize Bookings
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Keep all your flights, hotels, car rentals, and train tickets in one organized place.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-purple)]20 flex items-center justify-center mb-4">
              <Ticket className="w-5 h-5 text-[var(--accent-purple)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Plan Activities
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Schedule excursions, tours, and activities with all the details you need.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-green)]20 flex items-center justify-center mb-4">
              <Receipt className="w-5 h-5 text-[var(--accent-green)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Track Expenses
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Monitor your trip budget with categorized expense tracking and summaries.
            </p>
          </div>
        </div>
      </MainPanel>
    </>
  );
}
