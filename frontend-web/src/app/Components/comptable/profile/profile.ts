import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ComptableService } from '../../../Services/comptable.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  profileForm!: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient , 
    private comptableService:ComptableService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      Nomprenom: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
      nom_commerciale: [''],
      registre_de_commerce: [''],
      code_tva: ['']
    });

    this.loadProfile();
  }

  
  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.comptableService.getComptable().subscribe({
      next: (res: any) => {
        this.profileForm.patchValue(res);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Impossible de charger le profil.';
        this.isLoading = false;
      }
    });
  }
  


  // --- Save updated profile ---
  updateProfile() {
    if (this.profileForm.invalid) return;
    this.successMessage = '';
    this.errorMessage = '';
  
    console.log('🟦 Sending to backend:', this.profileForm.value);
  
    this.comptableService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        alert('✅ Profil mis à jour avec succès !');
        this.isLoading = false;
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error('❌ Backend error:', err);
        this.errorMessage = 'Erreur lors de la mise à jour.';
        this.isLoading = false;
      }
    });
  }
}
