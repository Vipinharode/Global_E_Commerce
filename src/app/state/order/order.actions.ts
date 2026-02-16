import { createAction, props } from '@ngrx/store';
import { Order, OrderStatus } from './order.model';

// Create Order
export const createOrder = createAction(
    '[Order] Create Order',
    props<{ order: Partial<Order> }>()
);
export const createOrderSuccess = createAction(
    '[Order] Create Order Success',
    props<{ order: Order }>()
);
export const createOrderFailure = createAction(
    '[Order] Create Order Failure',
    props<{ error: string }>()
);

// Load Orders
export const loadOrders = createAction('[Order] Load Orders');
export const loadOrdersSuccess = createAction(
    '[Order] Load Orders Success',
    props<{ orders: Order[] }>()
);
export const loadOrdersFailure = createAction(
    '[Order] Load Orders Failure',
    props<{ error: string }>()
);

// Track Order
export const trackOrder = createAction(
    '[Order] Track Order',
    props<{ orderId: number }>()
);
export const trackOrderSuccess = createAction(
    '[Order] Track Order Success',
    props<{ order: Order }>()
);
export const trackOrderFailure = createAction(
    '[Order] Track Order Failure',
    props<{ error: string }>()
);

// Update Order Status
export const updateOrderStatus = createAction(
    '[Order] Update Status',
    props<{ orderId: number; status: OrderStatus }>()
);
export const updateOrderStatusSuccess = createAction(
    '[Order] Update Status Success',
    props<{ order: Order }>()
);

// Clear Current Order
export const clearCurrentOrder = createAction('[Order] Clear Current Order');
