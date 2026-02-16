import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WatchlistState } from './watchlist.model';

export const selectWatchlistState = createFeatureSelector<WatchlistState>('watchlist');

export const selectWatchlistItems = createSelector(
    selectWatchlistState,
    state => state.items
);

export const selectWatchlistItemCount = createSelector(
    selectWatchlistItems,
    items => items.length
);

export const selectIsInWatchlist = (productId: number) => createSelector(
    selectWatchlistItems,
    items => !!items.find(i => i.productId === productId)
);
