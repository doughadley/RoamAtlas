'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trip, getTrips, getTrip, setCurrentTrip as setStoredCurrentTrip, getPreferences } from '@/lib/dataService';

interface TripContextState {
    trips: Trip[];
    currentTrip: Trip | null;
    isLoading: boolean;
    refreshTrips: () => void;
    setCurrentTrip: (tripId: string | null) => void;
}

const TripContext = createContext<TripContextState | undefined>(undefined);

interface TripProviderProps {
    children: ReactNode;
}

export function TripProvider({ children }: TripProviderProps) {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [currentTrip, setCurrentTripState] = useState<Trip | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load trips on mount
    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = () => {
        setIsLoading(true);
        try {
            const allTrips = getTrips();
            setTrips(allTrips);

            // Load current trip from preferences
            const prefs = getPreferences();
            if (prefs.currentTripId) {
                const trip = getTrip(prefs.currentTripId);
                setCurrentTripState(trip || null);
            }
        } catch (error) {
            console.error('Error loading trips:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshTrips = () => {
        loadTrips();
    };

    const setCurrentTrip = (tripId: string | null) => {
        setStoredCurrentTrip(tripId || undefined);
        if (tripId) {
            const trip = getTrip(tripId);
            setCurrentTripState(trip || null);
        } else {
            setCurrentTripState(null);
        }
    };

    const value: TripContextState = {
        trips,
        currentTrip,
        isLoading,
        refreshTrips,
        setCurrentTrip,
    };

    return (
        <TripContext.Provider value={value}>
            {children}
        </TripContext.Provider>
    );
}

export function useTrips() {
    const context = useContext(TripContext);
    if (context === undefined) {
        throw new Error('useTrips must be used within a TripProvider');
    }
    return context;
}
