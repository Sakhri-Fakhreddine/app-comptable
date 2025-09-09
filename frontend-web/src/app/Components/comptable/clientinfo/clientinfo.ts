import { CommonModule ,Location} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Alert } from '../../alert/alert';
import { ComptableService } from '../../../Services/comptable.service';

@Component({
  selector: 'app-clientinfo',
  standalone: true,
  imports: [CommonModule, RouterModule, Alert],
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
