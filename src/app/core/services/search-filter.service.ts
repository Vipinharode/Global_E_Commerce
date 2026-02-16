import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SearchFilterService {
    // Signals for reactive state
    searchTerm = signal('');
    sortOrder = signal<any>(null);
    selectedCategory = signal('All');

    // Update methods
    setSearchTerm(term: string) {
        this.searchTerm.set(term);
    }

    setSortOrder(order: any) {
        this.sortOrder.set(order);
    }

    setCategory(category: string) {
        this.selectedCategory.set(category);
    }

    clearFilters() {
        this.searchTerm.set('');
        this.sortOrder.set(null);
        this.selectedCategory.set('All');
    }
}
