
'use client';

import { useParams, notFound } from 'next/navigation';
import TripBackground from '@/components/layout/TripBackground';
import Sidebar from '@/components/layout/Sidebar';
import MainPanel from '@/components/layout/MainPanel';
import TripTabs from '@/components/layout/TripTabs';
import { useTrips } from '@/contexts/TripContext';
import { ItineraryBoard } from '@/components/itinerary/ItineraryBoard';

export default function ItineraryPage() {
    const params = useParams();
    const tripId = params.tripId as string;
    const { trips } = useTrips();
    const trip = trips.find(t => t.id === tripId);

    if (!trip && trips.length > 0) {
        // If trips are loaded but ID not found
        notFound();
    }

    // While loading... (trips empty)
    if (!trip) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
            </div>
        );
    }

    return (
        <TripBackground destination={trip.primaryDestination}>
            <div className="flex min-h-screen">
                <Sidebar />
                <MainPanel
                    title={trip.name}
                    subtitle="Interactive Timeline"
                    actions={
                        <button className="btn-glass text-sm px-4 py-2">
                            Export PDF
                        </button>
                    }
                >
                    <TripTabs tripId={tripId} />

                    <div className="h-[calc(100vh-200px)] mt-6">
                        <ItineraryBoard tripId={tripId} />
                    </div>
                </MainPanel>
            </div>
        </TripBackground>
    );
}
