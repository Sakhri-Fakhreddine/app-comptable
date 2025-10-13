import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ComptableService {

  private apiUrl = 'http://localhost:8000/api'; // Laravel API endpoint

  constructor(private http: HttpClient) {}

  getClients() {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrl}/clientslist`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getClientinfo(id:number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrl}/clientinfo/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  deleteClient(id: number) {
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    return this.http.delete(`${this.apiUrl}/client/${id}`, { headers });
  }

  getDeclarationsettings(): Observable<any[]> {
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<any[]>(`${this.apiUrl}/declarationsettings`, { headers });
  }
  
  getDeclarationlinesettings(): Observable<{ data: any[] }> {
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/declarationlinesettings`, { headers });
  }
  
  getDeclarationLinesById(declarationId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<any>(`${this.apiUrl}/declarationlinesettings/${declarationId}`, { headers });
}

updateDeclarationSettings(id: number, data: any): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  return this.http.put(`${this.apiUrl}/declarationsettings/${id}`, data, { headers });
}

createDeclarationSettings(data: any): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  return this.http.post(`${this.apiUrl}/declarationsettings`, data, { headers });
}

getDeclarationSettingsById(id: number): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  return this.http.get(`${this.apiUrl}/declarationsettings/${id}`, { headers });
}

getComptableById(id: number, data: any): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  return this.http.put(`${this.apiUrl}/comptable/${id}`, data, { headers });
}
sendEmail(emailData: { recipient: string; subject: string; message: string }): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  return this.http.post(`${this.apiUrl}/send-email`, emailData, { headers });
}

getDeclarations() {
  const token = localStorage.getItem('token');
  return this.http.get(`${this.apiUrl}/declarations`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
getDeclaration(id: number) {
  const token = localStorage.getItem('token');
  return this.http.get(`${this.apiUrl}/declarations/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

updateDeclaration(id: number, data: any) {
  const token = localStorage.getItem('token');
  return this.http.put(`${this.apiUrl}/declarations/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

}