import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BatchUploadService {
  constructor(private http: HttpClient) {}

  createSession(): Observable<{ sessionId: string; expiresInSeconds: number }> {
    const url = `${environment.apiUrl}/api/session`;
    return this.http.post<{ sessionId: string; expiresInSeconds: number }>(url, {});
  }

  keepAlive(sessionId: string): Observable<any> {
    const url = `${environment.apiUrl}/api/session`;
    return this.http.post(url, {}, { headers: { 'X-Session-ID': sessionId } as any });
  }

  batchUpload(files: File[], sessionId?: string): Observable<HttpEvent<any>> {
    const url = `${environment.apiUrl}/api/batch-upload`;
    const fd = new FormData();
    files.forEach((f) => fd.append('files[]', f));
    const headers: any = {};
    if (sessionId) headers['X-Session-ID'] = sessionId;
    return this.http.post(url, fd, { observe: 'events', reportProgress: true, headers });
  }
}
