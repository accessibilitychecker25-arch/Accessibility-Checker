import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
})
export class FileUploadComponent {
  @Output() submitted = new EventEmitter<{ file: File; title: string }>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  selectedFile?: File;

  // Reset file input value to allow reselecting the same file
  resetNativeInputValue() {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Trigger the file input dialog
  triggerFileDialog() {
    this.fileInput?.nativeElement?.click();
  }

  // Clear selected file
  clearFile() {
    this.selectedFile = undefined;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Handle file selection
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && this.isValidFile(file)) {
      this.selectedFile = file;
    }
  }

  // Check if the selected file is valid (DOCX)
  isValidFile(file: File): boolean {
    return (
      file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  }

  // Submit the file
  submit() {
    if (!this.isFormValid()) return;
    this.submitted.emit({ file: this.selectedFile!, title: '' });
    this.selectedFile = undefined;
  }

  // Validate if a file is selected
  isFormValid(): boolean {
    return !!this.selectedFile; // Only check if a file is selected
  }
}
