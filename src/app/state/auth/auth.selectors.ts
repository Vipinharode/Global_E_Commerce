import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.model';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
    selectAuthState,
    (state) => state.user
);

export const selectAccessToken = createSelector(
    selectAuthState,
    (state) => state.accessToken
);

export const selectIsAuthenticated = createSelector(
    selectAuthState,
    (state) => state.isAuthenticated
);

export const selectAuthLoading = createSelector(
    selectAuthState,
    (state) => state.loading
);

export const selectAuthError = createSelector(
    selectAuthState,
    (state) => state.error
);

export const selectUserRole = createSelector(
    selectUser,
    (user) => user?.role || 'customer'
);

export const selectIsAdmin = createSelector(
    selectUserRole,
    (role) => role === 'admin'
);

export const selectUserFullName = createSelector(
    selectUser,
    (user) => user ? `${user.firstName} ${user.lastName}` : 'Guest User'
);
