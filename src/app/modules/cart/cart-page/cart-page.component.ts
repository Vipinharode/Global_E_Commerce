import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

import { CartItem } from '../../../state/cart/cart.model';
import * as CartSelectors from '../../../state/cart/cart.selectors';
import * as CartActions from '../../../state/cart/cart.actions';
import * as OrderActions from '../../../state/order/order.actions';
import { Order, OrderStatus } from '../../../state/order/order.model';
import { CurrencyPipe } from '../../../core/pipes/currency.pipe';

@Component({
    selector: 'app-cart-page',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        TableModule,
        InputNumberModule,
        FormsModule,
        CurrencyPipe,
        TooltipModule
    ],
    templateUrl: './cart-page.component.html',
    styleUrls: ['./cart-page.component.css']
})
export class CartPageComponent implements OnInit {
    private store = inject(Store);
    private router = inject(Router);

    // Signals
    cartItems = toSignal(this.store.select(CartSelectors.selectCartItems), { initialValue: [] as CartItem[] });
    cartTotal = toSignal(this.store.select(CartSelectors.selectCartTotal), { initialValue: 0 });
    cartItemCount = toSignal(this.store.select(CartSelectors.selectCartItemCount), { initialValue: 0 });

    constructor() { }

    ngOnInit() { }

    updateQuantity(id: number, quantity: number) {
        if (quantity > 0) {
            this.store.dispatch(CartActions.updateQuantity({
                id,
                quantity
            }));
        }
    }

    increaseQuantity(item: CartItem) {
        this.updateQuantity(item.id, item.quantity + 1);
    }

    decreaseQuantity(item: CartItem) {
        if (item.quantity > 1) {
            this.updateQuantity(item.id, item.quantity - 1);
        }
    }

    removeItem(id: number) {
        this.store.dispatch(CartActions.removeFromCart({ id }));
    }

    clearCart() {
        this.store.dispatch(CartActions.clearCart());
    }

    proceedToCheckout() {
        // Get current cart items and total synchronously from signals
        const items = this.cartItems();
        const total = this.cartTotal();

        if (items.length === 0) return;

        // Generate order ID
        const orderId = Date.now();

        // Create order object
        const order: Partial<Order> = {
            id: orderId,
            userId: 1, // Guest user
            date: new Date().toISOString(),
            orderDate: new Date().toISOString(),
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                title: item.title,
                price: item.price,
                image: item.image
            })),
            products: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                title: item.title,
                price: item.price,
                image: item.image
            })),
            status: OrderStatus.PROCESSING,
            total: total,
            paymentMethod: 'Credit Card',
            shippingAddress: {
                fullName: 'Guest User',
                street: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'United States',
                phone: '+1 (555) 123-4567'
            },
            trackingNumber: `TRK${orderId}`,
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        };

        // Dispatch action to create order
        this.store.dispatch(OrderActions.createOrder({ order }));

        // Clear cart after order is placed
        this.store.dispatch(CartActions.clearCart());

        // Navigate to order confirmation
        this.router.navigate(['/order-confirmation', orderId]);
    }

    continueShopping() {
        this.router.navigate(['/products']);
    }
}
