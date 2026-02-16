import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { customerGuard } from './core/guards/customer.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'products', // Will trigger guards on /products
        pathMatch: 'full'
    },
    // Authentication Routes (Public)
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./modules/auth/login/login.component')
                    .then(m => m.LoginComponent)
            },
            {
                path: 'signup',
                loadComponent: () => import('./modules/auth/signup/signup.component')
                    .then(m => m.SignupComponent)
            },
            {
                path: 'forgot-password',
                loadComponent: () => import('./modules/auth/forgot-password/forgot-password.component')
                    .then(m => m.ForgotPasswordComponent)
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        canActivate: [authGuard, customerGuard],
        children: [
            {
                path: 'products',
                loadComponent: () => import('./modules/products/product-list/product-list.component')
                    .then(m => m.ProductListComponent)
            },
            {
                path: 'products/:id',
                loadComponent: () => import('./modules/products/product-detail/product-detail.component')
                    .then(m => m.ProductDetailComponent)
            },
            {
                path: 'cart',
                loadComponent: () => import('./modules/cart/cart-page/cart-page.component')
                    .then(m => m.CartPageComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./modules/orders/order-list/order-list.component')
                    .then(m => m.OrderListComponent)
            },
            {
                path: 'order-confirmation/:id',
                loadComponent: () => import('./modules/orders/order-confirmation/order-confirmation.component')
                    .then(m => m.OrderConfirmationComponent)
            },
            {
                path: 'track-order/:id',
                loadComponent: () => import('./modules/orders/order-tracking/order-tracking.component')
                    .then(m => m.OrderTrackingComponent)
            }
        ]
    },
    // Admin Routes (Protected: Auth + Admin Role)
    {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./modules/admin/dashboard/admin-dashboard.component')
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    // Fallback
    {
        path: '**',
        redirectTo: 'products'
    }
];
