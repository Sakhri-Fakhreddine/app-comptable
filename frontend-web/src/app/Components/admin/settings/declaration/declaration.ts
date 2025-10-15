import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../Services/admin.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Alert } from '../../../alert/alert';


@Component({
  selector: 'app-declaration',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Alert
  ],
  templateUrl: './declaration.html',
  styleUrl: './declaration.css'
})
export class Declaration implements OnInit{
    declarationsettings: any[] = [];
    isLoading: boolean = false;
    errorMessage: string = '';
    alertMessage: string = '';
    alertType: 'success' | 'error' | 'warning' = 'success';
  
    constructor(private adminService: AdminService , private router: Router) {}
  
    ngOnInit(): void {
        // Use history.state instead of router.getCurrentNavigation()
      const state = history.state as any;
      if (state.alertMessage && state.alertType) {
        this.showAlert(state.alertMessage, state.alertType);
      }

      this.loadDeclarationsettings();
    }
  
    loadDeclarationsettings(): void {
      this.isLoading = true;
      this.errorMessage = '';
    
      this.adminService.getDeclarationsettings().subscribe({
        next: (res: any) => {
          // Keep only default settings (Comptables_idComptable is null)
          this.declarationsettings = (res || []).filter(
            (setting: any) => setting.Comptables_idComptable === null
          );
    
          console.log('Default declarations:', this.declarationsettings);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching declaration default settings:', err);
          this.errorMessage = 'Failed to load declaration default settings. Please try again later.';
          this.isLoading = false;
        }
      });
    }
    

    AddDeclaration() {
      this.router.navigate(['/admin/adddeclarationsetting']);
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

    RemoveDeclarationsetting(id: number): void {
      if (!id) return;
    
      if (confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) {
        this.adminService.deleteDeclarationsetting(id).subscribe({
          next: (res) => {
            console.log('parametres declaration supprimée avec succès', res);
            this.showAlert('parametres declaration supprimée avec succès', 'success');
    
            this.loadDeclarationsettings();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
            this.showAlert('Erreur lors de la suppression', 'error');
          }
        });
      }
    }

}
