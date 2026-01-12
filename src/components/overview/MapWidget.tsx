import { Trip } from '@/types';
import { MapPin } from 'lucide-react';

interface MapWidgetProps {
    trip: Trip;
}

export default function MapWidget({ trip }: MapWidgetProps) {
    return (
        <div className="glass-panel relative h-full overflow-hidden group min-h-[200px]">
            {/* Map Background (SVG Pattern) */}
            <div className="absolute inset-0 bg-[#0f1e3c]">
                <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-500" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />

                    {/* Abstract Landmasses */}
                    <path d="M 50,50 Q 150,20 250,80 T 400,100" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent-blue)] opacity-50" />
                    <path d="M -20,150 Q 80,120 180,180 T 300,200" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent-cyan)] opacity-50" />
                </svg>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--bg-primary)] to-transparent">
                <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-[var(--accent-cyan)]" />
                    <span className="text-xs font-semibold text-[var(--accent-cyan)] uppercase tracking-wider">Explored Cities</span>
                </div>
                <h3 className="text-xl font-bold text-white">{trip.primaryDestination}</h3>
            </div>

            {/* Pins */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-[var(--accent-cyan)] rounded-full animate-ping absolute" />
                <div className="w-4 h-4 bg-[var(--accent-cyan)] rounded-full relative border-2 border-white shadow-lg" />
            </div>
        </div>
    );
}
