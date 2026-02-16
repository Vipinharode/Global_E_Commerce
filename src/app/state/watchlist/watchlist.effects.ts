import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import * as WatchlistActions from './watchlist.actions';
import { WatchlistService } from '../../core/services/watchlist.service';
import { Store } from '@ngrx/store';
import { selectWatchlistItems } from './watchlist.selectors';

@Injectable()
export class WatchlistEffects {
    private actions$ = inject(Actions);
    private watchlistService = inject(WatchlistService);
    private store = inject(Store);

    loadWatchlist$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WatchlistActions.loadWatchlist),
            switchMap(() => {
                const items = this.watchlistService.getLocalWatchlist();
                return of(WatchlistActions.loadWatchlistSuccess({ items }));
            })
        )
    );

    syncWatchlist$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WatchlistActions.toggleWatchlist, WatchlistActions.removeFromWatchlist),
            switchMap(() => this.store.select(selectWatchlistItems)),
            tap(items => {
                this.watchlistService.saveLocalWatchlist(items);
            })
        ),
        { dispatch: false }
    );
}
