import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ComptableService } from '../../../../Services/comptable.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editdeclaration',
  imports: [CommonModule, RouterModule,ReactiveFormsModule ],
  templateUrl: './editdeclaration.html',
  styleUrl: './editdeclaration.css'
})
export class Editdeclaration implements OnInit {
  declarationForm!: FormGroup;
  declarationId!: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private comptableService: ComptableService
  ) {}

  ngOnInit(): void {
    this.declarationId = +this.route.snapshot.paramMap.get('id')!;
    this.createForm();
    this.loadDeclaration();
  }

  // --- Form Initialization ---
  createForm() {
    this.declarationForm = this.fb.group({
      typedeclaration: ['', Validators.required],
      anneemois: ['', Validators.required],
      etat_declaration: ['', Validators.required],
      lines: this.fb.array([])
    });
  }

  // --- Get lines FormArray ---
  get lines(): FormArray {
    return this.declarationForm.get('lines') as FormArray;
  }

  // --- Get values FormArray for a specific line ---
  getValues(lineIndex: number): FormArray {
    return this.lines.at(lineIndex).get('values') as FormArray;
  }

  // --- Add a line to FormArray ---
  addLine(line: any) {
    const valuesArray = this.fb.array(
      line.values.map((v: any) =>
        this.fb.group({
          param_id: [v.param_id],
          valeur: [v.valeur, Validators.required]
        })
      )
    );

    this.lines.push(
      this.fb.group({
        id: [line.id],
        libelle: [line.libelle, Validators.required],
        values: valuesArray
      })
    );
  }

  // --- Load declaration from backend ---
  loadDeclaration() {
    this.isLoading = true;
    this.comptableService.getDeclaration(this.declarationId).subscribe({
      next: (res: any) => {
        const dec = res.declaration;
        this.declarationForm.patchValue({
          typedeclaration: dec.typedeclaration,
          anneemois: dec.anneemois,
          etat_declaration: dec.etat_declaration
        });

        dec.lines.forEach((line: any) => this.addLine(line));
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Impossible de charger la déclaration.';
        this.isLoading = false;
      }
    });
  }

  // --- Save updated declaration ---
  saveDeclaration() {
    if (this.declarationForm.invalid) return;

    this.comptableService.updateDeclaration(this.declarationId, this.declarationForm.value).subscribe({
      next: () => {
        alert('Déclaration mise à jour avec succès !');
        this.router.navigate(['/declarations']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors de la mise à jour.';
      }
    });
  }

  printDeclaration() {
    const printContents = document.querySelector('.card-body')?.innerHTML;
    if (printContents) {
      const popup = window.open('', '_blank', 'width=900,height=600');
      popup?.document.write(`
        <html>
          <head>
            <title>Imprimer la déclaration #${this.declarationId}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
      popup?.document.close();
      popup?.focus();
      popup?.print();
      popup?.close();
    }
  }
  
}