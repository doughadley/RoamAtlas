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

    // Auto-create expense
    if (newExcursion.costAmount && newExcursion.costAmount > 0) {
        data.expenses.push({
            id: generateId(),
            tripId: newExcursion.tripId,
            date: newExcursion.date,
            description: `Activity: ${newExcursion.title}`,
            category: 'excursion',
            amount: newExcursion.costAmount,
            currency: newExcursion.costCurrency || 'USD',
            linkedType: 'excursion',
            linkedId: newExcursion.id
        });
    }

    saveData(data);
    return newExcursion;
}

export function updateExcursion(id: string, updates: Partial<Excursion>): Excursion | undefined {
    const data = loadData();
    const index = data.excursions.findIndex(e => e.id === id);
    if (index === -1) return undefined;

    data.excursions[index] = { ...data.excursions[index], ...updates };
    const updatedExcursion = data.excursions[index];

    // Sync expense
    const expenseIndex = data.expenses.findIndex(e => e.linkedId === id && e.linkedType === 'excursion');

    if (updatedExcursion.costAmount && updatedExcursion.costAmount > 0) {
        const expenseData: Partial<Expense> = {
            date: updatedExcursion.date,
            description: `Activity: ${updatedExcursion.title}`,
            amount: updatedExcursion.costAmount,
            currency: updatedExcursion.costCurrency || 'USD',
        };

        if (expenseIndex !== -1) {
            data.expenses[expenseIndex] = { ...data.expenses[expenseIndex], ...expenseData };
        } else {
            data.expenses.push({
                id: generateId(),
                tripId: updatedExcursion.tripId,
                category: 'excursion',
                linkedType: 'excursion',
                linkedId: updatedExcursion.id,
                ...expenseData
            } as Expense);
        }
    } else if (expenseIndex !== -1) {
        data.expenses.splice(expenseIndex, 1);
    }

    saveData(data);
    return updatedExcursion;
}

export function deleteExcursion(id: string): boolean {
    const data = loadData();
    const index = data.excursions.findIndex(e => e.id === id);
    if (index === -1) return false;

    data.excursions.splice(index, 1);

    // Remove linked expense
    data.expenses = data.expenses.filter(e => !(e.linkedId === id && e.linkedType === 'excursion'));

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

    const flights = data.flights.filter(f => f.tripId === tripId);
    const accommodations = data.accommodations.filter(a => a.tripId === tripId);
    const cars = data.cars.filter(c => c.tripId === tripId);
    const trains = data.trains.filter(t => t.tripId === tripId);
    const excursions = data.excursions.filter(e => e.tripId === tripId);
    const expenses = data.expenses.filter(e => e.tripId === tripId);

    // Calculate total expenses using the same logic as Expenses page
    let totalExpenses = 0;

    // Manual expenses by category
    const manualFlightExpenses = expenses.filter(e => e.category === 'flight');
    const manualAccomExpenses = expenses.filter(e => e.category === 'accommodation');
    const manualTransportExpenses = expenses.filter(e => e.category === 'transport');
    const manualExcursionExpenses = expenses.filter(e => e.category === 'excursion');

    // Always add manual expenses
    totalExpenses += expenses.reduce((sum, e) => sum + e.amount, 0);

    // Add flight costs if no manual flight expenses
    if (manualFlightExpenses.length === 0) {
        totalExpenses += flights.reduce((sum, f) => sum + (f.costAmount || 0), 0);
    }

    // Add accommodation costs if no manual accommodation expenses
    if (manualAccomExpenses.length === 0) {
        totalExpenses += accommodations.reduce((sum, a) => sum + (a.costAmount || 0), 0);
    }

    // Add transport costs if no manual transport expenses
    if (manualTransportExpenses.length === 0) {
        totalExpenses += trains.reduce((sum, t) => sum + (t.costAmount || 0), 0);
        totalExpenses += cars.reduce((sum, c) => sum + (c.costAmount || 0), 0);
    }

    // Add excursion costs if no manual excursion expenses
    if (manualExcursionExpenses.length === 0) {
        totalExpenses += excursions.reduce((sum, ex) => sum + (ex.costAmount || 0), 0);
    }

    return {
        flights: flights.length,
        accommodations: accommodations.length,
        cars: cars.length,
        trains: trains.length,
        excursions: excursions.length,
        expenses: expenses.length,
        totalExpenses: Math.round(totalExpenses * 100) / 100, // Round to 2 decimals
    };
}

export interface ExpenseCategory {
    category: string;
    amount: number;
    percentage: number;
    color: string;
    label: string;
    icon: string;
}

