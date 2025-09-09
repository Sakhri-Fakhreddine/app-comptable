import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../../Services/admin.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Alert } from '../../../alert/alert';

@Component({
  selector: 'app-adddeclarationline',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    Alert
  ],
  templateUrl: './adddeclarationline.html',
  styleUrl: './adddeclarationline.css'
})
export class Adddeclarationline implements OnInit {
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' = 'success';

  declarationLineForm!: FormGroup; // will be initialized in ngOnInit

  // enum for libellée translations
  libelleMap: { [key: string]: string } = {
    'Total': 'المجموع',
    'TVA': 'الضريبة على القيمة المضافة',
    'Retenue': 'الإحتفاظ',
    'Net à payer': 'الصافي للدفع',
    'Avance': 'السلفة'
  };

  declarationTypes: string[] = ['Paies', 'Achats', 'Ventes', 'Salaires', 'Autres'];
  debitCreditOptions: string[] = ['Débit', 'Crédit'];

  // all declaration settings loaded from backend
  declarationsettings: any[] = [];
  parametre_declaration: any;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // initialize form here (after fb is injected)
    this.declarationLineForm = this.fb.group({
      libellee: ['', Validators.required],
      libelleeArabe: [{ value: '', disabled: true }, Validators.required],
      debit_credit: ['', Validators.required],
      Paramtres_declaration_idParamtres_declaration: ['', Validators.required],
      rang: ['', Validators.required],
      declarationType: ['', Validators.required] // extra field to choose type
    });

    // preload declaration settings once
    this.adminService.getDeclarationsettings().subscribe({
      next: (res: any) => {
        this.declarationsettings = res || [];
      },
      error: () => {
        this.showAlert('Erreur lors du chargement des paramètres.', 'error');
      }
    });
  }

  // Auto-fill Arabic label when French libellée changes
  onLibelleeChange(event: any) {
    const selected = event.target.value;
    const translated = this.libelleMap[selected] || '';
    this.declarationLineForm.patchValue({ libelleeArabe: translated });
  }

  // Fetch Paramtres_declaration ID based on selected type
  onDeclarationTypeChange(event: any) {
    const selectedType = event.target.value;
    this.parametre_declaration = this.declarationsettings.find(
      (setting) => setting.typedeclaration === selectedType
    );

    if (this.parametre_declaration && this.parametre_declaration.idParamtres_declaration) {
      this.declarationLineForm.patchValue({
        Paramtres_declaration_idParamtres_declaration: this.parametre_declaration.idParamtres_declaration
      });
    } else {
      this.declarationLineForm.patchValue({
        Paramtres_declaration_idParamtres_declaration: ''
      });
      this.showAlert('Aucun paramètre trouvé pour ce type de déclaration.', 'warning');
    }
  }

  // Submit form
  onSubmit() {
    if (this.declarationLineForm.invalid) {
      this.showAlert('Veuillez remplir tous les champs obligatoires.', 'warning');
      return;
    }

    const formValue = {
      ...this.declarationLineForm.getRawValue() // includes disabled fields like libelleeArabe
    };
     // 🔹 Log the payload to the console
  console.log('Sending to backend:', formValue);


    this.adminService.createDeclarationLine(formValue).subscribe({
      next: () => {
        this.showAlert('Ligne de déclaration créée avec succès ✅', 'success');
        this.router.navigate(['/admin/defaultlinesettings']);
      },
      error: () => {
        this.showAlert('Erreur lors de la création de la ligne ❌', 'error');
      }
    });
  }

  showAlert(message: string, type: 'success' | 'error' | 'warning') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }

  closeAlert() {
    this.alertMessage = '';
  }
}
