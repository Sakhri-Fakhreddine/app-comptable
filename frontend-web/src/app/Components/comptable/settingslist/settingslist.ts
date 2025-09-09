import { Component, OnInit } from '@angular/core';
import { ComptableService } from '../../../Services/comptable.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';

interface DeclarationLine {
  Paramtres_declaration_idParamtres_declaration: number;
  rang: number;
  libellee: string;
  libelleeArabe: string;
  compte_comptable?: string;
  debit_credit: string;
}

interface DeclarationSetting {
  idParamtres_declaration: number;
  typedeclaration: string;
  typedeclarationArabe: string;
  Comptables_idComptable?: number;
  lines?: DeclarationLine[];
}

@Component({
  selector: 'app-settingslist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settingslist.html',
  styleUrls: ['./settingslist.css'],
})
export class Settingslist implements OnInit {
  declarationsettings: DeclarationSetting[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';

  constructor(private comptableService: ComptableService, private router: Router) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  /**
   * Loads all declaration settings along with their associated lines
   */
  loadSettings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.comptableService.getDeclarationsettings().subscribe({
      next: (declarations: DeclarationSetting[]) => {
        if (!declarations.length) {
          this.declarationsettings = [];
          this.isLoading = false;
          return;
        }

        // Fetch lines for each declaration
        const requests = declarations.map(declaration =>
          this.comptableService.getDeclarationLinesById(declaration.idParamtres_declaration)
        );

        forkJoin(requests).subscribe({
          next: (results: any[]) => {
            this.declarationsettings = declarations.map((declaration, index) => {
              const allLines: DeclarationLine[] = results[index].data || [];

              // Filter and sort lines by 'rang'
              const lines: DeclarationLine[] = allLines
                .filter((line: DeclarationLine) =>
                  line.Paramtres_declaration_idParamtres_declaration === declaration.idParamtres_declaration
                )
                .sort((a: DeclarationLine, b: DeclarationLine) => a.rang - b.rang);

              return { ...declaration, lines };
            });
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching declaration lines:', err);
            this.errorMessage = 'Failed to load declaration lines. Please try again later.';
            this.isLoading = false;
          },
        });
      },
      error: (err) => {
        console.error('Error fetching declarations:', err);
        this.errorMessage = 'Failed to load declaration settings. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  updateDeclaration(id: number): void {
    console.log('Update declaration with ID:', id);
    this.router.navigate(['/addsettings', id]);
  }
}
