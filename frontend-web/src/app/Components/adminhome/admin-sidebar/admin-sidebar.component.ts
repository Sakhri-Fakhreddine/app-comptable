import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterModule],
  
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminSidebarComponent {

    constructor( private router: Router) {}
}
