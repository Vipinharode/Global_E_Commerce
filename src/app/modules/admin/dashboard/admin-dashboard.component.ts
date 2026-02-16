import { Component, OnInit, signal, effect, inject, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, startWith, catchError } from 'rxjs/operators';
import { Subject, of, merge } from 'rxjs';
import * as Highcharts from 'highcharts';
import { HighchartsChartComponent } from 'highcharts-angular';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';

import { AdminService, DashboardMetrics } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyPipe as AppCurrencyPipe } from '../../../core/pipes/currency.pipe';
import { User } from '../../../state/auth/auth.model';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, AppCurrencyPipe, PaginatorModule, HighchartsChartComponent, ButtonModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export default class AdminDashboardComponent implements OnInit {
    private adminService = inject(AdminService);
    private authService = inject(AuthService);

    currentUser: User | null = this.authService.getCurrentUser();
    Highcharts: typeof Highcharts = Highcharts; // Expose Highcharts to template if needed

    // Reload Trigger
    private reloadTrigger$ = new Subject<void>();

    // Error Signal
    error = signal<string | null>(null);

    // Metrics Signal
    metrics = toSignal(
        merge(of(undefined), this.reloadTrigger$).pipe(
            switchMap(() => this.adminService.getDashboardMetrics().pipe(
                catchError(err => {
                    console.error('Dashboard Error:', err);
                    this.error.set('Failed to load dashboard data. Please try again later.');
                    return of(null);
                })
            ))
        ),
        { initialValue: null }
    );

    // Pagination Signals
    productFirst = signal(0);
    productRows = signal(10);
    userFirst = signal(0);
    userRows = signal(10);

    // Chart Configuration Signals
    pieOptions = signal<Highcharts.Options>({
        chart: { type: 'pie', backgroundColor: 'transparent' },
        title: { text: '' },
        series: [{ type: 'pie', name: 'Products', data: [] }]
    });

    barOptions = signal<Highcharts.Options>({
        chart: { type: 'bar', backgroundColor: 'transparent' },
        title: { text: '' },
        xAxis: { categories: [], title: { text: undefined } },
        yAxis: { min: 0, title: { text: 'Orders', align: 'high' } },
        legend: { enabled: false },
        series: [{ type: 'bar', name: 'Orders', data: [] }]
    });

    constructor() {
        // Effect to update charts when metrics change
        effect(() => {
            try {
                const m = this.metrics();
                if (m) {
                    this.updateChartOptions(m);
                }
            } catch (err) {
                console.error('Error in dashboard metrics effect:', err);
            }
        });
    }

    ngOnInit(): void { }

    updateChartOptions(metrics: DashboardMetrics): void {
        untracked(() => {
            try {
                if (!metrics) return;

                this.pieOptions.set({
                    ...this.pieOptions(),
                    series: [{
                        type: 'pie',
                        name: 'Products',
                        data: (metrics.topCategories || []).map((c: any) => ({
                            name: c.name || 'Unknown',
                            y: c.count || 0
                        }))
                    }]
                });

                this.barOptions.set({
                    ...this.barOptions(),
                    xAxis: {
                        categories: (metrics.ordersByCountry || []).map((c: any) => c.country || 'Unknown')
                    },
                    series: [{
                        type: 'bar',
                        name: 'Orders',
                        data: (metrics.ordersByCountry || []).map((c: any) => c.count || 0)
                    }]
                });
            } catch (err) {
                console.error('Error updating chart options:', err);
            }
        });
    }

    deleteUser(userId: number): void {
        if (confirm('Are you sure you want to delete this user?')) {
            this.adminService.deleteUser(userId);
            // Trigger reload
            this.reloadTrigger$.next();
        }
    }

    reload(): void {
        this.error.set(null);
        this.reloadTrigger$.next();
    }

    onProductPageChange(event: any) {
        this.productFirst.set(event.first);
        this.productRows.set(event.rows);
    }

    onUserPageChange(event: any) {
        this.userFirst.set(event.first);
        this.userRows.set(event.rows);
    }
}
