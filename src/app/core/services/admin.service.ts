import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { Product } from '../../state/product/product.model';
import { User } from '../../state/auth/auth.model';

export interface DashboardMetrics {
    totalRevenue: number;
    activeUsers: number;
    stockInventory: { total: number; lowStockCount: number };
    topCategories: { name: string; count: number }[];
    bestSellers: Product[];
    ordersByCountry: { country: string; count: number }[];
    users: User[];
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = 'https://dummyjson.com';
    private deletedUsersKey = 'deleted_users';

    constructor(private http: HttpClient) { }

    deleteUser(userId: number): void {
        const deletedStr = localStorage.getItem(this.deletedUsersKey);
        const deletedIds: number[] = deletedStr ? JSON.parse(deletedStr) : [];
        if (!deletedIds.includes(userId)) {
            deletedIds.push(userId);
            localStorage.setItem(this.deletedUsersKey, JSON.stringify(deletedIds));
        }
    }

    getDashboardMetrics(): Observable<DashboardMetrics> {
        const timeoutDuration = 10000; // 10 seconds

        return forkJoin({
            carts: this.http.get<any>(`${this.apiUrl}/carts`).pipe(
                timeout(timeoutDuration),
                catchError(err => {
                    console.error('Carts API error:', err);
                    return of({ carts: [] });
                })
            ),
            usersAll: this.http.get<any>(`${this.apiUrl}/users?limit=100`).pipe(
                timeout(timeoutDuration),
                catchError(err => {
                    console.error('Users API error:', err);
                    return of({ users: [] });
                })
            ),
            products: this.http.get<any>(`${this.apiUrl}/products?limit=100`).pipe(
                timeout(timeoutDuration),
                catchError(err => {
                    console.error('Products API error:', err);
                    return of({ products: [] });
                })
            ),
            bestSellers: this.http.get<any>(`${this.apiUrl}/products?limit=100&sortBy=rating&order=desc`).pipe(
                timeout(timeoutDuration),
                catchError(err => {
                    console.error('BestSellers API error:', err);
                    return of({ products: [] });
                })
            )
        }).pipe(
            map(({ carts, usersAll, products, bestSellers }) => {
                const deletedStr = localStorage.getItem(this.deletedUsersKey);
                const deletedIds: number[] = deletedStr ? JSON.parse(deletedStr) : [];

                // Normalization helper
                const normalizeCountry = (c: string) => {
                    if (!c) return 'USA';
                    if (c === 'United States' || c === 'United State') return 'USA';
                    return c;
                };

                const cartsList = carts?.carts || [];
                const usersList = usersAll?.users || [];
                const productsList = products?.products || [];
                const topProductsList = bestSellers?.products || [];

                // Filter out deleted users from the base list
                const filteredUsers = usersList.filter((u: any) => !deletedIds.includes(u.id));

                // 1. Total Revenue
                const totalRevenue = cartsList.reduce((sum: number, cart: any) => sum + (cart.discountedTotal || cart.total || 0), 0);

                // 2. Active Users
                const activeUsers = filteredUsers.length;

                // 3. Stock Inventory
                const totalStock = productsList.reduce((sum: number, p: any) => sum + (p.stock || 0), 0);
                const lowStockCount = productsList.filter((p: any) => (p.stock || 0) < 10).length;

                // 4. Top Categories
                const categoryMap = new Map<string, number>();
                productsList.forEach((p: any) => {
                    if (p.category) {
                        categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
                    }
                });
                const topCategories = Array.from(categoryMap.entries())
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                // 5. Best Sellers
                const bestSellersList = topProductsList.map((item: any) => ({
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
                    stock: item.stock || 0
                }));

                // 6. Orders by Country
                const userMap = new Map<number, any>();
                usersList.forEach((u: any) => userMap.set(u.id, u));

                const countryMap = new Map<string, number>();
                cartsList.forEach((cart: any) => {
                    const user = userMap.get(cart.userId);
                    const rawLocation = user?.address?.country || user?.address?.state || 'USA';
                    const location = normalizeCountry(rawLocation);
                    countryMap.set(location, (countryMap.get(location) || 0) + 1);
                });

                if (!countryMap.has('India')) countryMap.set('India', 15);
                if (!countryMap.has('Australia')) countryMap.set('Australia', 10);

                const ordersByCountry = Array.from(countryMap.entries())
                    .map(([country, count]) => ({ country, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                // 7. Recent Users (List) with custom representative users
                const customUsers = [
                    {
                        id: 9991,
                        username: 'vipin',
                        email: 'vipin@example.com',
                        firstName: 'Vipin',
                        lastName: 'Harode',
                        gender: 'male',
                        image: 'https://i.pravatar.cc/150?u=vipin',
                        role: 'admin',
                        country: 'India'
                    },
                    {
                        id: 9992,
                        username: 'aarav',
                        email: 'aarav@example.com',
                        firstName: 'Aarav',
                        lastName: 'Sharma',
                        gender: 'male',
                        image: 'https://i.pravatar.cc/150?u=aarav',
                        role: 'customer',
                        country: 'India'
                    },
                    {
                        id: 9993,
                        username: 'liam_aus',
                        email: 'liam@example.au',
                        firstName: 'Liam',
                        lastName: 'Smith',
                        gender: 'male',
                        image: 'https://i.pravatar.cc/150?u=liam',
                        role: 'customer',
                        country: 'Australia'
                    },
                    {
                        id: 9994,
                        username: 'john_usa',
                        email: 'john@example.us',
                        firstName: 'John',
                        lastName: 'Doe',
                        gender: 'male',
                        image: 'https://i.pravatar.cc/150?u=john',
                        role: 'customer',
                        country: 'USA'
                    },
                    {
                        id: 9995,
                        username: 'sarah_admin',
                        email: 'sarah@example.com',
                        firstName: 'Sarah',
                        lastName: 'Wilson',
                        gender: 'female',
                        image: 'https://i.pravatar.cc/150?u=sarah',
                        role: 'admin',
                        country: 'USA'
                    }
                ];

                const mappedUsers = filteredUsers.map((u: any) => {
                    const rawCountry = (u.username === 'emilys') ? 'India' : (u.address?.country || u.address?.state || 'USA');
                    return {
                        id: u.id,
                        username: u.username,
                        email: u.email,
                        firstName: u.firstName,
                        lastName: u.lastName,
                        gender: u.gender,
                        image: u.image,
                        role: (u.username === 'emilys' || u.username === 'vipin') ? 'admin' : 'customer',
                        country: normalizeCountry(rawCountry)
                    };
                });

                // 8. Integrate Local Users who signed up recently
                const localUsersKey = 'local_signup_users';
                const localUsersStr = localStorage.getItem(localUsersKey);
                const localUsers: any[] = localUsersStr ? JSON.parse(localUsersStr) : [];
                const filteredCustomUsers = customUsers
                    .filter(u => !deletedIds.includes(u.id))
                    .map(u => ({ ...u, country: normalizeCountry(u.country) }));

                const filteredLocalUsers = localUsers
                    .filter(u => !deletedIds.includes(u.id))
                    .map(u => ({ ...u, country: normalizeCountry(u.country) }));

                const recentUsers = [...filteredLocalUsers, ...filteredCustomUsers, ...mappedUsers]
                    .sort((a: any, b: any) => {
                        // Sort Admins first
                        if (a.role === 'admin' && b.role !== 'admin') return -1;
                        if (a.role !== 'admin' && b.role === 'admin') return 1;
                        return 0;
                    });

                return {
                    totalRevenue,
                    activeUsers,
                    stockInventory: { total: totalStock, lowStockCount },
                    topCategories,
                    bestSellers: bestSellersList,
                    ordersByCountry: ordersByCountry,
                    users: recentUsers
                };
            })
        );
    }
}
