import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PopoverModule } from 'primeng/popover';
import { FormsModule } from '@angular/forms';
import * as CartSelectors from './state/cart/cart.selectors';
import * as CartActions from './state/cart/cart.actions';
import * as WatchlistSelectors from './state/watchlist/watchlist.selectors';
import * as WatchlistActions from './state/watchlist/watchlist.actions';
import * as AuthSelectors from './state/auth/auth.selectors';
import * as AuthActions from './state/auth/auth.actions';
import { SearchFilterService } from './core/services/search-filter.service';
import { CurrencyService, Currency } from './core/services/currency.service';
import { CurrencyPipe } from './core/pipes/currency.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MenubarModule,
    BadgeModule,
    ButtonModule,
    AvatarModule,
    InputTextModule,
    SelectModule,
    PopoverModule,
    FormsModule,
    CurrencyPipe
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  public searchFilterService = inject(SearchFilterService);
  public currencyService = inject(CurrencyService);
  private store = inject(Store);
  private router = inject(Router);

  // Core App Signals
  cartItemCount = toSignal(this.store.select(CartSelectors.selectCartItemCount), { initialValue: 0 });
  watchlistItemCount = toSignal(this.store.select(WatchlistSelectors.selectWatchlistItemCount), { initialValue: 0 });
  watchlistItems = toSignal(this.store.select(WatchlistSelectors.selectWatchlistItems), { initialValue: [] });
  isAuthenticated = toSignal(this.store.select(AuthSelectors.selectIsAuthenticated), { initialValue: false });
  currentUser = toSignal(this.store.select(AuthSelectors.selectUser), { initialValue: null });

  isAdmin = toSignal(this.store.select(AuthSelectors.selectUserRole).pipe(
    map((role: any) => role === 'admin')
  ), { initialValue: false });

  isAuthPage = signal(false);

  // Template Bindings
  get _searchTerm() { return this.searchFilterService.searchTerm(); }
  set _searchTerm(value: string) { this.searchFilterService.setSearchTerm(value); }

  get _sortOrder() { return this.searchFilterService.sortOrder(); }
  set _sortOrder(value: any) { this.searchFilterService.setSortOrder(value); }

  get _selectedCurrency() { return this.currencyService.selectedCurrency(); }
  set _selectedCurrency(value: Currency | null) {
    if (value) this.currencyService.setCurrency(value.code);
  }

  // Local State
  sortOptions = [
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Name: A to Z', value: 'name-asc' }
  ];

  constructor() {
    // Load customer data when authenticated
    effect(() => {
      if (this.isAuthenticated() && !this.isAdmin()) {
        this.store.dispatch(CartActions.loadCart());
        this.store.dispatch(WatchlistActions.loadWatchlist());
      }
    });

    // Monitor Auth Page state
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthPage.set(event.url.includes('/auth/'));
    });
  }

  ngOnInit() {
    this.store.dispatch(AuthActions.loadUserFromToken());
    // Initial check
    this.isAuthPage.set(this.router.url.includes('/auth/'));
  }

  onSortChange(event: any) {
    this.searchFilterService.setSortOrder(event.value);
  }

  onCurrencyChange(event: any) {
    this.currencyService.setCurrency(event.value.code);
  }

  removeFromWatchlist(productId: number) {
    this.store.dispatch(WatchlistActions.removeFromWatchlist({ productId }));
  }

  navigateToOrders() {
    this.router.navigate(['/orders']);
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToSignup() {
    this.router.navigate(['/auth/signup']);
  }
}

export { AppComponent as App };
