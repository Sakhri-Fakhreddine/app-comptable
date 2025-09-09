import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../../Services/admin.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Alert } from '../../../alert/alert';

@Component({
  selector: 'app-adddeclaration',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    Alert],
  templateUrl: './adddeclaration.html',
  styleUrl: './adddeclaration.css'
})
export class Adddeclaration implements OnInit {
  declarationForm: FormGroup;
  typeMap: { [key: string]: string } = {
    'Paies': 'الأجور',
    'Achats': 'المشتريات',
    'Ventes': 'المبيعات',
    'Salaires': 'الرواتب',
    'Autres': 'أخرى'
  };
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';
  

  constructor(private fb: FormBuilder, private adminService: AdminService ,private router: Router) {
    this.declarationForm = this.fb.group({
      typedeclaration: ['', Validators.required],
      typedeclarationArabe: [''],
      Comptables_idComptable: [null] // can be optional
    });
  }
  ngOnInit(): void {
    this.declarationForm.get('typedeclaration')?.valueChanges.subscribe(value => {
      if (value && this.typeMap[value]) {
        this.declarationForm.patchValue({ typedeclarationArabe: this.typeMap[value] });
      } else {
        this.declarationForm.patchValue({ typedeclarationArabe: '' });
      }
    });
  }

  onSubmit() {
    if (this.declarationForm.invalid) return;
  
    this.adminService.createDeclarationsetting(this.declarationForm.value).subscribe({
      next: (res) => {
        this.declarationForm.reset();
  
        this.router.navigate(['/admin/defaultdeclarationsettings'], {
          state: { alertMessage: 'Paramètres ajoutés avec succès ✅', alertType: 'success' }
        });
      },
      error: (err) => {
        console.error(err);
  
        // ✅ Check backend message properly
        if (err.error?.message === 'Un paramètre par défaut pour ce type de déclaration existe déjà ❌') {
          this.showAlert(err.error.message, 'error');
          this.declarationForm.reset();
        } else {
          this.showAlert('Une erreur est survenue, veuillez réessayer.', 'error');
        }
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
}
