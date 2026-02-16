import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, combineLatest } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom, switchMap } from 'rxjs/operators';
import { ProductService } from '../../core/services/product.service';
import * as ProductActions from './product.actions';
import * as ProductSelectors from './product.selectors';
import { SearchFilterService } from '../../core/services/search-filter.service';

@Injectable()
export class ProductEffects {
    private actions$ = inject(Actions);
    private productService = inject(ProductService);

    private store = inject(Store);
    private searchFilterService = inject(SearchFilterService);

    loadProducts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductActions.loadProducts),
            withLatestFrom(
                this.store.select(ProductSelectors.selectAllProducts),
                this.store.select(ProductSelectors.selectProductPagination)
            ),
            switchMap(([_, existingProducts, pagination]) => {
                const category = this.searchFilterService.selectedCategory();
                const searchTerm = this.searchFilterService.searchTerm();
                const sortOrder = this.searchFilterService.sortOrder();
                const { sortBy, order } = this.getSortParams(sortOrder);

                let request$;
                if (searchTerm) {
                    request$ = this.productService.searchProducts(searchTerm, 25, 0, sortBy, order);
                } else if (category && category !== 'All') {
                    // CRITICAL: If we have products, don't hit API for category switch.
                    // The component filters the view locally from the master catalog.
                    // This prevents the state from being replaced by a subset, which keeps tabs stable.
                    if (existingProducts.length > 0 && !sortBy) {
                        return of(ProductActions.loadProductsSuccess({
                            products: existingProducts,
                            total: pagination.totalItems
                        }));
                    }
                    request$ = this.productService.getProductsByCategory(category, 25, 0, sortBy, order);
                } else {
                    // Revert to 25 limit for incremental loading on scroll
                    request$ = this.productService.getAllProducts(25, 0, sortBy, order);
                }

                return request$.pipe(
                    map(({ products, total }) => {
                        return ProductActions.loadProductsSuccess({
                            products,
                            total: total || products.length
                        });
                    }),
                    catchError(error => of(ProductActions.loadProductsFailure({ error: error.message })))
                );
            })
        )
    );

    loadMoreProducts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductActions.loadMoreProducts),
            withLatestFrom(
                this.store.select(ProductSelectors.selectAllProducts)
            ),
            switchMap(([_, products]) => {
                const category = this.searchFilterService.selectedCategory();
                const searchTerm = this.searchFilterService.searchTerm();
                const sortOrder = this.searchFilterService.sortOrder();

                const { sortBy, order } = this.getSortParams(sortOrder);
                const limit = 25;
                const skip = products.length; // Always skip based on what's currently in catalog

                let request$;

                if (searchTerm) {
                    request$ = this.productService.searchProducts(searchTerm, limit, skip, sortBy, order);
                } else {
                    // Even if we are on a category tab, we load more from "All" 
                    // to GROW the session catalog incrementally as requested.
                    request$ = this.productService.getAllProducts(limit, skip, sortBy, order);
                }

                return request$.pipe(
                    map(({ products, total }) => ProductActions.loadMoreProductsSuccess({
                        products,
                        total: total || (products.length + skip)
                    })),
                    catchError(error => of(ProductActions.loadMoreProductsFailure({ error: error.message })))
                );
            })
        )
    );

    loadProduct$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductActions.loadProduct),
            mergeMap(action =>
                this.productService.getProduct(action.id).pipe(
                    map(product => ProductActions.loadProductSuccess({ product })),
                    catchError(error => of(ProductActions.loadProductFailure({ error: error.message })))
                )
            )
        )
    );

    // Helper to parse sort params
    private getSortParams(sortOrder: any): { sortBy?: string, order?: string } {
        if (!sortOrder || !sortOrder.value) return {};
        const [sortBy, order] = sortOrder.value.split('-');
        if (sortBy === 'name') return { sortBy: 'title', order };
        return { sortBy, order };
    }
}
