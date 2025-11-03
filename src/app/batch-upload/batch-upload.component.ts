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
          const body = event.body || {};
          // sessionId may be returned/renewed by the server
          if (body.sessionId) this.sessionId = body.sessionId;
          // files array contains per-file analysis info
          this.results = body.files || [];
          // If backend indicates files are ready for batch download, show download button
        }
      },
      error: (err: any) => {
        // show server error body if available
        if (err?.error) this.error = JSON.stringify(err.error);
        else this.error = err?.message || err?.statusText || 'Upload failed';
      },
    });
  }

  downloadAll() {
    this.error = undefined;
    if (!this.sessionId) {
      this.error = 'No session available for download';
      return;
    }
    this.svc.getBatchDownload(this.sessionId).subscribe({
      next: (blob) => {
        const filename = `remediated-files.zip`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this.error = `Batch download failed: ${err?.message || err?.statusText || 'error'}`;
      },
    });
  }

  ngOnDestroy() {
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
  }
}
