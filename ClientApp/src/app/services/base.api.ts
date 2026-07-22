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
    return this.http.get<T>(this.getUrl(url), httpOptions);
  }

  post<T>(url: string, params: any, contentType='application/json') {
    let headers = new HttpHeaders();
    
    if (!(params instanceof FormData)) {
      headers = headers.set('Content-Type', contentType);
    }

    if (this.authentication.IsUserLogin()) {
      headers = headers.set(
        'Authorization',
        'Bearer ' + this.authentication.GetToken()
      );
    }
    return this.http.post<T>(this.getUrl(url), params, {headers:headers});
  }

  put<T>(url: string, params: any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    if (this.authentication.IsUserLogin()) {
      headers = headers.set(
        'Authorization',
        'Bearer ' + this.authentication.GetToken()
      );
    }
    return this.http.put<T>(this.getUrl(url), params, {headers:headers});
  }

  delete<T>(url: string) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    if (this.authentication.IsUserLogin()) {
      headers = headers.set(
        'Authorization',
        'Bearer ' + this.authentication.GetToken()
      );
    }
    return this.http.delete<T>(this.getUrl(url), {headers:headers});
  }

  getBlob(url: string) {
    let headers = new HttpHeaders();
    if (this.authentication.IsUserLogin()) {
      headers = headers.set('Authorization', 'Bearer ' + this.authentication.GetToken());
    }

    return this.http.get(this.getUrl(url), { headers, responseType: 'blob' });
  }

  private getUrl(url: string): string {
    return url.startsWith('/api/') ? url : `${this.baseUrl}${url}`;
  }
}
