import { createAction, props } from '@ngrx/store';
import { CartItem } from './cart.model';

// Add to Cart
export const addToCart = createAction(
    '[Cart] Add Item',
    props<{ item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number } }>()
);

// Remove from Cart
export const removeFromCart = createAction(
    '[Cart] Remove Item',
    props<{ id: number }>()
);

// Update Quantity
export const updateQuantity = createAction(
    '[Cart] Update Quantity',
    props<{ id: number; quantity: number }>()
);

// Clear Cart
export const clearCart = createAction('[Cart] Clear Cart');

// Load Cart from Storage
export const loadCart = createAction('[Cart] Load Cart');
export const loadCartSuccess = createAction(
    '[Cart] Load Cart Success',
    props<{ items: CartItem[] }>()
);

// Sync with API
export const syncCart = createAction('[Cart] Sync Cart');
export const syncCartSuccess = createAction(
    '[Cart] Sync Cart Success',
    props<{ cart: any }>()
);
export const syncCartFailure = createAction(
    '[Cart] Sync Cart Failure',
    props<{ error: string }>()
);
