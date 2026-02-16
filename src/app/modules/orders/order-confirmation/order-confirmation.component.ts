import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-order-confirmation',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    templateUrl: './order-confirmation.component.html',
    styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
    orderId: number = 0;
    currentDate = Date.now();

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.orderId = +params['id'];
        });
    }

    trackOrder() {
        this.router.navigate(['/track-order', this.orderId]);
    }

    continueShopping() {
        this.router.navigate(['/products']);
    }
}
