import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginRequest, LoginResponse, SignupRequest, User } from '../../state/auth/auth.model';
import { CacheService } from './cache.service';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../state/product/product.actions';
import { SearchFilterService } from './search-filter.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'https://dummyjson.com';
    private tokenKey = 'accessToken';
    private refreshTokenKey = 'refresh_token';
    private userKey = 'current_user';

    constructor(
        private http: HttpClient,
        private cacheService: CacheService,
        private store: Store,
        private searchFilterService: SearchFilterService
    ) { }

    /**
     * Login user with DummyJSON API
     */
    login(credentials: LoginRequest): Observable<LoginResponse> {
        // 1. Check local users first (for users created via signup)
        // Since DummyJSON doesn't persist added users, we handle their login locally
        const localUsersStr = localStorage.getItem('local_signup_users');
        if (localUsersStr) {
            const localUsers: any[] = JSON.parse(localUsersStr);
            const localUser = localUsers.find(u => u.username === credentials.username);

            if (localUser) {
                // Check if account is suspended
                const deletedStr = localStorage.getItem('deleted_users');
                const deletedIds: number[] = deletedStr ? JSON.parse(deletedStr) : [];
                if (deletedIds.includes(localUser.id)) {
                    return throwError(() => new Error('This account has been suspended by an administrator.'));
                }

                if (localUser.password === credentials.password) {
                    const response: LoginResponse = {
                        id: localUser.id,
                        username: localUser.username,
                        email: localUser.email,
                        firstName: localUser.firstName,
                        lastName: localUser.lastName,
                        gender: localUser.gender,
                        image: localUser.image,
                        accessToken: this.generateMockToken(),
                        refreshToken: this.generateMockToken()
                    };
                    this.cacheService.clearProductCache(); // Clear cache on new login
                    this.storeTokens(response.accessToken, response.refreshToken);
                    this.storeUser(response);
                    return of(response);
                } else {
                    return throwError(() => new Error('Invalid credentials'));
                }
            }
        }

        // 2. Default to DummyJSON API for static users (e.g., emilys)
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
            .pipe(
                map(response => {
                    // Check if this user has been deleted by an admin
                    const deletedStr = localStorage.getItem('deleted_users');
                    const deletedIds: number[] = deletedStr ? JSON.parse(deletedStr) : [];

                    if (deletedIds.includes(response.id)) {
                        throw new Error('This account has been suspended by an administrator.');
                    }

                    this.cacheService.clearProductCache(); // Clear cache on new login
                    this.storeTokens(response.accessToken, response.refreshToken);
                    this.storeUser(response);
                    return response;
                }),
                catchError(error => {
                    console.error('Login error:', error);
                    const errorMessage = error.error?.message || (typeof error.error === 'string' ? error.error : null) || error.message || 'Login failed';
                    return throwError(() => new Error(errorMessage));
                })
            );
    }

    /**
     * Signup user (simulated with DummyJSON)
     * Note: DummyJSON doesn't have a real signup endpoint, so we'll use add user
     */
    signup(request: SignupRequest): Observable<LoginResponse> {
        // Since DummyJSON doesn't have signup, we'll add a user and then login
        return this.http.post<any>(`${this.apiUrl}/users/add`, {
            firstName: request.firstName,
            lastName: request.lastName,
            username: request.username,
            email: request.email,
            // DummyJSON will ignore the password in add, so we'll login with default credentials
        }).pipe(
            map(user => {
                // Create a mock login response
                const mockResponse: LoginResponse = {
                    id: user.id || Date.now(),
                    username: request.username,
                    email: request.email,
                    firstName: request.firstName,
                    lastName: request.lastName,
                    gender: user.gender || 'male',
                    image: user.image || 'https://i.pravatar.cc/150?img=1',
                    accessToken: this.generateMockToken(),
                    refreshToken: this.generateMockToken()
                };
                this.storeTokens(mockResponse.accessToken, mockResponse.refreshToken);
                this.storeUser(mockResponse);
                this.saveLocalSignupUser(mockResponse, request.password); // Save to local storage with password for re-login
                return mockResponse;
            }),
            catchError(error => {
                console.error('Signup error:', error);
                const errorMessage = error.error?.message || (typeof error.error === 'string' ? error.error : null) || error.message || 'Signup failed';
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    /**
     * Persist signed-up users locally for Admin Dashboard visibility and re-login
     */
    private saveLocalSignupUser(user: LoginResponse, password?: string): void {
        const localUsersKey = 'local_signup_users';
        const existingUsersStr = localStorage.getItem(localUsersKey);
        const users: any[] = existingUsersStr ? JSON.parse(existingUsersStr) : [];

        // Update or add user
        const existingIndex = users.findIndex(u => u.username === user.username);
        const userData = {
            id: user.id || Date.now(),
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender || 'male',
            image: user.image || 'https://i.pravatar.cc/150?img=1',
            role: 'customer',
            country: 'India', // Default locale for new signups
            password: password // Store password to simulate persistence for re-login
        };

        if (existingIndex > -1) {
            users[existingIndex] = userData;
        } else {
            users.push(userData);
        }

        localStorage.setItem(localUsersKey, JSON.stringify(users));
    }

    /**
     * Logout user
     */
    logout(): Observable<void> {
        this.cacheService.clearAll(); // Hard reset of all storage
        this.store.dispatch(ProductActions.clearProductState());
        this.searchFilterService.clearFilters();
        return of(void 0);
    }

    /**
     * Get current auth token
     */
    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Get refresh token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(this.refreshTokenKey);
    }

    /**
     * Get current user from storage
     */
    getCurrentUser(): User | null {
        const userStr = localStorage.getItem(this.userKey);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Refresh access token
     */
    refreshAccessToken(refreshToken: string): Observable<{ accessToken: string; refreshToken: string }> {
        return this.http.post<{ accessToken: string; refreshToken: string }>(
            `${this.apiUrl}/auth/refresh`,
            { refreshToken },
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            }
        ).pipe(
            map(response => {
                this.storeTokens(response.accessToken, response.refreshToken);
                return response;
            }),
            catchError(error => {
                console.error('Token refresh error:', error);
                this.clearStorage();
                return throwError(() => new Error('Token refresh failed'));
            })
        );
    }

    /**
     * Verify current token
     */
    verifyToken(accessToken: string): Observable<User> {
        // If it's a mock token (from signup), don't call real API as it will fail
        // This prevents automatic logout on refresh for signed-up users
        if (accessToken.includes('mock-signature')) {
            const user = this.getCurrentUser();
            return user ? of(user) : throwError(() => new Error('Mock user not found'));
        }

        return this.http.get<User>(`${this.apiUrl}/auth/me`, {
            headers: new HttpHeaders({
                'Authorization': `Bearer ${accessToken}`
            })
        }).pipe(
            map(user => {
                // Add role based on username
                return {
                    ...user,
                    role: (user.username === 'emilys' || user.username === 'vipin') ? 'admin' as const : 'customer' as const
                };
            }),
            catchError(error => {
                console.error('Token verification error:', error);
                // Don't clear storage here, let the interceptor/effects handle 401s
                return throwError(() => new Error('Token verification failed'));
            })
        );
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = this.getToken();
        return !!token && token !== 'undefined';
    }

    /**
     * Store tokens in localStorage
     */
    private storeTokens(accessToken: string, refreshToken?: string): void {
        if (accessToken && accessToken !== 'undefined') {
            localStorage.setItem(this.tokenKey, accessToken);
        }
        if (refreshToken && refreshToken !== 'undefined') {
            localStorage.setItem(this.refreshTokenKey, refreshToken);
        }
    }

    /**
     * Store user data in localStorage
     */
    private storeUser(user: any): void {
        const userToStore = {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            image: user.image,
            role: (user.username === 'emilys' || user.username === 'vipin') ? 'admin' as const : 'customer' as const
        };
        localStorage.setItem(this.userKey, JSON.stringify(userToStore));
    }

    /**
     * Clear all auth data from storage
     */
    private clearStorage(): void {
        this.cacheService.clearAll();
        this.store.dispatch(ProductActions.clearProductState());
        this.searchFilterService.clearFilters();
    }

    /**
     * Generate mock JWT token for demo purposes
     */
    private generateMockToken(): string {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            sub: Date.now().toString(),
            iat: Date.now(),
            exp: Date.now() + 3600000
        }));
        const signature = btoa('mock-signature');
        return `${header}.${payload}.${signature}`;
    }

    /**
     * Forgot Password (Mock implementation)
     */
    forgotPassword(email: string): Observable<{ message: string }> {
        // DummyJSON doesn't have forgot password endpoint
        // This is a mock implementation
        return of({
            message: 'Password reset email sent successfully. Please check your inbox.'
        });
    }

    /**
     * Reset Password (Mock implementation)
     */
    resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
        // DummyJSON doesn't have reset password endpoint
        // This is a mock implementation
        return of({
            message: 'Password has been reset successfully. You can now login with your new password.'
        });
    }
}
