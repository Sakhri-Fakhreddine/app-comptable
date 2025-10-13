import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  contactForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(private fb: FormBuilder, private http: HttpClient,private location: Location,) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  sendMessage() {
    if (this.contactForm.invalid) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post('http://localhost:8000/api/contact', this.contactForm.value).subscribe({
      next: (res: any) => {
        this.successMessage = '✅ Message envoyé avec succès !';
        this.contactForm.reset();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = '❌ Erreur lors de l’envoi du message.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
