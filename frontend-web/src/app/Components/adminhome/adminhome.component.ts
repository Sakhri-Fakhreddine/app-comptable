import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth.service';
import { AdminFooterComponent } from './admin-footer/admin-footer.component';
import { AdminNavbarComponent } from './admin-navbar/admin-navbar.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminBodyComponent } from './admin-body/admin-body.component';

@Component({
  selector: 'app-adminhome',
  imports: [CommonModule, RouterModule,AdminFooterComponent,AdminNavbarComponent,AdminSidebarComponent],
  templateUrl: './adminhome.component.html',
  styleUrl: './adminhome.component.css'
  
})
export class AdminhomeComponent {
  
}
