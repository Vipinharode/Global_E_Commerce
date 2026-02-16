import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from './product.model';

export const selectProductState = createFeatureSelector<ProductState>('products');

export const selectAllProducts = createSelector(
    selectProductState,
    (state) => state.products
);

export const selectSelectedProduct = createSelector(
    selectProductState,
    (state) => state.selectedProduct
);

export const selectProductLoading = createSelector(
    selectProductState,
    (state) => state.loading
);

export const selectProductError = createSelector(
    selectProductState,
    (state) => state.error
);

export const selectProductFilters = createSelector(
    selectProductState,
    (state) => state.filters
);

export const selectProductPagination = createSelector(
    selectProductState,
    (state) => state.pagination
);

export const selectFilteredProducts = createSelector(
    selectAllProducts,
    selectProductFilters,
    (products, filters) => {
        return products.filter(product => {
            const matchesCategory = !filters.category || product.category === filters.category;
            const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice;
            const matchesSearch = !filters.searchTerm ||
                product.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(filters.searchTerm.toLowerCase());

            return matchesCategory && matchesPrice && matchesSearch;
        });
    }
);

export const selectPaginatedProducts = createSelector(
    selectFilteredProducts,
    selectProductPagination,
    (products, pagination) => {
        const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        return products.slice(startIndex, endIndex);
    }
);

export const selectCategories = createSelector(
    selectAllProducts,
    (products) => {
        const categories = products.map(p => p.category);
        return [...new Set(categories)];
    }
);
