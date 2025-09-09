import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComptableService } from '../../../Services/comptable.service';
import { Alert } from '../../alert/alert';

@Component({
  selector: 'app-addsettings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Alert],
  templateUrl: './addsettings.component.html',
  styleUrls: ['./addsettings.component.css']
})
export class AddsettingsComponent implements OnInit {

  declarationForm!: FormGroup;
  declarationId!: number;
  isLoading: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';

  libelleMap: { [key: string]: string } = {
    'Total': 'المجموع',
    'TVA': 'الضريبة على القيمة المضافة',
    'Retenue': 'الإحتفاظ',
    'Net à payer': 'الصافي للدفع',
    'Avance': 'السلفة'
  };
  libelleKeys: string[] = [];

  constructor(
    private fb: FormBuilder,
    private comptableService: ComptableService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.libelleKeys = Object.keys(this.libelleMap);
  }

  ngOnInit(): void {
    this.declarationId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    console.log('Declaration ID:', this.declarationId);

    if (this.declarationId) {
      this.loadDeclaration(this.declarationId);
    }
  }

  initForm() {
    this.declarationForm = this.fb.group({
      typedeclaration: [{ value: '', disabled: true }, Validators.required],
      typedeclarationArabe: [{ value: '', disabled: true }],
      Comptables_idComptable: [null],
      lines: this.fb.array([])
    });
  }

  get lines(): FormArray {
    return this.declarationForm.get('lines') as FormArray;
  }

  loadDeclaration(id: number) {
    this.isLoading = true;
    this.comptableService.getDeclarationSettingsById(id).subscribe({
      next: (res: any) => {
        const declaration = res.data;
        console.log('Declaration from API:', declaration);

        // Patch readonly fields
        this.declarationForm.patchValue({
          typedeclaration: declaration.typedeclaration,
          typedeclarationArabe: declaration.typedeclarationArabe,
          Comptables_idComptable: declaration.Comptables_idComptable ?? null
        });

        // Populate lines
        if (declaration.lignes && declaration.lignes.length) {
          const sortedLines = [...declaration.lignes].sort((a, b) => (a.rang ?? 0) - (b.rang ?? 0));
          sortedLines.forEach((line: any) => {
            const arabicLabel = this.libelleMap[line.libellee] || '';
            this.lines.push(this.fb.group({
              id: [line.idlignes_parametres_decalarations],
              libellee: [line.libellee, Validators.required],
              libelleeArabe: [{ value: arabicLabel, disabled: true }, Validators.required],
              compte_comptable: [line.compte_comptable],
              debit_credit: [line.debit_credit], // keep as is: 'Débit' or 'Crédit'
              rang: [line.rang, Validators.required]
            }));
          });                    
        }

        console.log('Lines added to form:', this.declarationForm.get('lines')?.value);
        console.log('Form after patching:', this.declarationForm.value);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading declaration:', err);
        this.alertMessage = 'Failed to load declaration';
        this.alertType = 'error';
        this.isLoading = false;
      }
    });
  }

  addLine() {
    this.lines.push(this.fb.group({
      id: [null],
      libellee: ['', Validators.required],
      libelleeArabe: [{ value: '', disabled: true }, Validators.required],
      compte_comptable: [''],
      debit_credit: ['Débit', Validators.required],
      rang: [this.lines.length + 1, Validators.required]
    }));
  
    // re-sort FormArray by rang
    const sorted = this.lines.controls.sort((a, b) =>
      (a.get('rang')?.value ?? 0) - (b.get('rang')?.value ?? 0)
    );
    this.declarationForm.setControl('lines', this.fb.array(sorted));
  }
  

  removeLine(index: number) {
    this.lines.removeAt(index);
  }

  onLibelleChange(index: number) {
    const control = this.lines.at(index);
    const libelleValue = control.get('libellee')?.value;
    const arabicLabel = this.libelleMap[libelleValue] || '';
    console.log('Libelle changed:', libelleValue, '=> Arabic:', arabicLabel);
    control.get('libelleeArabe')?.setValue(arabicLabel);
  }

  submitForm() {
    if (this.declarationForm.invalid) return;
    

    const declarationData = this.declarationForm.getRawValue();
    // ✅ Ensure Comptable id is integer or null
    if (declarationData.Comptables_idComptable === '') {
      declarationData.Comptables_idComptable = null;
    }

    // ✅ Normalize debit_credit
    declarationData.lines = declarationData.lines.map((line: any) => ({
      ...line,
      debit_credit:
        line.debit_credit?.toLowerCase().includes('debit') ? 'Débit' :
        line.debit_credit?.toLowerCase().includes('credit') ? 'Crédit' :
        line.debit_credit
    }));

    console.log('Submitting declaration:', declarationData);

    if (!declarationData.Comptables_idComptable) {
      this.comptableService.createDeclarationSettings(declarationData).subscribe({
        next: () => {
          this.showAlert('New declaration created successfully', 'success');
          console.log('Created new declaration successfully');
          this.router.navigate(['/settingslist']);
        },
        error: (err) => {
          console.error('Error creating declaration:', err);
          this.showAlert('Failed to create new declaration', 'error');
        }
      });
    } else {
      this.comptableService.updateDeclarationSettings(this.declarationId, declarationData).subscribe({
        next: () => {
          this.showAlert('Parametres de Declaration sont mises a jour', 'success');
          console.log('Updated declaration successfully');
          this.router.navigate(['/settingslist']);
        },
        error: (err) => {
          console.error('Erreur lors de la mis a jour:', err);
          this.showAlert('Erreur lors de la mis a jour:', 'error');
        }
      });
    }
  }

  showAlert(message: string, type: 'success' | 'error' | 'warning') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => this.alertMessage = '', 5000);
  }

  closeAlert() {
    this.alertMessage = '';
  }
}
