export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    image: string;
    role?: 'admin' | 'customer';
    country?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    image: string;
    accessToken: string;
    refreshToken: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

export const initialAuthState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
    isAuthenticated: false
};
