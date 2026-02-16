import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectUserRole } from '../../state/auth/auth.selectors';

/**
 * CustomerGuard prevents Admins from accessing customer-facing routes.
 * Redirects Admins to the Admin Dashboard.
 */
export const customerGuard = () => {
    const store = inject(Store);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    return store.select(selectUserRole).pipe(
        take(1),
        map(role => {
            // SSR check
            if (!isPlatformBrowser(platformId)) {
                return true;
            }

            if (role === 'admin') {
                console.log('CustomerGuard: Admin detected, redirecting to Dashboard');
                router.navigate(['/admin/dashboard']);
                return false;
            }

            // Allow customers (and potentially guests if not protected by authGuard)
            return true;
        })
    );
};
