import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import * as OrderActions from '../../../state/order/order.actions';
import * as OrderSelectors from '../../../state/order/order.selectors';
import { Order } from '../../../state/order/order.model';
import { CurrencyPipe } from '../../../core/pipes/currency.pipe';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, TagModule, TableModule, CurrencyPipe],
    templateUrl: './order-list.component.html',
    styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
    private store = inject(Store);
    private router = inject(Router);

    orders$: Observable<Order[]>;

    constructor() {
        this.orders$ = this.store.select(OrderSelectors.selectAllOrders);
    }

    ngOnInit() {
        this.store.dispatch(OrderActions.loadOrders());
    }

    trackOrder(orderId: number) {
        this.router.navigate(['/track-order', orderId]);
    }

    getStatusSeverity(status: string | undefined): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
        if (!status) return 'info';
        const lowerStatus = status.toLowerCase();
        switch (lowerStatus) {
            case 'delivered': return 'success';
            case 'processing': return 'info';
            case 'shipped':
            case 'in-transit':
                return 'warn';
            case 'out-for-delivery': return 'info';
            default: return 'info';
        }
    }

    goBack() {
        this.router.navigate(['/products']);
    }
}
