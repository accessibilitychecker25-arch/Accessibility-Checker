import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'], // ✅ plural
})
export class FileUploadComponent {
  // Emit an object containing the file and the required title
  @Output() submitted = new EventEmitter<{ file: File; title: string }>();
  selectedFile?: File;
  title: string = '';

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile);
      
      // Auto-suggest title from cleaned filename if title is empty
      if (!this.title?.trim() && this.selectedFile) {
        this.title = this.generateTitleFromFilename(this.selectedFile.name);
      }
    }
  }

  submit() {
    // Require file, title, and valid filename
    if (this.isFormValid()) {
      const cleanedFile = this.createCleanedFile();
      this.submitted.emit({ file: cleanedFile, title: this.title.trim() });
    } else {
      // Simple client-side feedback - will be visible in console
      if (!this.selectedFile) console.warn('No file selected');
      if (!this.title?.trim()) console.warn('Document title is required');
      if (!this.isFileNameValid()) console.warn('Filename needs to be more descriptive');
    }
  }

  // Validation methods for accessibility standards
  isFormValid(): boolean {
    return !!(this.selectedFile && this.isFileNameValid());
  }

  isFileNameValid(): boolean {
    if (!this.selectedFile) return false;
    return this.isDescriptive() && !this.hasGenericName();
  }

  hasGenericName(): boolean {
    if (!this.selectedFile) return false;
    const name = this.selectedFile.name.toLowerCase();
    const genericPatterns = [
      /^document\d*\./,
      /^untitled\d*\./,
      /^new\s?document\d*\./,
      /^doc\d*\./,
      /^file\d*\./
    ];
    return genericPatterns.some(pattern => pattern.test(name));
  }

  hasUnderscores(): boolean {
    if (!this.selectedFile) return false;
    return this.selectedFile.name.includes('_');
  }

  isDescriptive(): boolean {
    if (!this.selectedFile) return false;
    const nameWithoutExt = this.selectedFile.name.replace(/\.[^/.]+$/, '');
    // Check if filename has at least 3 characters and contains meaningful words
    return nameWithoutExt.length >= 3 && /[a-zA-Z]/.test(nameWithoutExt);
  }

  getSuggestedFilename(): string {
    if (!this.selectedFile) return '';
    let suggested = this.selectedFile.name;
    
    // Replace underscores with hyphens
    suggested = suggested.replace(/_/g, '-');
    
    // If generic, suggest based on title or use placeholder
    if (this.hasGenericName()) {
      const extension = suggested.split('.').pop();
      const titleBased = this.title?.trim() ? 
        this.title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 
        'descriptive-document-name';
      suggested = `${titleBased}.${extension}`;
    }
    
    return suggested;
  }

  generateTitleFromFilename(filename: string): string {
    // Extract title from filename, clean it up
    let title = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    title = title.replace(/[-_]/g, ' '); // Replace hyphens and underscores with spaces
    title = title.replace(/\b\w/g, l => l.toUpperCase()); // Title case
    return title;
  }

  createCleanedFile(): File {
    if (!this.selectedFile) return this.selectedFile!;
    
    const suggestedName = this.getSuggestedFilename();
    
    // If filename needs cleaning, create new File object with clean name
    if (suggestedName !== this.selectedFile.name) {
      return new File([this.selectedFile], suggestedName, {
        type: this.selectedFile.type,
        lastModified: this.selectedFile.lastModified
      });
    }
    
    return this.selectedFile;
  }
}
