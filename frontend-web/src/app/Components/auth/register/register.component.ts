import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../Services/auth.service';
import { Alert } from '../../alert/alert';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,        // ✅ For *ngIf
    ReactiveFormsModule, // ✅ For formGroup
    FormsModule  ,
    Alert        
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  success: string = '';
  error: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      password_confirmation: ['', Validators.required],
      nom_commercial: ['', Validators.required],
      registre_de_commerce: ['', Validators.required],
      code_tva: ['', Validators.required],
      phone: ['', Validators.required],
      typeabonnement: ['', Validators.required],
      terms: [false, [Validators.requiredTrue]],
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
  
    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.success = 'Registration successful!';
        this.error = '';
        console.log(res);
        this.showAlert(
          'Demande créée avec succès !\nNous vous notifierons de l’acceptation ou du refus.',
          'success'
        );
        // Redirect to login
          this.router.navigate(['/login']);
    
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed.';
        this.success = '';
        console.error(err);
  
        // Show error alert
        this.showAlert(this.error, 'error');
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

  showAlert(message: string, type: 'success' | 'error' | 'warning' = 'warning'): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
 
   closeAlert(): void {
     this.error = '';
   }
}
