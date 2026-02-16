import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrderState } from './order.model';

export const selectOrderState = createFeatureSelector<OrderState>('orders');

export const selectAllOrders = createSelector(
    selectOrderState,
    (state) => state.orders
);

export const selectCurrentOrder = createSelector(
    selectOrderState,
    (state) => state.currentOrder
);

export const selectTrackingOrder = createSelector(
    selectOrderState,
    (state) => state.trackingOrder
);

export const selectOrderLoading = createSelector(
    selectOrderState,
    (state) => state.loading
);

export const selectOrderError = createSelector(
    selectOrderState,
    (state) => state.error
);

export const selectRecentOrders = createSelector(
    selectAllOrders,
    (orders) => orders.slice(0, 5)
);
