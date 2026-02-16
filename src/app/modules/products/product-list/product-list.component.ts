import { Component, OnInit, OnDestroy, inject, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, skip, takeUntil } from 'rxjs/operators';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { Product } from '../../../state/product/product.model';
import * as ProductActions from '../../../state/product/product.actions';
import * as ProductSelectors from '../../../state/product/product.selectors';
import * as CartActions from '../../../state/cart/cart.actions';
import * as WatchlistActions from '../../../state/watchlist/watchlist.actions';
import * as WatchlistSelectors from '../../../state/watchlist/watchlist.selectors';
import * as AuthSelectors from '../../../state/auth/auth.selectors';
import { CurrencyService } from '../../../core/services/currency.service';
import { SearchFilterService } from '../../../core/services/search-filter.service';
import { CurrencyPipe } from '../../../core/pipes/currency.pipe';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        PaginatorModule,
        SkeletonModule,
        RatingModule,
        InputTextModule,
        SelectModule,
        TagModule,
        CurrencyPipe
    ],
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
    private store = inject(Store);
    private router = inject(Router);
    public currencyService = inject(CurrencyService);
    public searchFilterService = inject(SearchFilterService);

    // Signals
    allProducts = toSignal(this.store.select(ProductSelectors.selectAllProducts), { initialValue: [] as Product[] });
    loading = toSignal(this.store.select(ProductSelectors.selectProductLoading), { initialValue: false });
    pagination = toSignal(this.store.select(ProductSelectors.selectProductPagination), { initialValue: { currentPage: 1, pageSize: 12, totalItems: 0 } });

    isAuthenticated = toSignal(this.store.select(AuthSelectors.selectIsAuthenticated), { initialValue: false });
    isAdmin = toSignal(this.store.select(AuthSelectors.selectIsAdmin), { initialValue: false });

    private watchlistItems = toSignal(this.store.select(WatchlistSelectors.selectWatchlistItems), { initialValue: [] });
    // Optimize: Compute a Set for O(1) lookup
    watchlistIds = computed(() => {
        const items = this.watchlistItems() || [];
        return new Set(items.map(item => item.productId));
    });

    private categoryStyles: Record<string, { icon: string, color: string, textColor: string }> = {
        'beauty': { icon: 'pi-sparkles', color: '#ffecf0', textColor: '#d63384' },
        'fragrances': { icon: 'pi-scrolling', color: '#f3e5f5', textColor: '#8e24aa' },
        'furniture': { icon: 'pi-home', color: '#efebe9', textColor: '#6d4c41' },
        'groceries': { icon: 'pi-shopping-cart', color: '#e8f5e9', textColor: '#2e7d32' },
        'home-decoration': { icon: 'pi-image', color: '#fff3e0', textColor: '#e65100' },
        'kitchen-accessories': { icon: 'pi-box', color: '#f1f8e9', textColor: '#33691e' },
        'laptops': { icon: 'pi-desktop', color: '#e3f2fd', textColor: '#01579b' },
        'smartphones': { icon: 'pi-mobile', color: '#fce4ec', textColor: '#880e4f' },
        'skin-care': { icon: 'pi-sun', color: '#e0f2f1', textColor: '#004d40' },
        'tops': { icon: 'pi-palette', color: '#f3e5f5', textColor: '#4a148c' },
        'womens-dresses': { icon: 'pi-star', color: '#fbe9e7', textColor: '#bf360c' },
        'mens-shirts': { icon: 'pi-user', color: '#eceff1', textColor: '#263238' },
        'womens-shoes': { icon: 'pi-external-link', color: '#f1f1f1', textColor: '#333' },
        'mens-shoes': { icon: 'pi-external-link', color: '#f1f1f1', textColor: '#333' }
    };

    dynamicCategoryTabs = computed(() => {
        const products = this.allProducts();
        const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
        return uniqueCategories.map(cat => {
            const style = this.categoryStyles[cat] || { icon: 'pi-tag', color: '#f8fafc', textColor: '#64748b' };
            return {
                name: cat,
                icon: style.icon,
                color: style.color,
                textColor: style.textColor
            };
        });
    });

    filteredProducts = computed(() => {
        const products = this.allProducts();
        const category = this.searchFilterService.selectedCategory();
        if (category && category !== 'All') {
            return products.filter(p => p.category === category);
        }
        return products;
    });

    shouldFetchData = computed(() => this.isAuthenticated() && !this.isAdmin());

    get _searchTerm() { return this.searchFilterService.searchTerm(); }
    set _searchTerm(val: string) { this.searchFilterService.setSearchTerm(val); }

    private destroy$ = new Subject<void>();

    constructor() {
        combineLatest([
            toObservable(this.searchFilterService.searchTerm),
            toObservable(this.searchFilterService.sortOrder),
            toObservable(this.searchFilterService.selectedCategory)
        ]).pipe(
            skip(1),
            debounceTime(500),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            if (this.shouldFetchData()) {
                this.store.dispatch(ProductActions.loadProducts());
            }
        });
    }

    ngOnInit() {
        const products = this.allProducts();
        if (this.shouldFetchData() && products.length === 0) {
            this.store.dispatch(ProductActions.loadProducts());
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    @HostListener('window:scroll')
    onScroll() {
        if (this.loading() || this.filteredProducts().length >= this.pagination().totalItems) return;

        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            this.store.dispatch(ProductActions.loadMoreProducts());
        }
    }

    filterByCategory(category: string) {
        this.searchFilterService.setCategory(category);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    getCategorySampleLimited(products: Product[], category: string): Product[] {
        return products.filter(p => p.category === category).slice(0, 4);
    }

    viewProduct(id: number) { this.router.navigate(['/products', id]); }

    buyNow(product: Product, event: Event) {
        this.addToCart(product, event);
        this.router.navigate(['/cart']);
    }

    addToCart(product: Product, event: Event) {
        event.stopPropagation();
        this.store.dispatch(CartActions.addToCart({
            item: {
                productId: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
            }
        }));
    }

    toggleWatchlist(product: Product, event: Event) {
        event.stopPropagation();
        this.store.dispatch(WatchlistActions.toggleWatchlist({
            item: {
                productId: product.id,
                title: product.title,
                price: product.price,
                image: product.image
            }
        }));
    }

    isInWatchlist(productId: number): boolean {
        return this.watchlistIds().has(productId);
    }
}
