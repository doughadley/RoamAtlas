'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
    const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { signIn, signUp } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let success: boolean;

            if (mode === 'signin') {
                success = await signIn(email, password);
            } else {
                if (!name.trim()) {
                    setError('Please enter your name');
                    setIsLoading(false);
                    return;
                }
                success = await signUp(email, password, name);
            }

            if (success) {
                onClose();
                setEmail('');
                setPassword('');
                setName('');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setError('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="glass-panel relative z-10 w-full max-w-md p-8 mx-4 animate-slide-up">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors"
                >
                    <X className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] mx-auto mb-4 flex items-center justify-center shadow-lg">
                        {mode === 'signin' ? (
                            <LogIn className="w-8 h-8 text-white" />
                        ) : (
                            <UserPlus className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-[var(--text-secondary)] mt-2">
                        {mode === 'signin'
                            ? 'Sign in to access your trips'
                            : 'Start organizing your travels'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'signup' && (
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="glass-input pl-12"
                                required={mode === 'signup'}
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="glass-input pl-12"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-input pl-12"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <p className="text-[var(--accent-red)] text-sm text-center bg-[var(--accent-red)]/10 py-2 rounded-lg">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {mode === 'signin' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                                {mode === 'signin' ? 'Sign In' : 'Create Account'}
                            </>
                        )}
                    </button>
                </form>

                {/* Toggle mode */}
                <div className="mt-6 text-center">
                    <p className="text-[var(--text-secondary)]">
                        {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                        <button
                            onClick={toggleMode}
                            className="ml-2 text-[var(--accent-cyan)] hover:underline font-medium"
                        >
                            {mode === 'signin' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>

                {/* Guest mode hint */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-[var(--text-muted)]">
                        💡 In local mode, any email/password combination works
                    </p>
                </div>
            </div>
        </div>
    );
}
