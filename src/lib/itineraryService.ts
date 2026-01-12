
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

    // 4. Car Rentals
    const cars = dataService.getCars(tripId);
    cars.forEach(c => {
        // Pickup
        items.push({
            id: `car_pickup_${c.id}`,
            originalId: c.id,
            tripId: c.tripId,
            type: 'car_pickup',
            title: `Car Pickup: ${c.company}`,
            subtitle: c.pickupLocation,
            dateTime: c.pickupDateTime,
            color: '#f97316' // Orange
        });
        // Dropoff
        items.push({
            id: `car_dropoff_${c.id}`,
            originalId: c.id,
            tripId: c.tripId,
            type: 'car_dropoff',
            title: `Car Return: ${c.company}`,
            subtitle: c.dropoffLocation,
            dateTime: c.dropoffDateTime,
            color: '#f97316'
        });
    });

    // 5. Trains & Buses
    const trains = dataService.getTrains(tripId);
    trains.forEach(t => {
        items.push({
            id: `train_${t.id}`,
            originalId: t.id,
            tripId: t.tripId,
            type: 'train_departure',
            title: `${t.type === 'bus' ? '🚌' : '🚆'} ${t.origin} → ${t.destination}`,
            subtitle: t.operator,
            dateTime: t.departureDateTime,
            color: '#f97316' // Orange
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

/**
 * Generates the full list of day objects for the itinerary board,
 * covering the entire trip duration including any out-of-range bookings.
 */
export function generateItineraryDays(trip: Trip | undefined, items: ItineraryItem[]): DayItinerary[] {
    const dayMap: { [key: string]: ItineraryItem[] } = {};

    // 1. Map existing items
    items.forEach(item => {
        const dateKey = item.dateTime.split('T')[0];
        if (!dayMap[dateKey]) dayMap[dateKey] = [];
        dayMap[dateKey].push(item);
    });

    console.log(`[ItineraryDebug] Received ${items.length} items.`);
    console.log(`[ItineraryDebug] Mapped to dates:`, Object.keys(dayMap));
    // 2. Determine date range
    let start = trip ? new Date(trip.startDate + 'T00:00:00') : new Date();
    let end = trip ? new Date(trip.endDate + 'T00:00:00') : new Date();

    // Expand range to include all bookings
    Object.keys(dayMap).forEach(dateStr => {
        const d = new Date(dateStr + 'T00:00:00');
        if (d < start) {
            start = d;
        }
        if (d > end) {
            end = d;
        }
    });

    // 3. Generate continuous days
    const result: DayItinerary[] = [];
    const current = new Date(start);

    // Safety break to prevent infinite loops (extended for wide ranges)
    let safetyCounter = 0;
    while (current <= end && safetyCounter < 2000) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        result.push({
            date: dateKey,
            items: dayMap[dateKey] || []
        });

        current.setDate(current.getDate() + 1);
        safetyCounter++;
    }

    // 4. Sort explicitly (redundant if generation is linear, but safe)
    return result.sort((a, b) => a.date.localeCompare(b.date));
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
        case 'car_pickup': {
            const car = dataService.getCars(item.tripId).find(c => c.id === item.originalId);
            if (car) {
                dataService.updateCar(car.id, {
                    pickupDateTime: updateDateTime(car.pickupDateTime)
                });
            }
            break;
        }
        case 'car_dropoff': {
            const car = dataService.getCars(item.tripId).find(c => c.id === item.originalId);
            if (car) {
                dataService.updateCar(car.id, {
                    dropoffDateTime: updateDateTime(car.dropoffDateTime)
                });
            }
            break;
        }
        case 'train_departure': {
            const train = dataService.getTrains(item.tripId).find(t => t.id === item.originalId);
            if (train) {
                dataService.updateTrain(train.id, {
                    departureDateTime: updateDateTime(train.departureDateTime)
                });
            }
            break;
        }
    }
}
