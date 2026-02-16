import { createReducer, on } from '@ngrx/store';
import { AuthState, initialAuthState } from './auth.model';
import * as AuthActions from './auth.actions';

// Helper function to get initial state from localStorage
const getInitialState = (): AuthState => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
        return initialAuthState;
    }

    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refresh_token');
    const userJson = localStorage.getItem('current_user');

    const hasSession = (accessToken && accessToken !== 'undefined') || (refreshToken && refreshToken !== 'undefined');

    if (hasSession && userJson) {
        try {
            return {
                ...initialAuthState,
                accessToken,
                refreshToken,
                user: {
                    ...JSON.parse(userJson),
                    role: (JSON.parse(userJson).username === 'emilys' || JSON.parse(userJson).username === 'vipin') ? 'admin' : 'customer'
                },
                isAuthenticated: true
            };
        } catch (e) {
            console.error('Error parsing user from localStorage', e);
            return initialAuthState;
        }
    }

    return initialAuthState;
};

export const authReducer = createReducer(
    getInitialState(),

    // Login
    on(AuthActions.login, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(AuthActions.loginSuccess, (state, { response }) => ({
        ...state,
        user: {
            id: response.id,
            username: response.username,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            gender: response.gender,
            image: response.image,
            role: (response.username === 'emilys' || response.username === 'vipin') ? 'admin' : 'customer'
        },
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null
    })),

    on(AuthActions.loginFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
        isAuthenticated: false
    })),

    // Signup
    on(AuthActions.signup, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(AuthActions.signupSuccess, (state, { response }) => ({
        ...state,
        user: {
            id: response.id,
            username: response.username,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            gender: response.gender,
            image: response.image,
            role: 'customer'
        },
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null
    })),

    on(AuthActions.signupFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Logout
    on(AuthActions.logout, () => initialAuthState),

    // Load User from Token
    on(AuthActions.loadUserFromTokenSuccess, (state, { user, accessToken, refreshToken }) => ({
        ...state,
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        loading: false
    })),

    on(AuthActions.loadUserFromTokenFailure, (state, { error }) => {
        // Only trigger logout if it's a 401/403 (Unauthorized)
        // Otherwise (network error/missing but present in storage), 
        // keep the user logged in to prevent flash logout on refresh.
        const isAuthError = error?.status === 401 || error?.status === 403;
        return isAuthError ? initialAuthState : state;
    }),

    // Refresh Token
    on(AuthActions.refreshTokenSuccess, (state, { accessToken, refreshToken }) => ({
        ...state,
        accessToken,
        refreshToken
    })),

    on(AuthActions.refreshTokenFailure, () => initialAuthState),

    // Clear Error
    on(AuthActions.clearAuthError, (state) => ({
        ...state,
        error: null
    }))
);
