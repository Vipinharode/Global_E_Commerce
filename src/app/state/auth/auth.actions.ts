import { createAction, props } from '@ngrx/store';
import { User, LoginRequest, LoginResponse, SignupRequest } from './auth.model';

// Login Actions
export const login = createAction(
    '[Auth] Login',
    props<{ credentials: LoginRequest }>()
);

export const loginSuccess = createAction(
    '[Auth] Login Success',
    props<{ response: LoginResponse }>()
);

export const loginFailure = createAction(
    '[Auth] Login Failure',
    props<{ error: string }>()
);

// Signup Actions
export const signup = createAction(
    '[Auth] Signup',
    props<{ request: SignupRequest }>()
);

export const signupSuccess = createAction(
    '[Auth] Signup Success',
    props<{ response: LoginResponse }>()
);

export const signupFailure = createAction(
    '[Auth] Signup Failure',
    props<{ error: string }>()
);

// Logout Action
export const logout = createAction('[Auth] Logout');

// Load User from Token
export const loadUserFromToken = createAction('[Auth] Load User From Token');

export const loadUserFromTokenSuccess = createAction(
    '[Auth] Load User From Token Success',
    props<{ user: User; accessToken: string; refreshToken: string }>()
);

export const loadUserFromTokenFailure = createAction(
    '[Auth] Load User From Token Failure',
    props<{ error?: any }>()
);

// Refresh Token
export const refreshToken = createAction('[Auth] Refresh Token');

export const refreshTokenSuccess = createAction(
    '[Auth] Refresh Token Success',
    props<{ accessToken: string; refreshToken: string }>()
);

export const refreshTokenFailure = createAction(
    '[Auth] Refresh Token Failure',
    props<{ error: string }>()
);

// Clear Error
export const clearAuthError = createAction('[Auth] Clear Error');
