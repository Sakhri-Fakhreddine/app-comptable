import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../Services/admin.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Alert } from '../../../alert/alert';

@Component({
  selector: 'app-associateddeclarationline',
  imports: [CommonModule, RouterModule, Alert],
  templateUrl: './associateddeclarationline.html',
  styleUrl: './associateddeclarationline.css'
})
export class Associateddeclarationline implements OnInit {
    declarationlinesettings: any[] = [];
    parametre_declaration: any;
    isLoading: boolean = false;
    errorMessage: string = '';
    alertMessage: string = '';
    alertType: 'success' | 'error' | 'warning' = 'success';
    isAuthenticated: boolean = false;

    constructor(
      private adminService: AdminService,
      private router: Router,
      private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.isAuthenticated = !!localStorage.getItem('token');
        if (this.isAuthenticated) {
          const id = Number(this.route.snapshot.paramMap.get('id'));
          if (id) {
            this.loadAssociatedDeclarationSettings(id);
          }
        }
      }
    }

    loadAssociatedDeclarationSettings(id: number): void {
      this.isLoading = true;
      this.errorMessage = '';

      // Fetch declaration setting details
      this.adminService.getDeclarationsettings().subscribe({
        next: (res: any) => {
          this.parametre_declaration = res.find(
            (declaration: any) => declaration.idParamtres_declaration === id
          );
          console.log('Fetched declaration:', this.parametre_declaration);

          // Now fetch associated lines from backend
          this.adminService.getDeclarationLinesById(id).subscribe({
            next: (res: any) => {
              this.declarationlinesettings = res.data || [];
              console.log('Fetched associated lines:', this.declarationlinesettings);
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error fetching declaration lines:', err);
              this.errorMessage = 'Erreur lors du chargement des lignes associées.';
              this.isLoading = false;
            }
          });
        },
        error: (err) => {
          console.error('Error fetching declaration setting:', err);
          this.errorMessage = 'Erreur lors du chargement du paramètre de déclaration.';
          this.isLoading = false;
        }
      });
    }

    showAlert(message: string, type: 'success' | 'error' | 'warning') {
      this.alertMessage = message;
      this.alertType = type;
      setTimeout(() => this.alertMessage = '', 5000);
    }

    closeAlert() {
      this.alertMessage = '';
    }

    AddDeclarationLine() {
      this.router.navigate(['/admin/adddeclarationlinesetting']);
    }

    RemoveDeclarationLineSetting(id: number): void {
      if (!id) return;

      if (confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) {
        this.adminService.deleteDeclarationLineSetting(id).subscribe({
          next: () => {
            this.showAlert('Paramètre Ligne supprimé avec succès', 'success');
            const declarationId = Number(this.route.snapshot.paramMap.get('id'));
            if (declarationId) this.loadAssociatedDeclarationSettings(declarationId);
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
            this.showAlert('Erreur lors de la suppression', 'error');
          }
        });
      }
    }
}
