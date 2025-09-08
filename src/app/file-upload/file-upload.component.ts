import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'], // ✅ plural
})
export class FileUploadComponent {
  @Output() submitted = new EventEmitter<File>();
  selectedFile?: File;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile);
    }
  }

  submit() {
    if (this.selectedFile) {
      this.submitted.emit(this.selectedFile);
    }
  }
}
