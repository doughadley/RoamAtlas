'use client';

import { useMemo, useEffect, useState } from 'react';

interface TripBackgroundProps {
    destination: string;
    children: React.ReactNode;
}

// Use Unsplash with proper format for destination-specific images
function getDestinationImageUrl(destination: string): string {
    // Clean up destination for URL (e.g., "Rome, Italy" -> "rome,italy")
    const searchTerm = encodeURIComponent(
        destination
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s,]/g, '')
            .trim()
    );

    // Try multiple Unsplash approaches
    // Using the random endpoint with a search query
    return `https://source.unsplash.com/1920x1080/?${searchTerm}`;
}

// Curated images - ARRAY ORDER MATTERS! More specific locations come first
const DESTINATION_IMAGES: [string, string][] = [
    // Specific cities/regions first (most specific)
    ['chamonix', 'https://images.unsplash.com/photo-1601752943749-7dd8d89f407a?w=1920&q=80'], // Mont Blanc valley
    ['mont blanc', 'https://images.unsplash.com/photo-1601752943749-7dd8d89f407a?w=1920&q=80'],
    ['alps', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80'], // Swiss Alps
    ['rome', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&q=80'],
    ['paris', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80'],
    ['tokyo', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80'],
    ['london', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80'],
    ['new york', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80'],
    ['barcelona', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1920&q=80'],
    ['bali', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=80'],
    ['hawaii', 'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=1920&q=80'],
    // Countries last (broader matches)
    ['switzerland', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1920&q=80'],
    ['france', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80'],
    ['italy', 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1920&q=80'],
    ['japan', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80'],
    ['spain', 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=1920&q=80'],
    ['greece', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1920&q=80'],
    ['thailand', 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1920&q=80'],
];

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80';

function findBestImage(destination: string): string {
    const lowerDest = destination.toLowerCase();

    // Check for matches in order (specific first, then broader)
    for (const [key, url] of DESTINATION_IMAGES) {
        if (lowerDest.includes(key)) {
            return url;
        }
    }

    // Fallback to dynamic Unsplash search
    return getDestinationImageUrl(destination);
}

export default function TripBackground({ destination, children }: TripBackgroundProps) {
    const imageUrl = useMemo(() => findBestImage(destination), [destination]);
    const [loaded, setLoaded] = useState(false);
    const [currentUrl, setCurrentUrl] = useState(imageUrl);

    useEffect(() => {
        setLoaded(false);
        const img = new Image();
        img.onload = () => {
            setCurrentUrl(imageUrl);
            setLoaded(true);
        };
        img.onerror = () => {
            // Fallback to default travel image
            setCurrentUrl(DEFAULT_IMAGE);
            setLoaded(true);
        };
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
                    backgroundImage: loaded ? `url('${currentUrl}')` : 'none',
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
