import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    /**
     * Set data to sessionStorage (Lasts until tab/window is closed)
     */
    setSession(key: string, data: any): void {
        if (typeof window !== 'undefined') {
            try {
                sessionStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
                console.warn('Session storage limit reached or unavailable', e);
            }
        }
    }

    /**
     * Get data from sessionStorage
     */
    getSession<T>(key: string): T | null {
        if (typeof window !== 'undefined') {
            const data = sessionStorage.getItem(key);
            try {
                return data ? JSON.parse(data) : null;
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Set data to localStorage (Persistent)
     */
    setLocal(key: string, data: any): void {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
                console.warn('Local storage limit reached or unavailable', e);
            }
        }
    }

    /**
     * Get data from localStorage
     */
    getLocal<T>(key: string): T | null {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem(key);
            try {
                return data ? JSON.parse(data) : null;
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Clear specific product related cache from session storage
     */
    clearProductCache(): void {
        if (typeof window !== 'undefined') {
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => {
                if (key.startsWith('products_') || key.startsWith('search_') || key.startsWith('cat_')) {
                    sessionStorage.removeItem(key);
                }
            });
        }
    }

    /**
     * Completely wipe everything (Local and Session)
     */
    clearAll(): void {
        if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
        }
    }
}
