import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  token!: string;
  email!: string;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.email = params['email'];
    });

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid || this.resetForm.value.password !== this.resetForm.value.password_confirmation) {
      this.error = 'Passwords must match and be at least 6 characters.';
      return;
    }

    const data = {
      token: this.token,
      email: this.email,
      password: this.resetForm.value.password,
      password_confirmation: this.resetForm.value.password_confirmation
    };

    this.authService.resetpassword(data).subscribe({
      next: () => {
        this.success = 'Password reset successfully. Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Password reset failed.';
      }
    });
  }
  togglePasswordVisibility(passwordField: HTMLInputElement, toggleIcon: HTMLImageElement): void {
    const isPasswordVisible = passwordField.type === 'text';

    if (isPasswordVisible) {
      passwordField.type = 'password';
      toggleIcon.src = 'userassets/images/show.png';  //  show icon
    } else {
      passwordField.type = 'text';
      toggleIcon.src = 'userassets/images/hidden.png';  // hide icon
    }
  }
}
