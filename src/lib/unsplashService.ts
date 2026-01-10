// Unsplash API service for fetching destination photos
// Get your free API key at: https://unsplash.com/developers

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '';

interface UnsplashPhoto {
    id: string;
    urls: {
        raw: string;
        full: string;
        regular: string;
        small: string;
    };
    description: string | null;
    alt_description: string | null;
}

interface UnsplashSearchResponse {
    results: UnsplashPhoto[];
    total: number;
}

// Cache for storing fetched image URLs to avoid repeated API calls
const imageCache: Map<string, string> = new Map();

/**
 * Fetch a destination photo from Unsplash API
 * @param destination - The destination to search for (e.g., "Chamonix, France")
 * @returns The image URL or null if not found
 */
export async function fetchDestinationImage(destination: string): Promise<string | null> {
    // Check cache first
    const cacheKey = destination.toLowerCase().trim();
    if (imageCache.has(cacheKey)) {
        return imageCache.get(cacheKey)!;
    }

    // If no API key, return null
    if (!UNSPLASH_ACCESS_KEY) {
        console.warn('Unsplash API key not configured. Add NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to .env.local');
        return null;
    }

    try {
        const searchQuery = encodeURIComponent(`${destination} travel landscape`);
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=1&orientation=landscape`,
            {
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                },
            }
        );

        if (!response.ok) {
            console.error('Unsplash API error:', response.status);
            return null;
        }

        const data: UnsplashSearchResponse = await response.json();

        if (data.results.length > 0) {
            // Use regular size (1080px width) for good quality without huge downloads
            const imageUrl = data.results[0].urls.regular;
            imageCache.set(cacheKey, imageUrl);
            return imageUrl;
        }

        return null;
    } catch (error) {
        console.error('Error fetching Unsplash image:', error);
        return null;
    }
}

/**
 * Get a fallback image URL using Unsplash Source (may not always work)
 * This is a backup when no API key is available
 */
export function getFallbackImageUrl(destination: string): string {
    const searchTerm = encodeURIComponent(
        destination
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s,]/g, '')
            .trim()
    );

    // Using Unsplash Source as fallback (may return generic images)
    return `https://source.unsplash.com/1920x1080/?${searchTerm},travel,landscape`;
}

// Curated fallback images for common destinations (when API unavailable)
export const CURATED_IMAGES: Record<string, string> = {
    'chamonix': 'https://images.unsplash.com/photo-1598374461148-a13e5eb53835?w=1920&q=80',
    'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
    'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&q=80',
    'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80',
    'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80',
    'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80',
    'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80',
};

export function getCuratedImage(destination: string): string | null {
    const lowerDest = destination.toLowerCase();
    for (const [key, url] of Object.entries(CURATED_IMAGES)) {
        if (lowerDest.includes(key)) {
            return url;
        }
    }
    return null;
}
