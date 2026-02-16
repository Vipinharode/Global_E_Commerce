import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from './cart.model';

export const selectCartState = createFeatureSelector<CartState>('cart');

export const selectCartItems = createSelector(
    selectCartState,
    (state) => state.items
);

export const selectCartTotal = createSelector(
    selectCartState,
    (state) => state.total
);

export const selectCartItemCount = createSelector(
    selectCartState,
    (state) => state.itemCount
);

export const selectCartLoading = createSelector(
    selectCartState,
    (state) => state.loading
);

export const selectCartError = createSelector(
    selectCartState,
    (state) => state.error
);

export const selectIsItemInCart = (productId: number) => createSelector(
    selectCartItems,
    (items) => items.some(item => item.productId === productId)
);
