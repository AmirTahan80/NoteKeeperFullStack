import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseSettings } from '../environmets/ApiSettings';
import { AuthenticationModel } from '../environmets/AuthenticationModel';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiSetting = new ApiBaseSettings();
  baseUrl = this.apiSetting.baseUrl;

  constructor(private http: HttpClient, private authentication:AuthenticationModel) { }

  get<T>(url: string, params?: any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    if (this.authentication.IsUserLogin()) {
      headers = headers.set(
        'Authorization',
        'Bearer ' + this.authentication.GetToken()
      );
    }
    
    const httpOptions = {
      params,
      headers: headers
    };
    return this.http.get<T>(`${this.baseUrl}${url}`, httpOptions);
  }

  post<T>(url: string, params: any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    if (this.authentication.IsUserLogin()) {
      headers = headers.set(
        'Authorization',
        'Bearer ' + this.authentication.GetToken()
      );
    }
    return this.http.post<T>(`${this.baseUrl}${url}`, params, {headers:headers});
  }

  put<T>(url: string, params: any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    if (this.authentication.IsUserLogin()) {
      headers = headers.set(
        'Authorization',
        'Bearer ' + this.authentication.GetToken()
      );
    }
    return this.http.put<T>(`${this.baseUrl}${url}`, params);
  }

  delete<T>(url: string) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    if (this.authentication.IsUserLogin()) {
      headers = headers.set(
        'Authorization',
        'Bearer ' + this.authentication.GetToken()
      );
    }
    return this.http.delete<T>(`${this.baseUrl}${url}`, {headers:headers});
  }
}