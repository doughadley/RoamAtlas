'use client';

import { useMemo, useEffect, useState } from 'react';

interface TripBackgroundProps {
    destination: string;
    children: React.ReactNode;
}

// Use Picsum for reliable placeholder images, or Unsplash with direct URL
function getDestinationImageUrl(destination: string): string {
    // Clean up destination for search
    const searchTerm = destination
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .toLowerCase();

    // Use a hash of the destination to get a consistent but varied image
    // This ensures same destination always shows same image
    let hash = 0;
    for (let i = 0; i < searchTerm.length; i++) {
        hash = ((hash << 5) - hash) + searchTerm.charCodeAt(i);
        hash = hash & hash;
    }
    const seed = Math.abs(hash) % 1000;

    // Use Picsum with seed for consistent, reliable images
    return `https://picsum.photos/seed/${searchTerm}${seed}/1920/1080`;
}

export default function TripBackground({ destination, children }: TripBackgroundProps) {
    const imageUrl = useMemo(() => getDestinationImageUrl(destination), [destination]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Preload the image
        const img = new Image();
        img.onload = () => setLoaded(true);
        img.src = imageUrl;
    }, [imageUrl]);

    return (
        <>
            {/* Background Image Layer */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: -1,
                    backgroundImage: loaded ? `url('${imageUrl}')` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.8s ease-in-out',
                }}
            >
                {/* Gradient overlay for readability */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `
                            linear-gradient(
                                135deg,
                                rgba(10, 22, 40, 0.75) 0%,
                                rgba(10, 22, 40, 0.65) 50%,
                                rgba(10, 22, 40, 0.8) 100%
                            )
                        `,
                    }}
                />
            </div>

            {/* Content */}
            {children}
        </>
    );
}
