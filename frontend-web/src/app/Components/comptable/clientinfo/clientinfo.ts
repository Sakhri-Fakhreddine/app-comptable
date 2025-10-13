import { CommonModule ,Location} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Alert } from '../../alert/alert';
import { ComptableService } from '../../../Services/comptable.service';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../Services/admin.service';
declare var bootstrap: any;

@Component({
  selector: 'app-clientinfo',
  standalone: true,
  imports: [CommonModule, RouterModule, Alert,FormsModule],
  templateUrl: './clientinfo.html',
  styleUrl: './clientinfo.css'
})
export class Clientinfo implements OnInit {
  client: any;
  isLoading: boolean = false;
  errorMessage: string = '';
  isAuthenticated: boolean = false;
  clientId!: number;
  accessaccount : boolean = false ;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';
  comptable : any;
  // Email modal
  demandeEmail = {
    recipient: '',
    subject: '',
    message: ''
  };

  constructor(
    private comptaleService: ComptableService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.isAuthenticated = !!localStorage.getItem('token');
      if (this.isAuthenticated) {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
          this.loadClientinfo(id);
        }
      }
    }
  }

  loadClientinfo(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.comptaleService.getClientinfo(id).subscribe({
      next: (res: any) => {
        this.client = res.data || null;
        console.log(this.client);
        this.accessaccount=this.client.compte_daccess;
        console.log(this.accessaccount);
        this.isLoading = false;
        this.clientId = this.client.idClients;
        this.comptaleService.getDeclarationLinesById(this.client.id_comptable).subscribe({
          next : (res : any) => {
            this.comptable = res.data || null ;
            console.log('fetched accountant : ', this.comptable);
          },
          error : (err)=>{
            console.error('error fetching associated comptable',err);
          }
        })
      },
      error: (err) => {
        console.error('Error fetching accountant info:', err);
        this.errorMessage = 'Failed to load accountant info. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  DeleteClient(id: number): void {
    if (!id) return;
  
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.comptaleService.deleteClient(id).subscribe({
        next: (res) => {
          console.log('Client supprimée avec succès', res);
          this.showAlert('Client supprimée avec succès', 'success');
          
          
          this.router.navigate(['/clientslist']);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
          this.showAlert('Erreur lors de la suppression', 'error');
        }
      });
    }
  }
  ClientDeclarations(id: number): void {
    if (!id) return;
    this.router.navigate([`/client/${id}/declarations`]);
  }
  
  // Email modal submit
  sendEmail(emailData: any) {
    if (!this.client?.email) return;
  
    // Set the recipient automatically
    emailData.recipient = this.client.email;
  
    this.comptaleService.sendEmail(emailData).subscribe({
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
