import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BatchUploadService } from './batch-upload.service';
import { HttpClientModule, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-batch-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './batch-upload.component.html',
  styleUrls: ['./batch-upload.component.css'],
})
export class BatchUploadComponent implements OnDestroy {
  sessionId?: string;
  files: File[] = [];
  progress = 0;
  results: any[] = [];
  error?: string;
  keepAliveInterval?: any;

  constructor(private svc: BatchUploadService) {}

  createSession() {
    this.error = undefined;
    this.svc.createSession().subscribe({
      next: (resp) => {
        this.sessionId = resp?.sessionId;
        // start keepalive
        this.keepAliveInterval = setInterval(() => this.svc.keepAlive(this.sessionId!).subscribe(), 5 * 60 * 1000);
      },
      error: (e: any) => {
        this.error = `Session creation failed: ${e?.message || e?.statusText || e}`;
      },
    });
  }

  onFilesSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files) return;
    this.files = Array.from(input.files);
  }

  upload() {
    this.error = undefined;
    this.results = [];
    this.progress = 0;
    if (!this.files.length) {
      this.error = 'No files selected';
      return;
    }
    this.svc.batchUpload(this.files, this.sessionId).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round((100 * event.loaded) / (event.total ?? 1));
        } else if (event.type === HttpEventType.Response) {
          this.results = event.body?.files || event.body || [];
        }
      },
      error: (err: any) => {
        // show server error body if available
        if (err?.error) this.error = JSON.stringify(err.error);
        else this.error = err?.message || err?.statusText || 'Upload failed';
      },
    });
  }

  ngOnDestroy() {
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
  }
}
