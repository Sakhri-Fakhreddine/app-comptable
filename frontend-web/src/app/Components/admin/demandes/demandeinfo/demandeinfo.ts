import { Component } from '@angular/core';
import { AdminService } from '../../../../Services/admin.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert } from '../../../alert/alert';
declare var bootstrap: any;

@Component({
  selector: 'app-demandeinfo',
  standalone: true,
  imports: [CommonModule, FormsModule,Alert,RouterModule],
  templateUrl: './demandeinfo.html',
  styleUrls: ['./demandeinfo.css']
})
export class Demandeinfo {
  demande: any;
  detailsComptable: any;
  isLoading: boolean = false;
  errorMessage: string = '';
  isAuthenticated: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';

  // Email modal
  demandeEmail = {
    recipient: '',
    subject: '',
    message: ''
  };


  montant: number | null = null;
  currentDemande: any = null;
  comment: string = '';

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = !!localStorage.getItem('token');
    if (this.isAuthenticated) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) this.loadDemandeinfo(id);
    }
  }

  loadDemandeinfo(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getDemandeinfo(id).subscribe({
      next: (res: any) => {
        this.demande = res.data || null;
        this.isLoading = false;

        // Parse details_comptable if it's a string
        this.detailsComptable = typeof this.demande.detailcomptables === 'string'
          ? JSON.parse(this.demande.detailcomptables)
          : this.demande.detailcomptables;
      },
      error: (err) => {
        console.error('Error fetching demande info:', err);
        this.errorMessage = 'Failed to load demande info. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  // Convert object to array for *ngFor
  getDetailsArray(details: any) {
    if (!details) return [];
    const parsed = typeof details === 'string' ? JSON.parse(details) : details;
    return Object.keys(parsed)
      .filter(key => key.toLowerCase() !== 'password')
      .map(key => ({ key, value: parsed[key] }));
  }

  // Email modal submit
  sendEmail(emailData: any) {
    if (!this.detailsComptable?.email) return;
  
    // Set the recipient automatically
    emailData.recipient = this.detailsComptable.email;
  
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

  // Open accept/refuse modal
  openAcceptModal( demande: any) {
    this.currentDemande = demande;
    this.montant= null;
    this.comment = demande.commentaire; 
  }
   // Open accept/refuse modal
   openRefuseModal(demande: any) {
    this.currentDemande = demande;
    this.comment = demande.commentaire; 
  }

    // Submit accept/refuse action
    AcceptDemande() {
      if (!this.currentDemande) return;
  
      const payload = {
        demandeId: this.currentDemande.idDemande,
        montant: this.montant,
        comment: this.comment
      };
  
      console.log('Submitting action:', payload);
      this.adminService.AcceptDemande(payload).subscribe({
          next: (res) => {
            console.log('Demande Accepted successfully :', res);
            this.showAlert('Demande a ete accepte succès !', 'success');
            this.loadDemandeinfo(this.currentDemande.idDemande);
          
          // Close modal manually
          const modalElement = document.getElementById('acceptModal');
          const modal = bootstrap.Modal.getInstance(modalElement!);
          modal?.hide();
        },
          error: (err) => {
            console.error('Failed to accept demand:', err);
            this.showAlert('Erreur lors de l’acceptation de la demande.', 'error');
          }
        });
  
      
    }
    RefuseDemande() {
      if (!this.currentDemande) return;
  
      const payload = {
        demandeId: this.currentDemande.idDemande,
        comment: this.comment
      };
  
      console.log('Submitting action:', payload);

     this.adminService.RefuseDemande(payload).subscribe({
          next: (res) => {
            console.log('Demande Refused successfully :', res);
            this.showAlert('Demande a ete refuse !', 'success');
            this.loadDemandeinfo(this.currentDemande.idDemande);
          
          // Close modal manually
            const modalElement = document.getElementById('refuseModal');
            const modal = bootstrap.Modal.getInstance(modalElement!);
            modal?.hide();
        },
          error: (err) => {
            console.error('Failed to refuse demand:', err);
            this.showAlert('Erreur lors de la refusion de la demande.', 'error');
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
