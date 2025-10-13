import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComptableService } from '../../../../Services/comptable.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-clientsdeclarations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './clientsdeclarations.html',
  styleUrls: ['./clientsdeclarations.css']
})
export class Clientsdeclarations implements OnInit {
  declarations: any[] = [];
  groupedDeclarations: { [key: string]: any[] } = {};
  isLoading = false;
  errorMessage = '';
  isAuthenticated = false;
  expandedMonths: Set<string> = new Set();
  clientId!: number;

  constructor(
    private comptableService: ComptableService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.isAuthenticated = !!localStorage.getItem('token');
      if (this.isAuthenticated) {
        // Get client ID from route parameter
        this.clientId = Number(this.route.snapshot.paramMap.get('id'));
        this.loadDeclarations();
      }
    }
  }

  loadDeclarations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.comptableService.getDeclarationsByClientId(this.clientId).subscribe({
      next: (res: any) => {
        this.declarations = res.data || [];
        this.groupDeclarationsByMonth();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching declarations:', err);
        this.errorMessage = 'Failed to load declarations. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  private groupDeclarationsByMonth(): void {
    this.groupedDeclarations = {};
    for (const dec of this.declarations) {
      const month = dec.anneemois || 'Non spécifié';
      if (!this.groupedDeclarations[month]) this.groupedDeclarations[month] = [];
      this.groupedDeclarations[month].push(dec);
    }
  }

  toggleMonth(month: string): void {
    if (this.expandedMonths.has(month)) {
      this.expandedMonths.delete(month);
    } else {
      this.expandedMonths.add(month);
    }
  }

  isMonthExpanded(month: string): boolean {
    return this.expandedMonths.has(month);
  }
}
