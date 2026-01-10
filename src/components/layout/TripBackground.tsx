'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchDestinationImage, getCuratedImage, getFallbackImageUrl, CURATED_IMAGES } from '@/lib/unsplashService';

interface TripBackgroundProps {
    destination: string;
    children: React.ReactNode;
}

export default function TripBackground({ destination, children }: TripBackgroundProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    // First, check for curated image (instant, no API call)
    const curatedImage = useMemo(() => getCuratedImage(destination), [destination]);

    useEffect(() => {
        let cancelled = false;

        async function loadImage() {
            setLoaded(false);

            // Priority 1: Use curated image if available
            if (curatedImage) {
                setImageUrl(curatedImage);
                preloadImage(curatedImage);
                return;
            }

            // Priority 2: Try Unsplash API (if key configured)
            const apiImage = await fetchDestinationImage(destination);
            if (!cancelled && apiImage) {
                setImageUrl(apiImage);
                preloadImage(apiImage);
                return;
            }

            // Priority 3: Use fallback URL (Unsplash Source)
            if (!cancelled) {
                const fallback = getFallbackImageUrl(destination);
                setImageUrl(fallback);
                preloadImage(fallback);
            }
        }

        function preloadImage(url: string) {
            const img = new Image();
            img.onload = () => {
                if (!cancelled) setLoaded(true);
            };
            img.onerror = () => {
                // On error, use default travel image
                if (!cancelled) {
                    setImageUrl(CURATED_IMAGES.default);
                    setLoaded(true);
                }
            };
            img.src = url;
        }

        loadImage();

        return () => {
            cancelled = true;
        };
    }, [destination, curatedImage]);

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
                    backgroundImage: loaded && imageUrl ? `url('${imageUrl}')` : 'none',
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
