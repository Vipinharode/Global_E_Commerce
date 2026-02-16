import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of, EMPTY } from 'rxjs';
import { map, catchError, switchMap, tap, filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
    private actions$ = inject(Actions);
    private authService = inject(AuthService);
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            switchMap(({ credentials }) =>
                this.authService.login(credentials).pipe(
                    map(response => AuthActions.loginSuccess({ response })),
                    catchError(error =>
                        of(AuthActions.loginFailure({ error: error.message }))
                    )
                )
            )
        )
    );

    loginSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginSuccess),
            tap(({ response }) => {
                // Navigate based on role
                const role = (response.username === 'emilys' || response.username === 'vipin') ? 'admin' : 'customer';
                if (role === 'admin') {
                    this.router.navigate(['/admin/dashboard']);
                } else {
                    this.router.navigate(['/products']);
                }
            })
        ),
        { dispatch: false }
    );

    signup$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.signup),
            switchMap(({ request }) =>
                this.authService.signup(request).pipe(
                    map(response => AuthActions.signupSuccess({ response })),
                    catchError(error =>
                        of(AuthActions.signupFailure({ error: error.message }))
                    )
                )
            )
        )
    );

    signupSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.signupSuccess),
            tap(() => {
                this.router.navigate(['/products']);
            })
        ),
        { dispatch: false }
    );

    logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logout),
            filter(() => isPlatformBrowser(this.platformId)),
            switchMap(() =>
                this.authService.logout().pipe(
                    tap(() => {
                        this.router.navigate(['/auth/login']);
                    }),
                    map(() => ({ type: 'NO_ACTION' }))
                )
            )
        ),
        { dispatch: false }
    );

    loadUserFromToken$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loadUserFromToken),
            filter(() => isPlatformBrowser(this.platformId)),
            switchMap(() => {
                const accessToken = this.authService.getToken();
                const refreshToken = this.authService.getRefreshToken();
                const user = this.authService.getCurrentUser();

                if (accessToken && user) {
                    // OPTIMISTIC LOAD: Trust localStorage immediately to keep user logged in
                    // This fixes the refresh logout issue by restoring state instantly
                    return of(AuthActions.loadUserFromTokenSuccess({
                        user: user,
                        accessToken: accessToken,
                        refreshToken: refreshToken || ''
                    }));
                } else {
                    return of(AuthActions.loadUserFromTokenFailure({ error: 'No token or user in storage' }));
                }
            })
        )
    );

    // Add a background verification effect if needed, but for now trust storage
    // to solve the critical "auto logout" bug.

    refreshToken$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.refreshToken),
            switchMap(() => {
                const refreshToken = this.authService.getRefreshToken();
                if (refreshToken) {
                    return this.authService.refreshAccessToken(refreshToken).pipe(
                        map(response =>
                            AuthActions.refreshTokenSuccess({
                                accessToken: response.accessToken,
                                refreshToken: response.refreshToken
                            })
                        ),
                        catchError(error =>
                            of(AuthActions.refreshTokenFailure({ error: error.message }))
                        )
                    );
                } else {
                    return of(AuthActions.refreshTokenFailure({ error: 'No refresh token available' }));
                }
            })
        )
    );
}
