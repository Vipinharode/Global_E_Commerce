import { createReducer, on } from '@ngrx/store';
import { WatchlistState } from './watchlist.model';
import * as WatchlistActions from './watchlist.actions';

export const initialState: WatchlistState = {
    items: [],
    loading: false,
    error: null
};

export const watchlistReducer = createReducer(
    initialState,
    on(WatchlistActions.loadWatchlist, state => ({
        ...state,
        loading: true
    })),
    on(WatchlistActions.loadWatchlistSuccess, (state, { items }) => ({
        ...state,
        items,
        loading: false
    })),
    on(WatchlistActions.loadWatchlistFailure, (state, { error }) => ({
        ...state,
        error,
        loading: false
    })),
    on(WatchlistActions.toggleWatchlist, (state, { item }) => {
        const exists = state.items.find(i => i.productId === item.productId);
        if (exists) {
            return {
                ...state,
                items: state.items.filter(i => i.productId !== item.productId)
            };
        } else {
            return {
                ...state,
                items: [...state.items, item]
            };
        }
    }),
    on(WatchlistActions.removeFromWatchlist, (state, { productId }) => ({
        ...state,
        items: state.items.filter(i => i.productId !== productId)
    }))
);
