import { Flight, Accommodation, Excursion, CarRental, Train } from '@/types';

export interface CalendarEvent {
    id: string;
    type: 'flight' | 'accommodation' | 'excursion' | 'car' | 'train';
    title: string;
    subtitle?: string;
    date: string; // YYYY-MM-DD
    startTime?: string;
    endTime?: string;
    color: string;
    icon: 'plane' | 'building' | 'ticket' | 'car' | 'train';
    data: Flight | Accommodation | Excursion | CarRental | Train;
}

export function aggregateCalendarEvents(
    flights: Flight[],
    accommodations: Accommodation[],
    excursions: Excursion[],
    cars: CarRental[] = [],
    trains: Train[] = []
): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    // Add flights - both departure and arrival as separate events
    flights.forEach(flight => {
        const depDate = new Date(flight.departureDateTime);
        const arrDate = new Date(flight.arrivalDateTime);

        // Departure event
        events.push({
            id: `${flight.id}-dep`,
            type: 'flight',
            title: `${flight.origin} → ${flight.destination}`,
            subtitle: `${flight.airline} ${flight.flightNumber}`,
            date: depDate.toISOString().split('T')[0],
            startTime: depDate.toTimeString().slice(0, 5),
            color: 'var(--accent-blue)',
            icon: 'plane',
            data: flight,
        });

        // If arrival is on different day, add arrival event too
        if (depDate.toDateString() !== arrDate.toDateString()) {
            events.push({
                id: `${flight.id}-arr`,
                type: 'flight',
                title: `Arrive ${flight.destination}`,
                subtitle: `${flight.airline} ${flight.flightNumber}`,
                date: arrDate.toISOString().split('T')[0],
                startTime: arrDate.toTimeString().slice(0, 5),
                color: 'var(--accent-blue)',
                icon: 'plane',
                data: flight,
            });
        }
    });

    // Add accommodations - check-in and check-out events
    accommodations.forEach(acc => {
        const checkIn = new Date(acc.checkInDateTime);
        const checkOut = new Date(acc.checkOutDateTime);

        // Check-in event
        events.push({
            id: `${acc.id}-in`,
            type: 'accommodation',
            title: `In: ${acc.propertyName}`,
            subtitle: acc.address,
            date: checkIn.toISOString().split('T')[0],
            startTime: checkIn.toTimeString().slice(0, 5),
            color: 'var(--accent-green)',
            icon: 'building',
            data: acc,
        });

        // Check-out event
        events.push({
            id: `${acc.id}-out`,
            type: 'accommodation',
            title: `Out: ${acc.propertyName}`,
            subtitle: acc.address,
            date: checkOut.toISOString().split('T')[0],
            startTime: checkOut.toTimeString().slice(0, 5),
            color: 'var(--accent-green)',
            icon: 'building',
            data: acc,
        });
    });

    // Add excursions
    excursions.forEach(exc => {
        events.push({
            id: exc.id,
            type: 'excursion',
            title: exc.title,
            subtitle: exc.location,
            date: exc.date,
            startTime: exc.startTime,
            endTime: exc.endTime,
            color: 'var(--accent-purple)',
            icon: 'ticket',
            data: exc,
        });
    });

    // Add car rentals
    cars.forEach(car => {
        const pickup = new Date(car.pickupDateTime);
        const dropoff = new Date(car.dropoffDateTime);

        events.push({
            id: `${car.id}-pickup`,
            type: 'car',
            title: `Car Pickup: ${car.company}`,
            subtitle: car.pickupLocation,
            date: pickup.toISOString().split('T')[0],
            startTime: pickup.toTimeString().slice(0, 5),
            color: 'var(--accent-orange)',
            icon: 'car',
            data: car,
        });

        events.push({
            id: `${car.id}-dropoff`,
            type: 'car',
            title: `Car Return: ${car.company}`,
            subtitle: car.dropoffLocation,
            date: dropoff.toISOString().split('T')[0],
            startTime: dropoff.toTimeString().slice(0, 5),
            color: 'var(--accent-orange)',
            icon: 'car',
            data: car,
        });
    });

    // Add trains
    trains.forEach(train => {
        const dep = new Date(train.departureDateTime);

        events.push({
            id: train.id,
            type: 'train',
            title: `${train.origin} → ${train.destination}`,
            subtitle: train.operator,
            date: dep.toISOString().split('T')[0],
            startTime: dep.toTimeString().slice(0, 5),
            color: 'var(--accent-orange)',
            icon: 'train',
            data: train,
        });
    });

    // Sort by date and time
    events.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.startTime || '').localeCompare(b.startTime || '');
    });

    return events;
}

// Get events for a specific date
export function getEventsForDate(events: CalendarEvent[], date: string): CalendarEvent[] {
    return events.filter(e => e.date === date);
}

// Get all dates in a month
export function getMonthDates(year: number, month: number): Date[] {
    const dates: Date[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Add padding days from previous month
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        dates.push(d);
    }

    // Add all days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        dates.push(new Date(year, month, i));
    }

    // Add padding days from next month to complete 6 rows
    const endPadding = 42 - dates.length;
    for (let i = 1; i <= endPadding; i++) {
        dates.push(new Date(year, month + 1, i));
    }

    return dates;
}
