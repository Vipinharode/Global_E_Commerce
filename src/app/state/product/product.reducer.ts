import { createReducer, on } from '@ngrx/store';
import { initialProductState } from './product.model';
import * as ProductActions from './product.actions';

export const productReducer = createReducer(
    initialProductState,

    // Load Products
    on(ProductActions.loadProducts, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(ProductActions.loadProductsSuccess, (state, { products, total }) => ({
        ...state,
        products,
        loading: false,
        pagination: {
            ...state.pagination,
            totalItems: total,
            currentPage: 1,
        },
    })),
    on(ProductActions.loadMoreProducts, (state) => ({
        ...state,
        loading: true,
    })),
    on(ProductActions.loadMoreProductsSuccess, (state, { products, total }) => {
        const currentIds = new Set(state.products.map(p => p.id));
        const newProducts = products.filter(p => !currentIds.has(p.id));
        return {
            ...state,
            products: [...state.products, ...newProducts],
            loading: false,
            pagination: {
                ...state.pagination,
                totalItems: total,
                currentPage: state.pagination.currentPage + 1,
            },
        };
    }),
    on(ProductActions.loadMoreProductsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),
    on(ProductActions.loadProductsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),

    // Load Single Product
    on(ProductActions.loadProduct, (state) => ({
        ...state,
        selectedProduct: null,
        loading: true,
        error: null,
    })),
    on(ProductActions.loadProductSuccess, (state, { product }) => ({
        ...state,
        selectedProduct: product,
        loading: false,
    })),
    on(ProductActions.loadProductFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),

    // Filters
    on(ProductActions.setFilter, (state, { filters }) => ({
        ...state,
        filters: {
            ...state.filters,
            ...filters,
        },
        pagination: {
            ...state.pagination,
            currentPage: 1, // Reset to first page on filter change
        },
    })),
    on(ProductActions.clearFilters, (state) => ({
        ...state,
        filters: initialProductState.filters,
        pagination: {
            ...state.pagination,
            currentPage: 1,
        },
    })),

    // Pagination
    on(ProductActions.setPage, (state, { page }) => ({
        ...state,
        pagination: {
            ...state.pagination,
            currentPage: page,
        },
    })),
    on(ProductActions.clearProductState, () => initialProductState)
);
