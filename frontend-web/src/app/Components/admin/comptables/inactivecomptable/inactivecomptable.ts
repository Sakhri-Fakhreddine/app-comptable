import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Alert } from '../../../alert/alert';
import { AdminService } from '../../../../Services/admin.service';

@Component({
  selector: 'app-inactivecomptable',
  imports: [CommonModule, RouterModule,Alert],
  templateUrl: './inactivecomptable.html',
  styleUrl: './inactivecomptable.css'
})
export class Inactivecomptable implements OnInit{
      comptables: any[] = [];
      filteredComptables : any[]=[];
      isLoading: boolean = false;
      errorMessage: string = '';
      alertMessage: string = '';
      alertType: 'success' | 'error' | 'warning' = 'error';
    
      constructor(private adminService: AdminService) {}
    
      ngOnInit(): void {
        this.loadComptables();
      }
    
      loadComptables(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.filteredComptables=[];
        this.adminService.getComptables().subscribe({
          next: (res: any) => {
            this.comptables = Array.isArray(res.data) ? res.data : [];
            //filter comptable based on state 
            this.filteredComptables = this.comptables.filter(
              (comptable) => comptable.etat === 'inactive'
            );
          
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching comptables:', err);
            this.errorMessage = 'Failed to load comptables. Please try again later.';
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
