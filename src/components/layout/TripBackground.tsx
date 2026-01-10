'use client';

import { useMemo } from 'react';

interface TripBackgroundProps {
    destination: string;
    children: React.ReactNode;
}

// Unsplash Source API provides free high-quality photos by search term
// No API key required for source.unsplash.com
function getDestinationImageUrl(destination: string): string {
    // Clean up destination for URL (e.g., "Rome, Italy" -> "Rome+Italy")
    const searchTerm = destination
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '+');

    // Use Unsplash Source for a random photo matching the destination
    // The featured collection provides higher quality curated photos
    return `https://source.unsplash.com/featured/1920x1080/?${searchTerm},travel,city`;
}

export default function TripBackground({ destination, children }: TripBackgroundProps) {
    const imageUrl = useMemo(() => getDestinationImageUrl(destination), [destination]);

    return (
        <div className="relative min-h-screen">
            {/* Background Image Layer */}
            <div
                className="fixed top-0 right-0 w-[calc(100%-280px)] h-screen pointer-events-none z-0"
                style={{
                    backgroundImage: `url('${imageUrl}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/85 via-[var(--bg-primary)]/90 to-[var(--bg-primary)]" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
