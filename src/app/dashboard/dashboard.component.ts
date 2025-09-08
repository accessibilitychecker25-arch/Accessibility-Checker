import { Component } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpEvent,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FileUploadComponent, HttpClientModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  downloadUrl: string | null = null;
  downloadName: string | null = null;
  isUploading = false;
  progress = 0;

  constructor(private http: HttpClient) {}

  handleFile(file: File) {
    console.log('Uploading file:', file);

    const formData = new FormData();
    formData.append('file', file);

    // Reset state
    this.downloadUrl = null;
    this.downloadName = null;
    this.isUploading = true;
    this.progress = 0;

    this.http
      .post('http://localhost:3000/upload-pdf', formData, {
        responseType: 'blob', // backend returns blob (json/zip/etc.)
        observe: 'events',
        reportProgress: true,
      })
      .subscribe({
        next: (event: HttpEvent<Blob>) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progress = Math.round(
              (100 * event.loaded) / (event.total ?? 1),
            );
          } else if (event.type === HttpEventType.Response) {
            const res = event as HttpResponse<Blob>;
            const blob = res.body ?? new Blob();
            const contentType =
              blob.type || res.headers.get('Content-Type') || '';
            const filename =
              this.getFilename(res.headers.get('Content-Disposition')) ||
              (contentType.includes('zip')
                ? 'autotag-results.zip'
                : 'autotag-results.json');

            this.downloadUrl = window.URL.createObjectURL(blob);
            this.downloadName = filename;

            console.log('File ready for download:', filename);
            this.isUploading = false;
          }
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.isUploading = false;
        },
      });
  }

  private getFilename(cd: string | null): string | null {
    if (!cd) return null;
    const match = /filename="?([^"]+)"?/.exec(cd);
    return match?.[1] ?? null;
  }
}
