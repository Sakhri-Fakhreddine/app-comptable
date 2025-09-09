import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../Services/admin.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Alert } from '../../../alert/alert';

@Component({
  selector: 'app-declarationline',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Alert
  ],
  templateUrl: './declarationline.html',
  styleUrl: './declarationline.css'
})
export class Declarationline implements OnInit {

      declarationlinesettings: any[] = [];
      isLoading: boolean = false;
      errorMessage: string = '';
      alertMessage: string = '';
      alertType: 'success' | 'error' | 'warning' = 'success';
      
    
      constructor(private adminService: AdminService , private router: Router) {}
    
      ngOnInit(): void {
        this.loadDeclarationlinesettings();
      }
    
      loadDeclarationlinesettings(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.adminService.getDeclarationlinesettings().subscribe({
          next: (res: any) => {
            this.declarationlinesettings = res.data || [];
            console.log('fetched line setingd ',this.declarationlinesettings);
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching declaration default settings:', err);
            this.errorMessage = 'Failed to load declaration default settings. Please try again later.';
            this.isLoading = false;
          }
        });
      }

      AddDeclarationLine() {
        this.router.navigate(['/admin/adddeclarationlinesetting']);
      }

      RemoveDeclarationLineSetting(id: number): void {
        if (!id) return;
      
        if (confirm('Êtes-vous sûr de vouloir supprimer cette declaration ?')) {
          this.adminService.deleteDeclarationLineSetting(id).subscribe({
            next: (res) => {
              console.log('Parametres Ligne supprimée avec succès', res);
              this.showAlert('Parametres Ligne supprimée avec succès', 'success');
      
              this.loadDeclarationlinesettings();
            },
            error: (err) => {
              console.error('Erreur lors de la suppression', err);
              this.showAlert('Erreur lors de la suppression', 'error');
            }
          });
        }
      }
  

      showAlert(message: string, type: 'success' | 'error' | 'warning') {
        this.alertMessage = message;
        this.alertType = type;
        setTimeout(() => {
          this.alertMessage = '';
        }, 5000); // Auto-dismiss after 5 seconds
      }
    
      closeAlert() {
        this.alertMessage = '';
      }
  
}
