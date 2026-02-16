import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly API_URL = 'https://dummyjson.com';

    constructor(private http: HttpClient) { }

    getUserCart(userId: number): Observable<any> {
        return this.http.get(`${this.API_URL}/carts/user/${userId}`);
    }

    addToCart(userId: number, products: any[]): Observable<any> {
        return this.http.post(`${this.API_URL}/carts/add`, {
            userId,
            products
        });
    }

    updateCart(cartId: number, products: any[]): Observable<any> {
        return this.http.put(`${this.API_URL}/carts/${cartId}`, {
            products
        });
    }

    deleteCart(cartId: number): Observable<any> {
        return this.http.delete(`${this.API_URL}/carts/${cartId}`);
    }

    // Local storage operations
    getLocalCart(): any[] {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    saveLocalCart(items: any[]): void {
        localStorage.setItem('cart', JSON.stringify(items));
    }

    clearLocalCart(): void {
        localStorage.removeItem('cart');
    }
}
