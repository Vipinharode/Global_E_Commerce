import { createAction, props } from '@ngrx/store';
import { Product } from './product.model';

// Load Products
export const loadProducts = createAction('[Product] Load Products');
export const loadProductsSuccess = createAction(
    '[Product] Load Products Success',
    props<{ products: Product[], total: number }>()
);
export const loadProductsFailure = createAction(
    '[Product] Load Products Failure',
    props<{ error: string }>()
);

// Load More Products
export const loadMoreProducts = createAction('[Product] Load More Products');
export const loadMoreProductsSuccess = createAction(
    '[Product] Load More Products Success',
    props<{ products: Product[], total: number }>()
);
export const loadMoreProductsFailure = createAction(
    '[Product] Load More Products Failure',
    props<{ error: string }>()
);

// Load Single Product
export const loadProduct = createAction(
    '[Product] Load Product',
    props<{ id: number }>()
);
export const loadProductSuccess = createAction(
    '[Product] Load Product Success',
    props<{ product: Product }>()
);
export const loadProductFailure = createAction(
    '[Product] Load Product Failure',
    props<{ error: string }>()
);

// Load Products by Category
export const loadProductsByCategory = createAction(
    '[Product] Load Products By Category',
    props<{ category: string }>()
);

// Filter Actions
export const setFilter = createAction(
    '[Product] Set Filter',
    props<{ filters: Partial<{ category: string; minPrice: number; maxPrice: number; searchTerm: string }> }>()
);

export const clearFilters = createAction('[Product] Clear Filters');

// Pagination
export const setPage = createAction(
    '[Product] Set Page',
    props<{ page: number }>()
);

export const clearProductState = createAction('[Product] Clear Product State');
