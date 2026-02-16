import { ApplicationConfig, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { providePrimeNG } from 'primeng/config';
import { provideHighcharts } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

import { routes } from './app.routes';
import { productReducer } from './state/product/product.reducer';
import { cartReducer } from './state/cart/cart.reducer';
import { orderReducer } from './state/order/order.reducer';
import { watchlistReducer } from './state/watchlist/watchlist.reducer';
import { authReducer } from './state/auth/auth.reducer';
import { ProductEffects } from './state/product/product.effects';
import { CartEffects } from './state/cart/cart.effects';
import { OrderEffects } from './state/order/order.effects';
import { WatchlistEffects } from './state/watchlist/watchlist.effects';
import { AuthEffects } from './state/auth/auth.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    providePrimeNG({
      ripple: true
    }),
    provideStore({
      auth: authReducer,
      products: productReducer,
      cart: cartReducer,
      orders: orderReducer,
      watchlist: watchlistReducer,
    }),
    provideEffects([AuthEffects, ProductEffects, CartEffects, OrderEffects, WatchlistEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    provideHighcharts({ instance: () => Promise.resolve(Highcharts) })
  ]
};
