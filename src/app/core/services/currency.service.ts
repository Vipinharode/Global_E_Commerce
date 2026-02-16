import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './cache.service';

export interface Currency {
    code: string;
    symbol: string;
    name: string;
    rate: number;
    countryCode: string;
}

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {
    private http = inject(HttpClient);
    private cacheService = inject(CacheService);
    private readonly API_URL = 'https://open.er-api.com/v6/latest/USD';
    private readonly CACHE_KEY = 'currency_rates';
    private readonly CACHE_TS_KEY = 'currency_rates_timestamp';

    // Available currencies with default rates
    currencies = signal<Currency[]>([
        { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.12, countryCode: 'in' },
        { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.93, countryCode: 'eu' },
        { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79, countryCode: 'gb' },
        { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1, countryCode: 'us' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.23, countryCode: 'jp' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53, countryCode: 'au' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.35, countryCode: 'ca' },
        { code: 'AED', symbol: 'DH', name: 'UAE Dirham', rate: 3.67, countryCode: 'ae' }
    ]);

    // Selected currency signal
    selectedCurrency = signal<Currency>(this.currencies()[0]);

    constructor() {
        this.fetchRates();
    }

    async fetchRates() {
        const cached = this.cacheService.getLocal<any>(this.CACHE_KEY);
        const timestamp = this.cacheService.getLocal<number>(this.CACHE_TS_KEY);
        const now = Date.now();

        // Use cache if less than 12 hours old
        if (cached && timestamp && (now - timestamp < 12 * 60 * 60 * 1000)) {
            this.applyRates(cached);
            return;
        }

        try {
            const data: any = await firstValueFrom(this.http.get(this.API_URL));
            if (data && data.rates) {
                this.applyRates(data.rates);
                this.cacheService.setLocal(this.CACHE_KEY, data.rates);
                this.cacheService.setLocal(this.CACHE_TS_KEY, now);
            }
        } catch (error) {
            console.error('Failed to fetch currency rates:', error);
            if (cached) this.applyRates(cached);
        }
    }

    private applyRates(rates: any) {
        const updatedCurrencies = this.currencies().map(c => ({
            ...c,
            rate: rates[c.code] || c.rate
        }));
        this.currencies.set(updatedCurrencies);

        const current = this.selectedCurrency();
        const updated = updatedCurrencies.find(c => c.code === current.code);
        if (updated) {
            this.selectedCurrency.set(updated);
        }
    }

    setCurrency(code: string) {
        const currency = this.currencies().find(c => c.code === code);
        if (currency) {
            this.selectedCurrency.set(currency);
        }
    }

    convertPrice(priceInUSD: number, targetCurrency: Currency): number {
        return priceInUSD * targetCurrency.rate;
    }
}
