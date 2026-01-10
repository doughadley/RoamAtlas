/**
 * Local JSON Data Service for RoamAtlas
 * 
 * Uses localStorage to persist trip data locally.
 * Provides CRUD operations for all entity types.
 */

import {
    DataStore,
    Trip,
    Flight,
    Accommodation,
    CarRental,
    Train,
    Excursion,
    Expense,
    UserPreferences
} from '@/types';

const STORAGE_KEY = 'roamatlas_data';

// Default data structure
const defaultData: DataStore = {
    trips: [],
    flights: [],
    accommodations: [],
    cars: [],
    trains: [],
    excursions: [],
    expenses: [],
    preferences: {
        defaultCurrency: 'USD',
        theme: 'dark',
    },
};

// Generate unique ID
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Load all data from localStorage
export function loadData(): DataStore {
    if (typeof window === 'undefined') return defaultData;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...defaultData, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
    return defaultData;
}

// Save all data to localStorage
export function saveData(data: DataStore): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// ============ TRIP OPERATIONS ============

export function getTrips(): Trip[] {
    return loadData().trips;
}

export function getTrip(id: string): Trip | undefined {
    return loadData().trips.find(t => t.id === id);
}

export function createTrip(trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Trip {
    const data = loadData();
    const newTrip: Trip = {
        ...trip,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    data.trips.push(newTrip);
    saveData(data);
    return newTrip;
}

export function updateTrip(id: string, updates: Partial<Trip>): Trip | undefined {
    const data = loadData();
    const index = data.trips.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    data.trips[index] = {
        ...data.trips[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };
    saveData(data);
    return data.trips[index];
}

export function deleteTrip(id: string): boolean {
    const data = loadData();
    const index = data.trips.findIndex(t => t.id === id);
    if (index === -1) return false;

    // Delete associated data
    data.flights = data.flights.filter(f => f.tripId !== id);
    data.accommodations = data.accommodations.filter(a => a.tripId !== id);
    data.cars = data.cars.filter(c => c.tripId !== id);
    data.trains = data.trains.filter(t => t.tripId !== id);
    data.excursions = data.excursions.filter(e => e.tripId !== id);
    data.expenses = data.expenses.filter(e => e.tripId !== id);

    data.trips.splice(index, 1);
    saveData(data);
    return true;
}

// ============ FLIGHT OPERATIONS ============

export function getFlights(tripId: string): Flight[] {
    return loadData().flights.filter(f => f.tripId === tripId);
}

export function createFlight(flight: Omit<Flight, 'id'>): Flight {
    const data = loadData();
    const newFlight: Flight = { ...flight, id: generateId() };
    data.flights.push(newFlight);

    // Auto-create expense
    if (newFlight.costAmount && newFlight.costAmount > 0) {
        data.expenses.push({
            id: generateId(),
            tripId: newFlight.tripId,
            date: newFlight.departureDateTime.split('T')[0],
            description: `Flight: ${newFlight.airline} (${newFlight.flightNumber})`,
            category: 'flight',
            amount: newFlight.costAmount,
            currency: newFlight.costCurrency || 'USD',
            linkedType: 'flight',
            linkedId: newFlight.id
        });
    }

    saveData(data);
    return newFlight;
}

export function updateFlight(id: string, updates: Partial<Flight>): Flight | undefined {
    const data = loadData();
    const index = data.flights.findIndex(f => f.id === id);
    if (index === -1) return undefined;

    data.flights[index] = { ...data.flights[index], ...updates };
    const updatedFlight = data.flights[index];

    // Sync expense
    const expenseIndex = data.expenses.findIndex(e => e.linkedId === id && e.linkedType === 'flight');

    if (updatedFlight.costAmount && updatedFlight.costAmount > 0) {
        const expenseData: Partial<Expense> = {
            date: updatedFlight.departureDateTime.split('T')[0],
            description: `Flight: ${updatedFlight.airline} (${updatedFlight.flightNumber})`,
            amount: updatedFlight.costAmount,
            currency: updatedFlight.costCurrency || 'USD',
        };

        if (expenseIndex !== -1) {
            data.expenses[expenseIndex] = { ...data.expenses[expenseIndex], ...expenseData };
        } else {
            data.expenses.push({
                id: generateId(),
                tripId: updatedFlight.tripId,
                category: 'flight',
                linkedType: 'flight',
                linkedId: updatedFlight.id,
                ...expenseData
            } as Expense);
        }
    } else if (expenseIndex !== -1) {
        // Remove expense if cost is removed/zero
        data.expenses.splice(expenseIndex, 1);
    }

    saveData(data);
    return updatedFlight;
}

export function deleteFlight(id: string): boolean {
    const data = loadData();
    const index = data.flights.findIndex(f => f.id === id);
    if (index === -1) return false;

    data.flights.splice(index, 1);

    // Remove linked expense
    data.expenses = data.expenses.filter(e => !(e.linkedId === id && e.linkedType === 'flight'));

    saveData(data);
    return true;
}

// ============ ACCOMMODATION OPERATIONS ============

export function getAccommodations(tripId: string): Accommodation[] {
    return loadData().accommodations.filter(a => a.tripId === tripId);
}

export function createAccommodation(accommodation: Omit<Accommodation, 'id'>): Accommodation {
    const data = loadData();
    const newAccom: Accommodation = { ...accommodation, id: generateId() };
    data.accommodations.push(newAccom);

    // Auto-create expense
    if (newAccom.costAmount && newAccom.costAmount > 0) {
        data.expenses.push({
            id: generateId(),
            tripId: newAccom.tripId,
            date: newAccom.checkInDateTime.split('T')[0],
            description: `Stay: ${newAccom.propertyName}`,
            category: 'accommodation',
            amount: newAccom.costAmount,
            currency: newAccom.costCurrency || 'USD',
            linkedType: 'accommodation',
            linkedId: newAccom.id
        });
    }

    saveData(data);
    return newAccom;
}

export function updateAccommodation(id: string, updates: Partial<Accommodation>): Accommodation | undefined {
    const data = loadData();
    const index = data.accommodations.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    data.accommodations[index] = { ...data.accommodations[index], ...updates };
    const updatedAccom = data.accommodations[index];

    // Sync expense
    const expenseIndex = data.expenses.findIndex(e => e.linkedId === id && e.linkedType === 'accommodation');

    if (updatedAccom.costAmount && updatedAccom.costAmount > 0) {
        const expenseData: Partial<Expense> = {
            date: updatedAccom.checkInDateTime.split('T')[0],
            description: `Stay: ${updatedAccom.propertyName}`,
            amount: updatedAccom.costAmount,
            currency: updatedAccom.costCurrency || 'USD',
        };

        if (expenseIndex !== -1) {
            data.expenses[expenseIndex] = { ...data.expenses[expenseIndex], ...expenseData };
        } else {
            data.expenses.push({
                id: generateId(),
                tripId: updatedAccom.tripId,
                category: 'accommodation',
                linkedType: 'accommodation',
                linkedId: updatedAccom.id,
                ...expenseData
            } as Expense);
        }
    } else if (expenseIndex !== -1) {
        data.expenses.splice(expenseIndex, 1);
    }

    saveData(data);
    return updatedAccom;
}

export function deleteAccommodation(id: string): boolean {
    const data = loadData();
    const index = data.accommodations.findIndex(a => a.id === id);
    if (index === -1) return false;

    data.accommodations.splice(index, 1);

    // Remove linked expense
    data.expenses = data.expenses.filter(e => !(e.linkedId === id && e.linkedType === 'accommodation'));

    saveData(data);
    return true;
}

// ============ CAR RENTAL OPERATIONS ============

export function getCars(tripId: string): CarRental[] {
    return loadData().cars.filter(c => c.tripId === tripId);
}

export function createCar(car: Omit<CarRental, 'id'>): CarRental {
    const data = loadData();
    const newCar: CarRental = { ...car, id: generateId() };
    data.cars.push(newCar);
    saveData(data);
    return newCar;
}

export function updateCar(id: string, updates: Partial<CarRental>): CarRental | undefined {
    const data = loadData();
    const index = data.cars.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    data.cars[index] = { ...data.cars[index], ...updates };
    saveData(data);
    return data.cars[index];
}

export function deleteCar(id: string): boolean {
    const data = loadData();
    const index = data.cars.findIndex(c => c.id === id);
    if (index === -1) return false;

    data.cars.splice(index, 1);
    saveData(data);
    return true;
}

// ============ TRAIN OPERATIONS ============

export function getTrains(tripId: string): Train[] {
    return loadData().trains.filter(t => t.tripId === tripId);
}

export function createTrain(train: Omit<Train, 'id'>): Train {
    const data = loadData();
    const newTrain: Train = { ...train, id: generateId() };
    data.trains.push(newTrain);
    saveData(data);
    return newTrain;
}

export function updateTrain(id: string, updates: Partial<Train>): Train | undefined {
    const data = loadData();
    const index = data.trains.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    data.trains[index] = { ...data.trains[index], ...updates };
    saveData(data);
    return data.trains[index];
}

export function deleteTrain(id: string): boolean {
    const data = loadData();
    const index = data.trains.findIndex(t => t.id === id);
    if (index === -1) return false;

    data.trains.splice(index, 1);
    saveData(data);
    return true;
}

// ============ EXCURSION OPERATIONS ============

export function getExcursions(tripId: string): Excursion[] {
    return loadData().excursions.filter(e => e.tripId === tripId);
}

export function createExcursion(excursion: Omit<Excursion, 'id'>): Excursion {
    const data = loadData();
    const newExcursion: Excursion = { ...excursion, id: generateId() };
    data.excursions.push(newExcursion);
    saveData(data);
    return newExcursion;
}

export function updateExcursion(id: string, updates: Partial<Excursion>): Excursion | undefined {
    const data = loadData();
    const index = data.excursions.findIndex(e => e.id === id);
    if (index === -1) return undefined;

    data.excursions[index] = { ...data.excursions[index], ...updates };
    saveData(data);
    return data.excursions[index];
}

export function deleteExcursion(id: string): boolean {
    const data = loadData();
    const index = data.excursions.findIndex(e => e.id === id);
    if (index === -1) return false;

    data.excursions.splice(index, 1);
    saveData(data);
    return true;
}

// ============ EXPENSE OPERATIONS ============

export function getExpenses(tripId: string): Expense[] {
    return loadData().expenses.filter(e => e.tripId === tripId);
}

export function createExpense(expense: Omit<Expense, 'id'>): Expense {
    const data = loadData();
    const newExpense: Expense = { ...expense, id: generateId() };
    data.expenses.push(newExpense);
    saveData(data);
    return newExpense;
}

export function updateExpense(id: string, updates: Partial<Expense>): Expense | undefined {
    const data = loadData();
    const index = data.expenses.findIndex(e => e.id === id);
    if (index === -1) return undefined;

    data.expenses[index] = { ...data.expenses[index], ...updates };
    saveData(data);
    return data.expenses[index];
}

export function deleteExpense(id: string): boolean {
    const data = loadData();
    const index = data.expenses.findIndex(e => e.id === id);
    if (index === -1) return false;

    data.expenses.splice(index, 1);
    saveData(data);
    return true;
}

// ============ PREFERENCES OPERATIONS ============

export function getPreferences(): UserPreferences {
    return loadData().preferences;
}

export function updatePreferences(updates: Partial<UserPreferences>): UserPreferences {
    const data = loadData();
    data.preferences = { ...data.preferences, ...updates };
    saveData(data);
    return data.preferences;
}

export function setCurrentTrip(tripId: string | undefined): void {
    updatePreferences({ currentTripId: tripId });
}

export function getCurrentTrip(): Trip | undefined {
    const prefs = getPreferences();
    if (!prefs.currentTripId) return undefined;
    return getTrip(prefs.currentTripId);
}

// ============ UTILITY FUNCTIONS ============

export function getTripStats(tripId: string) {
    const data = loadData();
    return {
        flights: data.flights.filter(f => f.tripId === tripId).length,
        accommodations: data.accommodations.filter(a => a.tripId === tripId).length,
        cars: data.cars.filter(c => c.tripId === tripId).length,
        trains: data.trains.filter(t => t.tripId === tripId).length,
        excursions: data.excursions.filter(e => e.tripId === tripId).length,
        expenses: data.expenses.filter(e => e.tripId === tripId).length,
        totalExpenses: data.expenses
            .filter(e => e.tripId === tripId)
            .reduce((sum, e) => sum + e.amount, 0),
    };
}

export function exportData(): string {
    return JSON.stringify(loadData(), null, 2);
}

export function importData(jsonString: string): boolean {
    try {
        const data = JSON.parse(jsonString) as DataStore;
        saveData({ ...defaultData, ...data });
        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
}

export function clearAllData(): void {
    saveData(defaultData);
}
