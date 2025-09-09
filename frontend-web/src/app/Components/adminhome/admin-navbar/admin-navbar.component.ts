import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { AuthService } from '../../../Services/auth.service';
import { Router } from '@angular/router';
import { AdminService } from '../../../Services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminNavbarComponent implements OnInit {
  isAuthenticated: boolean = false;
  isAdmin: boolean = false;
  userType: string | null = null;
  userName: string = '';
  unreadNotifications: any[] = [];
  constructor(private authService: AuthService, private router: Router, private adminservice : AdminService) {}
  
  ngOnInit(): void {
    // Subscribe to authentication status changes
    this.authService.authStatus$.subscribe(status => {
      this.isAuthenticated = status;
      this.isAdmin = this.authService.isAdmin();
      this.loadNotifications();
      // setInterval(() => this.loadNotifications(), 10000); // every 10 sec
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

  loadNotifications() {
    this.adminservice.getNotifications().subscribe({
      next: (data) => {
        console.log('Fetched notifications:', data); // <-- log all notifications
        this.unreadNotifications = data;
      },
      error: (err) => console.error('Failed to load notifications', err)
    });
  }
  
  markAsSeen(notification: any, event: Event) {
    event.preventDefault(); // prevents page reload
  
    console.log('Marking as seen:', notification); // <-- add log to check
  
    this.adminservice.markAsRead([notification.idnotifications]).subscribe({
      next: () => {
        notification.etat_notification = 'vu';
        this.unreadNotifications = this.unreadNotifications.filter(n => n.etat_notification === 'unread');
        console.log('Updated unread notifications:', this.unreadNotifications);
      },
      error: (err) => console.error('Failed to mark notification as seen', err)
    });
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
