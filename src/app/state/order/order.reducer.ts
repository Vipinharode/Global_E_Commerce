import { createReducer, on } from '@ngrx/store';
import { initialOrderState } from './order.model';
import * as OrderActions from './order.actions';

export const orderReducer = createReducer(
    initialOrderState,

    // Create Order
    on(OrderActions.createOrder, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(OrderActions.createOrderSuccess, (state, { order }) => ({
        ...state,
        currentOrder: order,
        orders: [...state.orders, order],
        loading: false,
    })),
    on(OrderActions.createOrderFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),

    // Load Orders
    on(OrderActions.loadOrders, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(OrderActions.loadOrdersSuccess, (state, { orders }) => ({
        ...state,
        orders,
        loading: false,
    })),
    on(OrderActions.loadOrdersFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),

    // Track Order
    on(OrderActions.trackOrder, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(OrderActions.trackOrderSuccess, (state, { order }) => ({
        ...state,
        trackingOrder: order,
        loading: false,
    })),
    on(OrderActions.trackOrderFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),

    // Update Status
    on(OrderActions.updateOrderStatusSuccess, (state, { order }) => ({
        ...state,
        orders: state.orders.map(o => o.id === order.id ? order : o),
        trackingOrder: state.trackingOrder?.id === order.id ? order : state.trackingOrder,
    })),

    // Clear Current Order
    on(OrderActions.clearCurrentOrder, (state) => ({
        ...state,
        currentOrder: null,
    }))
);
