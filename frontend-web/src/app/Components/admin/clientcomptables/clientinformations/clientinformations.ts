import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService } from '../../../../Services/admin.service';

@Component({
  selector: 'app-clientinformations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './clientinformations.html',
  styleUrl: './clientinformations.css'
})
export class Clientinformations implements OnInit {
  client: any;
  comptable:any;
  isLoading: boolean = false;
  errorMessage: string = '';
  isAuthenticated: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';
  

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
          this.loadClientinfo(id);
        }
      }
    }
  }

  loadClientinfo(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getClientinfo(id).subscribe({
      next: (res: any) => {
        this.client = res.data || null;
        this.isLoading = false;
        console.log('fetched client',this.client);
        this.adminService.getComptableinfo(this.client.id_comptable).subscribe({
          next: (res: any) => {
            this.comptable = res.data || null;
            console.log('fetched comptable',this.comptable);
          },
          error: (err) => {
            console.error('Error fetching accountant info:', err);
            this.errorMessage = 'Failed to load accountant info. Please try again later.';
          }
        });
      },
      error: (err) => {
        console.error('Error fetching accountant info:', err);
        this.errorMessage = 'Failed to load accountant info. Please try again later.';
        this.isLoading = false;
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
