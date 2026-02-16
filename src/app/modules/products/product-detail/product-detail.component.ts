import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

import { Product } from '../../../state/product/product.model';
import * as ProductActions from '../../../state/product/product.actions';
import * as ProductSelectors from '../../../state/product/product.selectors';
import * as CartActions from '../../../state/cart/cart.actions';
import { CurrencyPipe } from '../../../core/pipes/currency.pipe';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        RatingModule,
        SkeletonModule,
        CurrencyPipe,
        TooltipModule
    ],
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
    private store = inject(Store);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    // Signals
    loading = toSignal(this.store.select(ProductSelectors.selectProductLoading), { initialValue: true });
    product = toSignal(this.store.select(ProductSelectors.selectSelectedProduct), { initialValue: null });

    quantity = signal(1);
    selectedImage = signal<string | null>(null);

    constructor() {
        // Sync selected image when product loads
        effect(() => {
            const p = this.product();
            if (p) {
                // Set initial thumbnail as main image
                this.selectedImage.set(p.image);
            } else {
                this.selectedImage.set(null);
            }
        }, { allowSignalWrites: true });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = +params['id'];
            // Reset quantity for new product
            this.quantity.set(1);
            this.store.dispatch(ProductActions.loadProduct({ id }));
        });
    }

    selectImage(url: string) {
        this.selectedImage.set(url);
    }

    incrementQuantity() {
        this.quantity.update(q => q + 1);
    }

    decrementQuantity() {
        if (this.quantity() > 1) {
            this.quantity.update(q => q - 1);
        }
    }

    addToCart(product: Product) {
        this.store.dispatch(CartActions.addToCart({
            item: {
                productId: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: this.quantity()
            }
        }));
    }

    buyNow(product: Product) {
        this.addToCart(product);
        this.router.navigate(['/cart']);
    }

    goBack() {
        this.router.navigate(['/products']);
    }
}
