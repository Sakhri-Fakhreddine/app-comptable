import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { AdminService } from '../../../../Services/admin.service';

@Component({
  selector: 'app-comptableslist',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatBadgeModule,
    MatButtonModule
  ],
  templateUrl: './comptableslist.component.html',
  styleUrls: ['./comptableslist.component.css']
})
export class ComptableslistComponent {
  comptables: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadComptables();
  }

  loadComptables(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.getComptables().subscribe({
      next: (res: any) => {
        this.comptables = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching comptables:', err);
        this.errorMessage = 'Failed to load comptables. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}