export function getExpenseBreakdown(tripId: string): ExpenseCategory[] {
    const data = loadData();
    const stats = getTripStats(tripId);

    // Base categories
    const categories = [
        { key: 'flight', label: 'Flights', color: 'var(--accent-blue)', icon: 'plane' },
        { key: 'accommodation', label: 'Stays', color: 'var(--accent-green)', icon: 'building' },
        { key: 'transport', label: 'Transport', color: 'var(--accent-orange)', icon: 'car' }, // includes car & train
        { key: 'excursion', label: 'Activities', color: 'var(--accent-purple)', icon: 'ticket' },
        { key: 'food', label: 'Food', color: 'var(--accent-red)', icon: 'utensils' },
        { key: 'other', label: 'Other', color: 'var(--text-muted)', icon: 'receipt' }
    ];

    const expenses = data.expenses.filter(e => e.tripId === tripId);

    // Calculate totals per category
    const totals: Record<string, number> = {};
    categories.forEach(c => totals[c.key] = 0);

    // 1. Add implicit costs from bookings (if not already manual expense)
    // Flights
    const flights = data.flights.filter(f => f.tripId === tripId);
    const manualFlight = expenses.filter(e => e.category === 'flight');
    if (manualFlight.length === 0) {
        totals['flight'] += flights.reduce((sum, f) => sum + (f.costAmount || 0), 0);
    }

    // Accommodations
    const accoms = data.accommodations.filter(a => a.tripId === tripId);
    const manualAccom = expenses.filter(e => e.category === 'accommodation');
    if (manualAccom.length === 0) {
        totals['accommodation'] += accoms.reduce((sum, a) => sum + (a.costAmount || 0), 0);
    }

    // Transport (Car + Train)
    const cars = data.cars.filter(c => c.tripId === tripId);
    const trains = data.trains.filter(t => t.tripId === tripId);
    const manualTransport = expenses.filter(e => e.category === 'transport');
    if (manualTransport.length === 0) {
        totals['transport'] += cars.reduce((sum, c) => sum + (c.costAmount || 0), 0);
        totals['transport'] += trains.reduce((sum, t) => sum + (t.costAmount || 0), 0);
    }

    // Excursions
    const excursions = data.excursions.filter(e => e.tripId === tripId);
    const manualExcursion = expenses.filter(e => e.category === 'excursion');
    if (manualExcursion.length === 0) {
        totals['excursion'] += excursions.reduce((sum, e) => sum + (e.costAmount || 0), 0);
    }

    // 2. Add manual expenses
    expenses.forEach(e => {
        const cat = categories.find(c => c.key === e.category) ? e.category : 'other';
        totals[cat] = (totals[cat] || 0) + e.amount;
    });

    const total = Object.values(totals).reduce((sum, val) => sum + val, 0);

    return categories.map(c => ({
        category: c.key,
        label: c.label,
        amount: totals[c.key],
        percentage: total > 0 ? (totals[c.key] / total) * 100 : 0,
        color: c.color,
        icon: c.icon
    })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);
}

export function exportData(): string {
    return JSON.stringify(loadData(), null, 2);
}

export function importData(jsonString: string, strategy: 'merge' | 'replace' = 'replace'): boolean {
    try {
        const importedData = JSON.parse(jsonString) as DataStore;

        if (strategy === 'replace') {
            saveData({ ...defaultData, ...importedData });
            return true;
        }

        // Merge Strategy
        const currentData = loadData();

        // Helper to merge arrays uniquely by ID
        const mergeArrays = <T extends { id: string }>(current: T[], incoming: T[]): T[] => {
            const map = new Map(current.map(item => [item.id, item]));
            incoming.forEach(item => map.set(item.id, item)); // Incoming overwrites existing
            return Array.from(map.values());
        };

        const mergedData: DataStore = {
            trips: mergeArrays(currentData.trips, importedData.trips || []),
            flights: mergeArrays(currentData.flights, importedData.flights || []),
            accommodations: mergeArrays(currentData.accommodations, importedData.accommodations || []),
            cars: mergeArrays(currentData.cars, importedData.cars || []),
            trains: mergeArrays(currentData.trains, importedData.trains || []),
            excursions: mergeArrays(currentData.excursions, importedData.excursions || []),
            expenses: mergeArrays(currentData.expenses, importedData.expenses || []),
            preferences: { ...currentData.preferences, ...importedData.preferences },
        };

        saveData(mergedData);
        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
}

export function clearAllData(): void {
    saveData(defaultData);
}
