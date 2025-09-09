import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule, RouterModule],
})
export class HeaderComponent implements OnInit {
  isAuthenticated: boolean = false;
  isAdmin: boolean = false;
  userType: string | null = null;
  userName: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Subscribe to authentication status changes
    this.authService.authStatus$.subscribe(status => {
    this.isAuthenticated = status;
    this.isAdmin = this.authService.isAdmin();
    });

    // Subscribe to user info changes
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userType = user.usertype;
        this.userName = user.Nomprenom || user.name || 'Utilisateur';
        this.isAdmin = this.userType === 'admin';
      } else {
        this.userType = null;
        this.userName = '';
        this.isAdmin = false;
      }
    });

    // Optional: fetch user info if already logged in
    if (this.authService.isLoggedIn()) {
      this.authService.getUser().subscribe({
        next: (user) => {
          this.userType = user?.usertype;
          this.userName = user?.Nomprenom || user?.name || 'Utilisateur';
          this.isAdmin = this.userType === 'admin';
          this.isAuthenticated = true;
        },
        error: (err) => console.error('Failed to load user profile', err)
      });
    }
  }

  getHomeLink(): string {
    if (!this.isAuthenticated) return '/';
    if (this.userType === 'comptable') return '/comptablehome';
    if (this.userType === 'client') return '/clienthome';
    return '/';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.isAuthenticated = false;
        this.isAdmin = false;
        this.userType = null;
        this.userName = '';
        this.router.navigate(['/login']);
      },
      error: (err) => console.error('Logout failed', err)
    });
  }
}
