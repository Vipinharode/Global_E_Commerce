import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectUserRole } from '../../state/auth/auth.selectors';

export const adminGuard = () => {
    const store = inject(Store);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    return store.select(selectUserRole).pipe(
        take(1),
        map(role => {
            if (!isPlatformBrowser(platformId)) {
                return true;
            }

            if (role === 'admin') {
                return true;
            } else {
                router.navigate(['/products']);
                return false;
            }
        })
    );
};
