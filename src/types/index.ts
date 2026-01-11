// Trip and booking type definitions for RoamAtlas

export interface Trip {
    id: string;
    name: string;
    primaryDestination: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'archived';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Flight {
    id: string;
    tripId: string;
    origin: string;
    destination: string;
    airline: string;
    flightNumber: string;
    departureDateTime: string;
    arrivalDateTime: string;
    confirmationNumber?: string;
    costAmount?: number;
    costCurrency?: string;
}

export interface Accommodation {
    id: string;
    tripId: string;
    propertyName: string;
    address: string;
    checkInDateTime: string;
    checkOutDateTime: string;
    confirmationNumber?: string;
    costAmount?: number;
    costCurrency?: string;
}

export interface CarRental {
    id: string;
    tripId: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupDateTime: string;
    dropoffDateTime: string;
    company: string;
    confirmationNumber?: string;
    costAmount?: number;
    costCurrency?: string;
}

export interface Train {
    id: string;
    tripId: string;
    type: 'train' | 'bus';
    origin: string;
    destination: string;
    operator: string;
    serviceNumber: string;
    departureDateTime: string;
    arrivalDateTime: string;
    seatInfo?: string;
    confirmationNumber?: string;
    costAmount?: number;
    costCurrency?: string;
}

export interface Excursion {
    id: string;
    tripId: string;
    title: string;
    category: 'tour' | 'museum' | 'reservation' | 'personal' | 'other';
    date: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    provider?: string;
    notes?: string;
    costAmount?: number;
    costCurrency?: string;
}

export interface Expense {
    id: string;
    tripId: string;
    date: string;
    description: string;
    category: 'flight' | 'accommodation' | 'transport' | 'excursion' | 'food' | 'other';
    amount: number;
    currency: string;
    paymentMethod?: string;
    linkedType?: 'flight' | 'accommodation' | 'car' | 'train' | 'excursion';
    linkedId?: string;
}

export interface UserPreferences {
    defaultCurrency: string;
    currentTripId?: string;
    theme: 'dark' | 'light';
}

// Complete data store structure
export interface DataStore {
    trips: Trip[];
    flights: Flight[];
    accommodations: Accommodation[];
    cars: CarRental[];
    trains: Train[];
    excursions: Excursion[];
    expenses: Expense[];
    preferences: UserPreferences;
}
