import { CommonModule  } from '@angular/common';
import { Component , OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule  } from '@angular/forms';
import { AuthService } from '../../../Services/auth.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  success: string = '';
  error: string = '';

  constructor(private fb: FormBuilder,private authService: AuthService) {}

  ngOnInit(): void {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  onSubmit() {
    if (this.resetForm.invalid) return;
    const email = this.resetForm.value.email;
    console.log('Demande de réinitialisation pour :', email);

    this.authService.forgotpassword(this.resetForm.value).subscribe({
      next: (res) => {
        this.success = 'reset link sent';
        this.error = '';
        console.log(res);
        this.resetForm.reset();
      },
      
      error: (err) => {
        this.error = err.error?.message || 'failed to send reset link.';
        this.success = '';
        console.error(err);
      }
    });
  }

  // onResetPassword(): void {
  //   if (this.resetForm.valid) {
  //     const email = this.resetForm.value.email;
  //     console.log('Demande de réinitialisation pour :', email);
  //     // Call your backend service here
  //   }
  // }
}
