import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../Services/admin.service';
import { Alert } from '../../../alert/alert';

@Component({
  selector: 'app-wiatingdemandesliste',
  imports: [CommonModule, RouterModule,Alert],
  templateUrl: './wiatingdemandesliste.html',
  styleUrl: './wiatingdemandesliste.css'
})
export class Wiatingdemandesliste {
 demandes: any[] = [];
  filteredDemandes: any[] = [] ;
  isLoading: boolean = false;
  errorMessage: string = '';
  alertMessage:string = '';
  alertType: 'success' | 'error' | 'warning' = 'error';

 
   constructor(private adminService: AdminService) {}
 
   ngOnInit(): void {
     this.loadData();
   }
 
   loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.filteredDemandes = [];
  
    this.adminService.getDemandes().subscribe({
      next: (res: any) => {
        // Ensure res.data is an array
        this.demandes = Array.isArray(res.data) ? res.data : [];
  
        // Parse details_comptable if it’s a JSON string
        this.demandes = this.demandes.map((demande: any) => {
          return {
            ...demande,
            detailcomptables: typeof demande.detailcomptables === 'string'
              ? JSON.parse(demande.detailcomptables)
              : demande.detailcomptables
          };
        });
  
        // Filter demandes
        this.filteredDemandes = this.demandes.filter(
          (demande) => demande.etat_demande === 'en cours de traitement'
        );
  
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching demandes:', err);
        this.errorMessage = 'Failed to load demandes. Please try again later.';
        this.isLoading = false;
      }
    });
  }
  showAlert(message: string, type: 'success' | 'error' | 'warning' = 'warning'): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
 
 
   closeAlert(): void {
     this.errorMessage = '';
   }
 }
