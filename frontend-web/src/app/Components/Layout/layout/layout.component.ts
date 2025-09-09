import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  isComptable: boolean = false;
  isClient: boolean = false;
  
  constructor(private authService: AuthService, private router: Router){}

  ngOnInit(): void {
  
    const userType = localStorage.getItem('role'); 
    this.isComptable = userType === 'comptable';
    this.isClient= userType === 'client';
    console.log(this.isClient,this.isComptable);
  }
}
