import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG Imports
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

// App Imports
import { CurrencyPipe } from '../../../core/pipes/currency.pipe';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../state/order/order.model';

@Component({
    selector: 'app-order-tracking',
    standalone: true,
    imports: [
        CommonModule,
        TimelineModule,
        TagModule,
        ButtonModule,
        CurrencyPipe
    ],
    templateUrl: './order-tracking.component.html',
    styleUrls: ['./order-tracking.component.css']
})
export class OrderTrackingComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private orderService = inject(OrderService);
    private destroyRef = inject(DestroyRef);

    items = [
        { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0', image: 'game-controller.jpg' },
        { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
        { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-envelope', color: '#FF9800' },
        { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
    ];

    orderId = signal<number>(0);
    orderData = signal<Order | null>(null);

    trackingEvents = computed(() => {
        const order = this.orderData();
        if (!order) return [];

        const statusMap: Record<string, number> = {
            [OrderStatus.PENDING]: 0,
            [OrderStatus.PROCESSING]: 1,
            [OrderStatus.SHIPPED]: 2,
            [OrderStatus.IN_TRANSIT]: 3,
            [OrderStatus.OUT_FOR_DELIVERY]: 4,
            [OrderStatus.DELIVERED]: 5,
            [OrderStatus.CANCELLED]: -1
        };

        const currentStep = statusMap[order.status] ?? 0;
        const now = new Date();

        return [
            {
                status: 'Order Placed',
                description: 'Order has been placed successfully',
                icon: 'pi pi-shopping-cart',
                color: currentStep >= 0 ? '#10b981' : '#e5e7eb',
                completed: currentStep >= 0,
                date: order.date ? new Date(order.date).toLocaleDateString() : ''
            },
            {
                status: 'Processing',
                description: 'Seller is processing your order',
                icon: 'pi pi-cog',
                color: currentStep >= 1 ? '#10b981' : '#e5e7eb',
                completed: currentStep >= 1,
                date: currentStep >= 1 ? new Date(now.getTime() - 86400000 * 3).toLocaleDateString() : ''
            },
            {
                status: 'Shipped',
                description: 'Item has been shipped via FedEx',
                icon: 'pi pi-box',
                color: currentStep >= 2 ? '#10b981' : '#e5e7eb',
                completed: currentStep >= 2,
                date: currentStep >= 2 ? new Date(now.getTime() - 86400000 * 2).toLocaleDateString() : ''
            },
            {
                status: 'In Transit',
                description: 'Order is on the way to your location',
                icon: 'pi pi-truck',
                color: currentStep >= 3 ? '#10b981' : '#e5e7eb',
                completed: currentStep >= 3,
                date: currentStep >= 3 ? new Date(now.getTime() - 86400000).toLocaleDateString() : ''
            },
            {
                status: 'Out for Delivery',
                description: 'Agent is out for delivery',
                icon: 'pi pi-user',
                color: currentStep >= 4 ? '#10b981' : '#e5e7eb',
                completed: currentStep >= 4,
                date: currentStep >= 4 ? new Date().toLocaleDateString() : ''
            },
            {
                status: 'Delivered',
                description: 'Order has been delivered',
                icon: 'pi pi-check',
                color: currentStep >= 5 ? '#10b981' : '#e5e7eb',
                completed: currentStep >= 5,
                date: currentStep >= 5 ? new Date().toLocaleDateString() : ''
            }
        ];
    });

    ngOnInit(): void {
        this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
            if (params['id']) {
                const id = Number(params['id']);
                this.orderId.set(id);

                // Start tracking logic
                this.orderService.trackOrder(id).pipe(
                    takeUntilDestroyed(this.destroyRef)
                ).subscribe({
                    next: (order) => {
                        this.orderData.set(order);
                    },
                    error: (err) => console.error('Error tracking order:', err)
                });
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/orders']);
    }

    getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
        switch (status) {
            case OrderStatus.DELIVERED:
                return 'success';
            case OrderStatus.SHIPPED:
            case OrderStatus.IN_TRANSIT:
            case OrderStatus.OUT_FOR_DELIVERY:
                return 'info';
            case OrderStatus.PROCESSING:
            case OrderStatus.PENDING:
                return 'warn';
            case OrderStatus.CANCELLED:
                return 'danger';
            default:
                return 'info';
        }
    }
}
