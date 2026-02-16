import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectIsAuthenticated } from '../../state/auth/auth.selectors';

export const authGuard = () => {
    const store = inject(Store);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    return store.select(selectIsAuthenticated).pipe(
        take(1),
        map(isAuthenticated => {
            if (isAuthenticated) {
                return true;
            }

            // Fallback: Check localStorage directly to prevent hydration lag redirects
            if (isPlatformBrowser(platformId)) {
                const user = localStorage.getItem('current_user');
                if (user && user !== 'undefined') {
                    // User data exists, which means a session was established.
                    return true;
                }

                router.navigate(['/auth/login']);
                return false;
            }
            return true;
        })
    );
};
