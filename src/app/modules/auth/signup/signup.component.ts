import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';

import * as AuthActions from '../../../state/auth/auth.actions';
import * as AuthSelectors from '../../../state/auth/auth.selectors';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        MessageModule,
        SelectModule
    ],
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
    signupForm!: FormGroup;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;
    private destroy$ = new Subject<void>();

    roles = [
        { label: 'Customer', value: 'customer' },
        { label: 'Admin', value: 'admin' }
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
        this.signupForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
            email: ['', [Validators.required, Validators.email]],
            role: ['customer', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6), this.passwordStrengthValidator]],
            confirmPassword: ['', [Validators.required]]
        }, {
            validators: this.passwordMatchValidator
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
        if (this.signupForm.valid) {
            const { confirmPassword, ...signupData } = this.signupForm.value;
            this.store.dispatch(AuthActions.signup({ request: signupData }));
        } else {
            this.markFormGroupTouched(this.signupForm);
        }
    }

    private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (!password || !confirmPassword) {
            return null;
        }

        return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    }

    private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
        const value = control.value;
        if (!value) {
            return null;
        }

        const hasNumber = /[0-9]/.test(value);
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);

        const passwordValid = hasNumber && hasUpper && hasLower;

        return passwordValid ? null : { weakPassword: true };
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    get firstName() {
        return this.signupForm.get('firstName');
    }

    get lastName() {
        return this.signupForm.get('lastName');
    }

    get username() {
        return this.signupForm.get('username');
    }

    get email() {
        return this.signupForm.get('email');
    }

    get password() {
        return this.signupForm.get('password');
    }

    get confirmPassword() {
        return this.signupForm.get('confirmPassword');
    }
}
