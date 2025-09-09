import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(public authService: AuthService) {
    console.log(this.authService.hasToken());
    console.log(this.authService.isAdmin());
    console.log(this.authService.getRole());
  }
  title = 'frontend-web';
}
