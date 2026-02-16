import { createAction, props } from '@ngrx/store';
import { WatchlistItem } from './watchlist.model';

export const loadWatchlist = createAction('[Watchlist] Load Watchlist');
export const loadWatchlistSuccess = createAction(
    '[Watchlist] Load Watchlist Success',
    props<{ items: WatchlistItem[] }>()
);
export const loadWatchlistFailure = createAction(
    '[Watchlist] Load Watchlist Failure',
    props<{ error: any }>()
);

export const toggleWatchlist = createAction(
    '[Watchlist] Toggle Watchlist',
    props<{ item: WatchlistItem }>()
);

export const removeFromWatchlist = createAction(
    '[Watchlist] Remove From Watchlist',
    props<{ productId: number }>()
);
