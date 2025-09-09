import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  private authStatus = new BehaviorSubject<boolean>(this.hasToken());
  authStatus$ = this.authStatus.asObservable();

  constructor(private http: HttpClient) {}

 
  

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        if (typeof window !== 'undefined' && res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.user.usertype);
        this.userSubject.next(res.user);
          this.authStatus.next(true);
        }
      })
    );
  }
  hasToken(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }
  getRole(): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem('role');
    }
    return null;
  }
  
  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }
  
  isComptable(): boolean {
    return this.getRole() === 'comptable';
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }
  getUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  forgotpassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, data);
  }

  resetpassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  logout(): Observable<any> {
    if (typeof window === 'undefined') {
      return new Observable(); // safe fallback for SSR
    }
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => {
        localStorage.removeItem('token');
        this.authStatus.next(false);
      })
    );
  }
}
