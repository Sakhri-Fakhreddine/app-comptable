import { Component, OnInit } from '@angular/core';
import { ComptableService } from '../../../../Services/comptable.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-declarations',
  imports: [CommonModule, RouterModule],
  templateUrl: './declarations.html',
  styleUrl: './declarations.css'
})
export class Declarations  implements OnInit {
  declarations: any[] = [];
  groupedDeclarations: { [key: string]: any[] } = {};
  isLoading = false;
  errorMessage = '';
  isAuthenticated = false;
  expandedMonths: Set<string> = new Set();

  constructor(private comptableService: ComptableService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.isAuthenticated = !!localStorage.getItem('token');
      if (this.isAuthenticated) this.loadDeclarations();
    }
  }

  loadDeclarations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.comptableService.getDeclarations().subscribe({
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