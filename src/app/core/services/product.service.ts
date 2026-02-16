import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Product } from '../../state/product/product.model';
import { CacheService } from './cache.service';

interface DummyProductResponse {
    products: any[];
    total: number;
    skip: number;
    limit: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private readonly API_URL = 'https://dummyjson.com';

    constructor(
        private http: HttpClient,
        private cacheService: CacheService
    ) { }

    getAllProducts(limit: number = 25, skip: number = 0, sortBy?: string, order?: string): Observable<{ products: Product[], total: number }> {
        const isStandardBatch = !sortBy && !order;
        const cacheKey = 'all_products_catalog';

        // Check if we have the FULL catalog already
        const cached = this.cacheService.getSession<{ products: Product[], total: number }>(cacheKey);
        if (cached && cached.products && cached.products.length >= cached.total && isStandardBatch) {
            // We have everything, no need to hit API
            return of({
                products: cached.products.slice(skip, skip + limit),
                total: cached.total
            });
        }

        let url = `${this.API_URL}/products?limit=${limit}&skip=${skip}`;
        if (sortBy) url += `&sortBy=${sortBy}&order=${order}`;

        return this.http.get<DummyProductResponse>(url).pipe(
            map(response => ({
                products: response.products.map(this.mapToProduct),
                total: response.total
            })),
            tap(data => {
                if (isStandardBatch && data.products && data.products.length > 0) {
                    const existing = this.cacheService.getSession<{ products: Product[], total: number }>(cacheKey);
                    if (existing) {
                        const allProducts = [...existing.products];
                        data.products.forEach(newP => {
                            if (!allProducts.find(p => p.id === newP.id)) {
                                allProducts.push(newP);
                            }
                        });
                        this.cacheService.setSession(cacheKey, { products: allProducts, total: data.total });
                    } else {
                        this.cacheService.setSession(cacheKey, data);
                    }
                }
            })
        );
    }

    getProduct(id: number): Observable<Product> {
        const cacheKey = `product_detail_${id}`;
        const cached = this.cacheService.getSession<Product>(cacheKey);

        if (cached) return of(cached);

        return this.http.get<any>(`${this.API_URL}/products/${id}`).pipe(
            map(this.mapToProduct),
            tap(product => {
                if (product) this.cacheService.setSession(cacheKey, product);
            })
        );
    }

    getProductsByCategory(category: string, limit: number = 25, skip: number = 0, sortBy?: string, order?: string): Observable<{ products: Product[], total: number }> {
        // Try to filter from master catalog in session storage first
        const cached = this.cacheService.getSession<{ products: Product[], total: number }>('all_products_catalog');
        if (cached && cached.products && !sortBy) {
            const filtered = cached.products.filter(p => p.category === category);
            if (filtered.length > 0) {
                return of({
                    products: filtered.slice(skip, skip + limit),
                    total: filtered.length
                });
            }
        }

        let url = `${this.API_URL}/products/category/${category}?limit=${limit}&skip=${skip}`;
        if (sortBy) url += `&sortBy=${sortBy}&order=${order}`;
        return this.http.get<DummyProductResponse>(url).pipe(
            map(response => ({
                products: response.products.map(this.mapToProduct),
                total: response.total
            }))
        );
    }

    searchProducts(query: string, limit: number = 25, skip: number = 0, sortBy?: string, order?: string): Observable<{ products: Product[], total: number }> {
        // No session caching for search results as requested
        let url = `${this.API_URL}/products/search?q=${query}&limit=${limit}&skip=${skip}`;
        if (sortBy) url += `&sortBy=${sortBy}&order=${order}`;
        return this.http.get<DummyProductResponse>(url).pipe(
            map(response => ({
                products: response.products.map(this.mapToProduct),
                total: response.total
            }))
        );
    }

    getCategories(): Observable<string[]> {
        const cacheKey = 'product_categories';
        const cached = this.cacheService.getLocal<string[]>(cacheKey);

        if (cached) return of(cached);

        return this.http.get<string[]>(`${this.API_URL}/products/category-list`).pipe(
            tap(cats => this.cacheService.setLocal(cacheKey, cats))
        );
    }

    // Helper to map dummyjson structure to our Product model
    private mapToProduct(item: any): Product {
        return {
            id: item.id,
            title: item.title,
            price: item.price,
            description: item.description,
            category: item.category,
            image: item.thumbnail,
            thumbnail: item.thumbnail,
            images: item.images || [item.thumbnail],
            rating: {
                rate: item.rating,
                count: item.reviews ? item.reviews.length : 0
            },
            stock: item.stock || 0,
            availabilityStatus: item.availabilityStatus,
            brand: item.brand,
            discountPercentage: item.discountPercentage,
            returnPolicy: item.returnPolicy,
            reviews: item.reviews,
            shippingInformation: item.shippingInformation,
            warrantyInformation: item.warrantyInformation
        };
    }
}
