import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        ButtonModule,
        InputTextModule,
        MessageModule
    ],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
    forgotForm!: FormGroup;
    loading = false;
    successMessage: string | null = null;
    errorMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.forgotForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit(): void {
        if (this.forgotForm.valid) {
            this.loading = true;
            this.successMessage = null;
            this.errorMessage = null;

            const email = this.forgotForm.value.email;

            this.authService.forgotPassword(email)
                .pipe(finalize(() => this.loading = false))
                .subscribe({
                    next: (response) => {
                        this.successMessage = response.message;
                        this.forgotForm.reset();
                    },
                    error: (error) => {
                        this.errorMessage = error.message || 'Something went wrong. Please try again.';
                    }
                });
        } else {
            this.markFormGroupTouched(this.forgotForm);
        }
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    get email() {
        return this.forgotForm.get('email');
    }
}
