import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';   // Needed for *ngIf and *ngFor
import { RouterModule } from '@angular/router';   // Needed for [routerLink]
import { ComptableService } from '../../../Services/comptable.service';

@Component({
  selector: 'app-clientlist',
  templateUrl: './clientlist.component.html',
  styleUrls: ['./clientlist.component.css'],
  imports: [CommonModule, RouterModule]
})
export class ClientlistComponent implements OnInit {
  clients: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  isAuthenticated: boolean = false;

  constructor(private comptableService: ComptableService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Check if user is authenticated based on token presence
      this.isAuthenticated = !!localStorage.getItem('token');
      if (this.isAuthenticated) {
        this.loadClients();
      }
    } else {
      // fallback: server or non-browser environment
      this.isAuthenticated = false;
    }
  }
  

  loadClients(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.comptableService.getClients().subscribe({
      next: (res: any) => {
        // Your backend returns { success: true, data: [...] }
        this.clients = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
        this.errorMessage = 'Failed to load clients. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}
