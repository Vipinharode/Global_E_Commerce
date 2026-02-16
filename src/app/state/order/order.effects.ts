import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { OrderService } from '../../core/services/order.service';
import * as OrderActions from './order.actions';

@Injectable()
export class OrderEffects {
    private actions$ = inject(Actions);
    private orderService = inject(OrderService);
    private store = inject(Store);
    private readonly ORDERS_KEY = 'user_orders_history';

    createOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.createOrder),
            mergeMap(action =>
                this.orderService.createOrder(action.order).pipe(
                    map(response => {
                        // Transform API response to Order model
                        const order = {
                            id: response.id || Date.now(),
                            ...action.order,
                            date: new Date().toISOString(),
                        };
                        return OrderActions.createOrderSuccess({ order: order as any });
                    }),
                    catchError(error => of(OrderActions.createOrderFailure({ error: error.message })))
                )
            )
        )
    );

    loadOrders$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.loadOrders),
            switchMap(() => {
                // 1. Get local orders from storage
                const localOrdersStr = localStorage.getItem(this.ORDERS_KEY);
                const localOrders: any[] = localOrdersStr ? JSON.parse(localOrdersStr) : [];

                // 2. Fetch API orders
                return this.orderService.getUserOrders(1).pipe(
                    map(response => {
                        const apiOrdersRaw = response.carts || [];
                        const apiOrders: any[] = apiOrdersRaw.map((cart: any) => ({
                            id: cart.id,
                            userId: cart.userId,
                            date: new Date().toISOString(),
                            orderDate: new Date().toISOString(),
                            total: cart.total,
                            status: 'delivered', // API orders are historical
                            paymentMethod: 'Credit Card',
                            items: cart.products.map((p: any) => ({
                                productId: p.id,
                                title: p.title,
                                price: p.price,
                                quantity: p.quantity,
                                image: p.thumbnail
                            })),
                            products: cart.products.map((p: any) => ({
                                productId: p.id,
                                title: p.title,
                                price: p.price,
                                quantity: p.quantity,
                                image: p.thumbnail
                            })),
                            shippingAddress: {
                                fullName: 'Guest User',
                                street: '456 Historic Ave',
                                city: 'New York',
                                state: 'NY',
                                zipCode: '10001',
                                country: 'USA',
                                phone: '+1234567890'
                            },
                            trackingNumber: `TRK-API-${cart.id}`,
                            estimatedDelivery: new Date().toISOString()
                        }));

                        // 3. Merge them, preventing duplicates by ID
                        const mergedOrders = [...localOrders];
                        apiOrders.forEach((apiOrder: any) => {
                            if (!mergedOrders.find(o => o.id === apiOrder.id)) {
                                mergedOrders.push(apiOrder);
                            }
                        });
                        return OrderActions.loadOrdersSuccess({ orders: mergedOrders });
                    }),
                    catchError(error => {
                        // If API fails, still return local orders
                        return of(OrderActions.loadOrdersSuccess({ orders: localOrders }));
                    })
                );
            })
        )
    );

    persistOrders$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.createOrderSuccess, OrderActions.updateOrderStatusSuccess),
            withLatestFrom(this.store.select(state => (state as any).orders.orders)),
            tap(([action, allOrders]) => {
                localStorage.setItem(this.ORDERS_KEY, JSON.stringify(allOrders));
            })
        ),
        { dispatch: false }
    );

    trackOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.trackOrder),
            mergeMap(action =>
                this.orderService.trackOrder(action.orderId).pipe(
                    map(order => OrderActions.trackOrderSuccess({ order })),
                    catchError(error => of(OrderActions.trackOrderFailure({ error: error.message })))
                )
            )
        )
    );
}
