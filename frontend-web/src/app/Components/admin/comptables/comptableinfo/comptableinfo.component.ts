import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService } from '../../../../Services/admin.service';
import { Alert } from '../../../alert/alert';
import { FormsModule } from '@angular/forms';
declare var bootstrap: any;



@Component({
  selector: 'app-comptableinfo',
  standalone: true,
  imports: [CommonModule, RouterModule, Alert,FormsModule],
  templateUrl: './comptableinfo.component.html',
  styleUrls: ['./comptableinfo.component.css']
})
export class ComptableinfoComponent implements OnInit {
  comptable: any;
  isLoading: boolean = false;
  errorMessage: string = '';
  isAuthenticated: boolean = false;
  etat_comptable: string = '';
  comptableId!: number;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';
  // Email modal
  demandeEmail = {
    recipient: '',
    subject: '',
    message: ''
  };

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.isAuthenticated = !!localStorage.getItem('token');
      if (this.isAuthenticated) {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
          this.loadComptableinfo(id);
        }
      }
    }
  }

  loadComptableinfo(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getComptableinfo(id).subscribe({
      next: (res: any) => {
        this.comptable = res.data || null;
        this.isLoading = false;
        this.etat_comptable = this.comptable.etat;
        this.comptableId = this.comptable.idComptable;
      },
      error: (err) => {
        console.error('Error fetching accountant info:', err);
        this.errorMessage = 'Failed to load accountant info. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  changeEtat(newEtat: 'active' | 'inactive') {
    this.adminService.updateEtatComptable(this.comptableId, newEtat).subscribe({
      next: (res) => {
        this.etat_comptable = newEtat;
        console.log('Etat updated successfully');
        this.showAlert(
          `Le compte a été ${newEtat === 'active' ? 'activé' : 'désactivé'} avec succès !`,
          'success'
        );
      },
      error: (err) => {
        console.error('Failed to update etat:', err);
        this.showAlert('Une erreur est survenue, veuillez réessayer.', 'error');
      }
    });
  }
  
  // Email modal submit
  sendEmail(emailData: any) {
    if (!this.comptable?.email) return;
  
    // Set the recipient automatically
    emailData.recipient = this.comptable.email;
  
    this.adminService.sendEmail(emailData).subscribe({
      next: (res) => {
        console.log('Email sent successfully:', res);
        this.showAlert('Email envoyé avec succès !', 'success');
        // Close the modal manually
        const modalElement = document.getElementById('emailModal');
        const modal = bootstrap.Modal.getInstance(modalElement!);
        modal?.hide();
      },
      error: (err) => {
        console.error('Failed to send email:', err);
        this.showAlert('Erreur lors de l’envoi de l’email.', 'error');
      }
    });
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

  goBack() {
    this.location.back();
  }
}