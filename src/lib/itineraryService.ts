
import {
    Flight,
    Accommodation,
    Excursion,
    CarRental,
    Train,
    Trip
} from '@/types';
import * as dataService from './dataService';

export type ItineraryItemType =
    | 'flight_departure'
    | 'flight_arrival'
    | 'check_in'
    | 'check_out'
    | 'car_pickup'
    | 'car_dropoff'
    | 'train_departure'
    | 'train_arrival'
    | 'activity';

export interface ItineraryItem {
    id: string; // Composite ID: type_originalId
    originalId: string;
    tripId: string;
    type: ItineraryItemType;
    title: string;
    subtitle?: string;
    dateTime: string; // ISO String
    sortOrder?: number; // For manual ordering within same time
    icon?: string;
    color?: string; // Hex code for border/accent
}

export interface DayItinerary {
    date: string; // YYYY-MM-DD
    items: ItineraryItem[];
}

/**
 * Generates a comprehensive list of itinerary items from all bookings
 */
export function getItineraryItems(tripId: string): ItineraryItem[] {
    const items: ItineraryItem[] = [];

    // 1. Flights
    const flights = dataService.getFlights(tripId);
    flights.forEach(f => {
        // Departure
        items.push({
            id: `flight_dep_${f.id}`,
            originalId: f.id,
            tripId: f.tripId,
            type: 'flight_departure',
            title: `Flight to ${f.destination}`,
            subtitle: `${f.airline} ${f.flightNumber}`,
            dateTime: f.departureDateTime,
            color: '#3b82f6' // Blue
        });
        // Arrival
        items.push({
            id: `flight_arr_${f.id}`,
            originalId: f.id,
            tripId: f.tripId,
            type: 'flight_arrival',
            title: `Arrive in ${f.destination}`,
            subtitle: f.airline,
            dateTime: f.arrivalDateTime,
            color: '#3b82f6'
        });
    });

    // 2. Accommodations
    const accommodations = dataService.getAccommodations(tripId);
    accommodations.forEach(a => {
        // Check-in
        items.push({
            id: `accom_in_${a.id}`,
            originalId: a.id,
            tripId: a.tripId,
            type: 'check_in',
            title: `Check-in: ${a.propertyName}`,
            subtitle: a.address,
            dateTime: a.checkInDateTime, // Assuming user entered time or default
            color: '#22c55e' // Green
        });
        // Check-out
        items.push({
            id: `accom_out_${a.id}`,
            originalId: a.id,
            tripId: a.tripId,
            type: 'check_out',
            title: `Check-out: ${a.propertyName}`,
            subtitle: '11:00 AM', // Default or need field
            dateTime: a.checkOutDateTime,
            color: '#22c55e'
        });
    });

    // 3. Excursions
    const excursions = dataService.getExcursions(tripId);
    excursions.forEach(e => {
        let dateTime = e.date;
        if (e.startTime) {
            // Combine date and startTime if separated
            // StartTime might be "14:00" or "2:00 PM"
            // For robust parsing, we might need a helper, but assuming simple ISO or consolidated in future
            // Current Excursion interface has 'date' (YYYY-MM-DD) and 'startTime' (string)
            // We construct a sortable string
            dateTime = `${e.date}T${convertTo24Hour(e.startTime)}`;
        } else {
            dateTime = `${e.date}T12:00:00`; // Default to noon
        }

        items.push({
            id: `excursion_${e.id}`,
            originalId: e.id,
            tripId: e.tripId,
            type: 'activity',
            title: e.title,
            subtitle: e.category,
            dateTime: dateTime,
            color: '#a855f7' // Purple
        });
    });

    return items.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
}

/**
 * Groups items by day
 */
export function getDidItineraryByDay(tripId: string): DayItinerary[] {
    const items = getItineraryItems(tripId);
    const days: { [key: string]: ItineraryItem[] } = {};

    items.forEach(item => {
        const dateKey = item.dateTime.split('T')[0];
        if (!days[dateKey]) days[dateKey] = [];
        days[dateKey].push(item);
    });

    return Object.entries(days)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, items]) => ({ date, items }));
}

// Helper to handle time strings loosely (e.g. "2:00 PM" -> "14:00:00")
function convertTo24Hour(timeStr: string): string {
    if (!timeStr) return '00:00:00';
    // Basic heuristics
    const lower = timeStr.toLowerCase().trim();
    const isPM = lower.includes('pm');
    const isAM = lower.includes('am');
    let [hours, minutes] = lower.replace(/[a-z]/g, '').split(':').map(Number);

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    // Add leading zeros
    return `${hours.toString().padStart(2, '0')}:${(minutes || 0).toString().padStart(2, '0')}:00`;
}

export function updateItemDate(item: ItineraryItem, newDate: string): void {
    const updateDateTime = (originalIso: string) => {
        const timePart = originalIso.includes('T') ? originalIso.split('T')[1] : '12:00:00';
        return `${newDate}T${timePart}`;
    };

    switch (item.type) {
        case 'flight_departure': {
            const flight = dataService.getFlights(item.tripId).find(f => f.id === item.originalId);
            if (flight) {
                dataService.updateFlight(flight.id, {
                    departureDateTime: updateDateTime(flight.departureDateTime)
                });
            }
            break;
        }
        case 'flight_arrival': {
            const flight = dataService.getFlights(item.tripId).find(f => f.id === item.originalId);
            if (flight) {
                dataService.updateFlight(flight.id, {
                    arrivalDateTime: updateDateTime(flight.arrivalDateTime)
                });
            }
            break;
        }
        case 'check_in': {
            const stay = dataService.getAccommodations(item.tripId).find(a => a.id === item.originalId);
            if (stay) {
                dataService.updateAccommodation(stay.id, {
                    checkInDateTime: updateDateTime(stay.checkInDateTime)
                });
            }
            break;
        }
        case 'check_out': {
            const stay = dataService.getAccommodations(item.tripId).find(a => a.id === item.originalId);
            if (stay) {
                dataService.updateAccommodation(stay.id, {
                    checkOutDateTime: updateDateTime(stay.checkOutDateTime)
                });
            }
            break;
        }
        case 'activity': {
            const exc = dataService.getExcursions(item.tripId).find(e => e.id === item.originalId);
            if (exc) {
                dataService.updateExcursion(exc.id, {
                    date: newDate
                });
            }
            break;
        }
    }
}
