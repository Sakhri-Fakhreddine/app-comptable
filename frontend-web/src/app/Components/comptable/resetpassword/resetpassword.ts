import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ComptableService } from '../../../Services/comptable.service';

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './resetpassword.html',
  styleUrls: ['./resetpassword.css']
})
export class Resetpassword {
  resetForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  showCurrent = false;
  showNew = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private router: Router,
    private comptableService:ComptableService) {
    this.resetForm = this.fb.group({
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]]
    });
  }


  togglePassword(field: 'current' | 'new' | 'confirm') {
    if (field === 'current') this.showCurrent = !this.showCurrent;
    if (field === 'new') this.showNew = !this.showNew;
    if (field === 'confirm') this.showConfirm = !this.showConfirm;
  }

  
  resetPassword() {
    if (this.resetForm.invalid) return;

    const { new_password, confirm_password } = this.resetForm.value;
    if (new_password !== confirm_password) {
      this.errorMessage = '❌ Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.comptableService.resetPassword(this.resetForm.value).subscribe({
      next: (res: any) => {
        this.successMessage = '✅ Mot de passe mis à jour avec succès !';
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/profile']), 2000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.message || '❌ Une erreur est survenue.';
        this.isLoading = false;
      }
    });
    
  }
}
