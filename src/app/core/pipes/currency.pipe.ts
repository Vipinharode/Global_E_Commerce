import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService, Currency } from '../services/currency.service';

@Pipe({
    name: 'appCurrency',
    standalone: true,
    pure: false // Necessary to update when currency changes
})
export class CurrencyPipe implements PipeTransform {
    private currencyService = inject(CurrencyService);

    transform(price: number | undefined | null): string {
        const currentCurrency = this.currencyService.selectedCurrency();

        if (price === undefined || price === null) return '';
        if (!currentCurrency) return `$${price.toFixed(2)}`;

        const converted = price * currentCurrency.rate;
        return `${currentCurrency.symbol}${converted.toFixed(2)}`;
    }
}
