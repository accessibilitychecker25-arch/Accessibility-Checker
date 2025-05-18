import { Component } from '@angular/core';
import { ScreenshotUploadComponent } from '../screenshot-upload/screenshot-upload.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parent',
  templateUrl: './assignments.component.html',
  imports: [ScreenshotUploadComponent, CommonModule], 
})
export class AssignmentsComponent {
  showDialog = false;
  scannedText: string = '';

  handleScannedText(text: string) {
    this.scannedText = text;
    this.showDialog = false;
  }
}
