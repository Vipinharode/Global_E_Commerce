import { Injectable } from '@angular/core';
import { WatchlistItem } from '../../state/watchlist/watchlist.model';

@Injectable({
    providedIn: 'root'
})
export class WatchlistService {
    constructor() { }

    getLocalWatchlist(): WatchlistItem[] {
        const watchlist = localStorage.getItem('watchlist');
        return watchlist ? JSON.parse(watchlist) : [];
    }

    saveLocalWatchlist(items: WatchlistItem[]): void {
        localStorage.setItem('watchlist', JSON.stringify(items));
    }

    clearLocalWatchlist(): void {
        localStorage.removeItem('watchlist');
    }
}
