import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import * as AuthActions from '../../state/auth/auth.actions';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const store = inject(Store);
    const authService = inject(AuthService);
    const accessToken = authService.getToken(); // Sync access for immediate request

    // List of endpoints that don't need auth token
    const publicEndpoints = [
        '/auth/login',
        '/users/add', // Signup
        '/auth/refresh'
    ];

    // Check if request is for a public endpoint
    const isPublic = publicEndpoints.some(endpoint => req.url.includes(endpoint));

    if (accessToken && !isPublic) {
        req = addTokenHeader(req, accessToken);
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !req.url.includes('/auth/refresh')) {
                // Token expired - try to refresh
                return handle401Error(req, next, authService, store);
            }
            return throwError(() => error);
        })
    );
};

const addTokenHeader = (req: HttpRequest<any>, accessToken: string) => {
    return req.clone({
        setHeaders: {
            Authorization: `Bearer ${accessToken}`
        }
    });
};

const handle401Error = (req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService, store: Store) => {
    const refreshToken = authService.getRefreshToken();

    if (!refreshToken) {
        store.dispatch(AuthActions.logout());
        return throwError(() => new Error('No refresh token'));
    }

    return authService.refreshAccessToken(refreshToken).pipe(
        switchMap((response) => {
            store.dispatch(AuthActions.refreshTokenSuccess(response));
            return next(addTokenHeader(req, response.accessToken));
        }),
        catchError((error) => {
            store.dispatch(AuthActions.logout());
            return throwError(() => error);
        })
    );
};
