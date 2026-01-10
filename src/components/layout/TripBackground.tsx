'use client';

import { useMemo, useState } from 'react';

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
        .replace(/\s+/g, ',');

    // Use Unsplash Source for a random photo matching the destination
    return `https://source.unsplash.com/1920x1080/?${searchTerm},travel,landscape`;
}

export default function TripBackground({ destination, children }: TripBackgroundProps) {
    const imageUrl = useMemo(() => getDestinationImageUrl(destination), [destination]);
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <>
            {/* Hidden image to preload */}
            <img
                src={imageUrl}
                alt=""
                className="hidden"
                onLoad={() => setImageLoaded(true)}
            />

            {/* Background Image Layer - positioned behind sidebar */}
            <div
                className="fixed inset-0 w-full h-screen z-[-1]"
                style={{
                    backgroundImage: imageLoaded ? `url('${imageUrl}')` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: imageLoaded ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                }}
            >
                {/* Gradient overlay - lighter to show more of the image */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `
                            linear-gradient(
                                to bottom,
                                rgba(10, 22, 40, 0.7) 0%,
                                rgba(10, 22, 40, 0.75) 30%,
                                rgba(10, 22, 40, 0.85) 70%,
                                rgba(10, 22, 40, 0.95) 100%
                            )
                        `,
                    }}
                />
            </div>

            {/* Content - no wrapper div needed, children render normally */}
            {children}
        </>
    );
}
