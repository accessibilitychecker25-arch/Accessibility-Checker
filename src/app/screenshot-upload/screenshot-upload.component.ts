import { Component, EventEmitter, Output } from '@angular/core';
import { createWorker } from 'tesseract.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-screenshot-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './screenshot-upload.component.html'
})
export class ScreenshotUploadComponent {
  @Output() scannedText = new EventEmitter<string>();
  loading = false;
  error: string | null = null;

  onScreenshotSelected(event: Event) {
    this.error = null;
    this.loading = true;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      this.loading = false;
      return;
    }

    const imgURL = URL.createObjectURL(file);

    createWorker('eng').then(worker => {
      return worker.recognize(imgURL)
        .then(result => {
          this.scannedText.emit(result.data.text.trim());
          return worker.terminate();
        })
        .catch(() => {
          this.error = 'Failed to extract text.';
        })
        .finally(() => {
          this.loading = false;
          URL.revokeObjectURL(imgURL);
        });
    }).catch(() => {
      this.error = 'Failed to initialize OCR.';
      this.loading = false;
      URL.revokeObjectURL(imgURL);
    });
  }
}
