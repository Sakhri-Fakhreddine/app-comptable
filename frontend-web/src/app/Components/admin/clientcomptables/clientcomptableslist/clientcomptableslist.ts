import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../Services/admin.service';
import { Alert } from '../../../alert/alert';

@Component({
  selector: 'app-clientcomptableslist',
  standalone: true,
  imports: [CommonModule, RouterModule, Alert],
  templateUrl: './clientcomptableslist.html',
  styleUrl: './clientcomptableslist.css'
})
export class Clientcomptableslist implements OnInit {

  comptables: any[] = [];
  clients: any[] = [];
  filteredClients: { [key: number]: any[] } = {};
  isLoading: boolean = false;
  errorMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'error';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.filteredClients = {};

    // Fetch comptables
    this.adminService.getComptables().subscribe({
      next: (res: any) => {
        this.comptables = Array.isArray(res.data) ? res.data : [];
        // Fetch clients
        this.adminService.getClients().subscribe({
          next: (clientRes: any) => {
            this.clients = Array.isArray(clientRes.data) ? clientRes.data : [];
            // Group clients by comptable ID
            this.filteredClients = this.clients.reduce((acc, client) => {
              const comptableId = client.id_comptable || 0; // Fallback to 0 if undefined
              if (!acc[comptableId]) {
                acc[comptableId] = [];
              }
              acc[comptableId].push(client);
              return acc;
            }, {} as { [key: number]: any[] });
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching clients:', err);
            this.errorMessage = 'Failed to load clients. Please try again later.';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching comptables:', err);
        this.errorMessage = 'Failed to load comptables. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  closeAlert(): void {
    this.errorMessage = '';
  }
}
