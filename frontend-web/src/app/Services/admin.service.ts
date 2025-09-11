import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  

   private apiUrl = 'http://localhost:8000/api/admin'; // Laravel API endpoint
  
    constructor(private http: HttpClient) {}
  
    
    getComptableinfo(id:number): Observable<any> {
      const token = localStorage.getItem('token');
      return this.http.get(`${this.apiUrl}/comptableinfo/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    getClientinfo(id:number): Observable<any> {
      const token = localStorage.getItem('token');
      return this.http.get(`${this.apiUrl}/clientinfo/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    updateEtatComptable(id: number, newEtat: 'active' | 'inactive') {
      const token = localStorage.getItem('token');
      return this.http.put(
        `${this.apiUrl}/comptable/${id}/etat`,
        { etat: newEtat },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    getComptables() {
      const token = localStorage.getItem('token');
      return this.http.get(`${this.apiUrl}/comptableslist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    getClients() {
      const token = localStorage.getItem('token');
      return this.http.get(`${this.apiUrl}/clientslist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    getDemandes() {
      const token = localStorage.getItem('token');
      return this.http.get(`${this.apiUrl}/demandeslist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    getDemandeinfo(id:number): Observable<any> {
      const token = localStorage.getItem('token');
      return this.http.get(`${this.apiUrl}/demandeinfo/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    updateEtatDemande(id: number, newEtat: 'acceptee' | 'refusee') {
      const token = localStorage.getItem('token');
      return this.http.put(
        `${this.apiUrl}/demande/${id}/etat`,
        { etat: newEtat },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    sendEmail(emailData: { recipient: string; subject: string; message: string }): Observable<any> {
      return this.http.post(`${this.apiUrl}/send-email`, emailData);
    }
    
    updateDemandeStatus(payload: { demandeId: number, action: 'accept' | 'refuse', comment: string }) {
      return this.http.post(`${this.apiUrl}/update-demande-status`, payload);
    }
    AcceptDemande(payload: any) {
      const token = localStorage.getItem('token');
      return this.http.put(
        `${this.apiUrl}/acceptdemande`, 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    RefuseDemande(payload: any) {
      const token = localStorage.getItem('token');
      return this.http.put(
        `${this.apiUrl}/refusedemande`, 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    getNotifications(): Observable<any[]> {
      const token = localStorage.getItem('token'); 
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.get<any[]>(`${this.apiUrl}/notifications`, { headers });
    }
    
    markAsRead(ids: number[]): Observable<any> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.post(`${this.apiUrl}/notifications/read`, { ids }, { headers });
    }
    getDeclarationsettings(): Observable<any[]> {
      const token = localStorage.getItem('token'); 
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.get<any[]>(`${this.apiUrl}/declarationsettings`, { headers });
    }
    getDeclarationlinesettings(): Observable<any[]> {
      const token = localStorage.getItem('token'); 
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.get<any[]>(`${this.apiUrl}/declarationlinesettings`, { headers });
    }
    getDeclarationLinesById(declarationId: number): Observable<any> {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      return this.http.get<any>(`${this.apiUrl}/declarationlinesettings/${declarationId}`, { headers });
  }
    createDeclarationsetting(data: any): Observable<any> {
      const token = localStorage.getItem('token'); 
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.post<any>(`${this.apiUrl}/declarationsettings`, data, { headers });
    }
    getAssociatedDeclarationsettings(id: number): Observable<any[]> {
      const token = localStorage.getItem('token'); 
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.get<any[]>(`${this.apiUrl}/declarationlinesettings/${id}`, { headers });
    }
    createDeclarationLine(data: any): Observable<any> {
      const token = localStorage.getItem('token'); 
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.post<any>(`${this.apiUrl}/declarationlinesettings`, data, { headers });
    }
    deleteDeclarationLineSetting(id: number) {
      const token = localStorage.getItem('token'); 
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      });
    
      return this.http.delete(`${this.apiUrl}/declarationlinesettings/${id}`, { headers });
    }   
    deleteDeclarationsetting(id: number) {
      const token = localStorage.getItem('token'); 
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      });
    
      return this.http.delete(`${this.apiUrl}/declarationsettings/${id}`, { headers });
    } 
    
    
    
}
