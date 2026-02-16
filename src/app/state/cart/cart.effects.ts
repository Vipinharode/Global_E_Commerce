import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { CartService } from '../../core/services/cart.service';
import * as CartActions from './cart.actions';

@Injectable()
export class CartEffects {
    private actions$ = inject(Actions);
    private cartService = inject(CartService);

    loadCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.loadCart),
            map(() => {
                const items = this.cartService.getLocalCart();
                return CartActions.loadCartSuccess({ items });
            })
        )
    );

    syncCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.syncCart),
            mergeMap(() =>
                this.cartService.addToCart(1, []).pipe(
                    map(cart => CartActions.syncCartSuccess({ cart })),
                    catchError(error => of(CartActions.syncCartFailure({ error: error.message })))
                )
            )
        )
    );
}
