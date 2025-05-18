import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { createWorker } from 'tesseract.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-screenshot-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './screenshot-upload.component.html',
})
export class ScreenshotUploadComponent {
  @Output() scannedText = new EventEmitter<string>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  loading = false;
  error: string | null = null;
  private imgURL: string | null = null;

  onScreenshotSelected(event: Event) {
    this.error = null;
    this.loading = true;
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
      this.loading = false;
      return;
    }

    this.imgURL = URL.createObjectURL(file);

    createWorker('eng')
      .then((worker) =>
        worker.recognize(this.imgURL!).then((result) => {
          this.scannedText.emit(result.data.text.trim());
          return worker.terminate();
        }),
      )
      .catch(() => {
        this.error = 'Failed to extract text.';
      })
      .finally(() => {
        this.loading = false;
        if (this.imgURL) {
          URL.revokeObjectURL(this.imgURL);
        }
      });
  }

  reset() {
    this.error = null;
    this.loading = false;
    if (this.imgURL) {
      URL.revokeObjectURL(this.imgURL);
      this.imgURL = null;
    }
    this.scannedText.emit('');

    // ✅ This resets the file input display (shows "No file chosen")
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
