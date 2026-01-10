'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getPreferences, updatePreferences } from '@/lib/dataService';
import { UserPreferences } from '@/types';

// User type for local auth
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: string;
}

// Auth context state
interface AuthContextState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    preferences: UserPreferences;
    signIn: (email: string, password: string) => Promise<boolean>;
    signUp: (email: string, password: string, name: string) => Promise<boolean>;
    signOut: () => void;
    updateUserPreferences: (updates: Partial<UserPreferences>) => void;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

const AUTH_STORAGE_KEY = 'roamatlas_auth';

// Helper to load user from localStorage
function loadUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading user:', error);
    }
    return null;
}

// Helper to save user to localStorage
function saveUser(user: User | null): void {
    if (typeof window === 'undefined') return;
    try {
        if (user) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [preferences, setPreferences] = useState<UserPreferences>({
        defaultCurrency: 'USD',
        theme: 'dark',
    });

    // Load user on mount
    useEffect(() => {
        const storedUser = loadUser();
        setUser(storedUser);
        setPreferences(getPreferences());
        setIsLoading(false);
    }, []);

    // Mock sign in - in local mode, just creates/finds user by email
    const signIn = async (email: string, password: string): Promise<boolean> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // For local mode, we just accept any email/password
        // In a real app, this would validate against a backend
        if (!email || !password) {
            return false;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString(),
        };

        setUser(newUser);
        saveUser(newUser);
        return true;
    };

    // Mock sign up
    const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!email || !password || !name) {
            return false;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            email,
            name,
            createdAt: new Date().toISOString(),
        };

        setUser(newUser);
        saveUser(newUser);
        return true;
    };

    // Sign out
    const signOut = () => {
        setUser(null);
        saveUser(null);
    };

    // Update preferences
    const updateUserPreferences = (updates: Partial<UserPreferences>) => {
        const updated = updatePreferences(updates);
        setPreferences(updated);
    };

    const value: AuthContextState = {
        user,
        isLoading,
        isAuthenticated: !!user,
        preferences,
        signIn,
        signUp,
        signOut,
        updateUserPreferences,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Export for type checking
export type { UserPreferences };
