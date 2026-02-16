import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';

import * as AuthActions from '../../../state/auth/auth.actions';
import * as AuthSelectors from '../../../state/auth/auth.selectors';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        CheckboxModule,
        MessageModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    loginForm!: FormGroup;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;
    private destroy$ = new Subject<void>();

    // Demo credentials
    demoCredentials = [
        { username: 'emilys', password: 'emilyspass', role: 'Admin' },
        { username: 'michaelw', password: 'michaelwpass', role: 'Customer' }
    ];

    constructor(
        private fb: FormBuilder,
        private store: Store,
        private router: Router
    ) {
        this.loading$ = this.store.select(AuthSelectors.selectAuthLoading);
        this.error$ = this.store.select(AuthSelectors.selectAuthError);
    }

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });

        // Check if already authenticated
        this.store.select(AuthSelectors.selectIsAuthenticated)
            .pipe(takeUntil(this.destroy$))
            .subscribe(isAuth => {
                if (isAuth) {
                    this.router.navigate(['/products']);
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.store.dispatch(AuthActions.clearAuthError());
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            const credentials = {
                username: this.loginForm.value.username,
                password: this.loginForm.value.password
            };
            this.store.dispatch(AuthActions.login({ credentials }));
        } else {
            this.markFormGroupTouched(this.loginForm);
        }
    }

    useDemoCredentials(index: number): void {
        const cred = this.demoCredentials[index];
        this.loginForm.patchValue({
            username: cred.username,
            password: cred.password
        });
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    get username() {
        return this.loginForm.get('username');
    }

    get password() {
        return this.loginForm.get('password');
    }
}
