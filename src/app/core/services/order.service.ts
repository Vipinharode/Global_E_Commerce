import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Order, OrderStatus } from '../../state/order/order.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private readonly API_URL = 'https://dummyjson.com';

    constructor(private http: HttpClient) { }

    createOrder(orderData: any): Observable<any> {
        // Using DummyJSON carts endpoint as order simulation
        return this.http.post(`${this.API_URL}/carts/add`, orderData);
    }

    getUserOrders(userId: number): Observable<any> {
        return this.http.get(`${this.API_URL}/carts/user/${userId}`);
    }

    getOrderById(orderId: number): Observable<any> {
        return this.http.get(`${this.API_URL}/carts/${orderId}`);
    }

    // Mock real-time order tracking with simulated status updates
    trackOrder(orderId: number, currentStatus?: OrderStatus): Observable<Order> {
        const mockOrder: Order = {
            id: orderId,
            userId: 1,
            date: new Date().toISOString(),
            products: [],
            status: currentStatus || OrderStatus.PROCESSING,
            total: 0,
            paymentMethod: 'Credit Card',
            shippingAddress: {
                fullName: 'Mohan Sharma',
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'USA',
                phone: '+1234567890'
            },
            trackingNumber: `TRK${orderId}`,
            estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        };

        // If already delivered, return static order immediately
        if (currentStatus === OrderStatus.DELIVERED) {
            return of(mockOrder);
        }

        // Simulate real-time status updates
        return interval(5000).pipe(
            startWith(0),
            map(tick => {
                const statuses = [
                    OrderStatus.PROCESSING,
                    OrderStatus.SHIPPED,
                    OrderStatus.IN_TRANSIT,
                    OrderStatus.OUT_FOR_DELIVERY,
                    OrderStatus.DELIVERED
                ];

                // Determine start point
                let startIndex = 0;
                if (currentStatus) {
                    startIndex = Math.max(0, statuses.indexOf(currentStatus));
                }

                const currentStatusIndex = Math.min(startIndex + tick, statuses.length - 1);
                return {
                    ...mockOrder,
                    status: statuses[currentStatusIndex]
                };
            })
        );
    }

    // Get order statistics for admin
    getOrderStats(): Observable<any> {
        return this.http.get(`${this.API_URL}/carts`).pipe(
            map((response: any) => {
                const carts = response.carts || [];
                return {
                    totalOrders: carts.length,
                    totalRevenue: carts.reduce((sum: number, cart: any) => sum + (cart.total || 0), 0),
                    averageOrderValue: carts.length > 0
                        ? carts.reduce((sum: number, cart: any) => sum + (cart.total || 0), 0) / carts.length
                        : 0,
                    conversionRate: 65.5, // Mock data
                    paymentSuccessRate: 98.2 // Mock data
                };
            })
        );
    }
}
