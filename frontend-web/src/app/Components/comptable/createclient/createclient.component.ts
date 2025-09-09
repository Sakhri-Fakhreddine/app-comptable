import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../Services/client.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-createclient',
  templateUrl: './createclient.component.html',
  styleUrls: ['./createclient.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CreateclientComponent implements OnInit {
  clientForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  isAuthenticated: boolean = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = !!localStorage.getItem('token');

    // Force refresh once on first load
    if (!sessionStorage.getItem('createClientRefreshed')) {
      sessionStorage.setItem('createClientRefreshed', 'true');
      window.location.reload(); // Refresh once
      return;
    }

    this.loadForm();

    // Optional: scroll to top on route changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  loadForm(): void {
    this.clientForm = this.fb.group({
      Nomprenom: ['', Validators.required],
      nom_commerciale: ['', Validators.required],
      adresse: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.clientService.createClient(this.clientForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = res.message;
          this.errorMessage = '';
          this.clientForm.reset();
          this.router.navigate(['/clientslist']); // Correct route
        } else {
          this.errorMessage = res.message || 'Failed to add client.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to add client.';
        console.error('Error creating client:', err);
      }
    });
  }
}
