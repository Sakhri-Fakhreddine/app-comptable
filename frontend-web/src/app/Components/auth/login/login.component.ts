import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Alert } from '../../alert/alert';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatSnackBarModule,
    Alert
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  
    // Optional: load previously stored role
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    if (role) {
      console.log('Previously stored role:', role);
    }
  }
  

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.authService.login({ email, password }).subscribe({
        next: (res) => {
          // Store token and role safely
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', res.token);
            localStorage.setItem('role', res.user.usertype);
            // Set flag to trigger refresh after navigation
            localStorage.setItem('needsRefresh', 'true');
          }
          const userType = res.user?.usertype;

          if (userType === 'comptable') {
            this.router.navigate(['/comptablehome']).then(() => {
              if (localStorage.getItem('needsRefresh') === 'true') {
                localStorage.removeItem('needsRefresh');
                window.location.reload();
              }
            });
          } else if (userType === 'client') {
            this.router.navigate(['/clienthome']).then(() => {
              if (localStorage.getItem('needsRefresh') === 'true') {
                localStorage.removeItem('needsRefresh');
                window.location.reload();
              }
            });
          } else if (userType === 'admin') {
            this.router.navigate(['/admin']).then(() => {
              if (localStorage.getItem('needsRefresh') === 'true') {
                localStorage.removeItem('needsRefresh');
                window.location.reload();
              }
            });
          } else {
            this.showAlert('Unknown user type.', 'error');
          }
        },
        error: (err) => {
          console.error(err);
          const message = err?.error?.message || 'Login failed.';
          this.showAlert(message, 'warning');
        }
      });
    }
  }
  

  showAlert(message: string, type: 'success' | 'error' | 'warning' = 'warning'): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
  closeAlert() {
    this.alertMessage = '';
  }
  
  togglePasswordVisibility(passwordField: HTMLInputElement, toggleIcon: HTMLImageElement): void {
    const isVisible = passwordField.type === 'text';
    passwordField.type = isVisible ? 'password' : 'text';
    toggleIcon.src = isVisible ? 'userassets/images/show.png' : 'userassets/images/hidden.png';
  }
}
