import { Component } from '@angular/core';
import { ScreenshotUploadComponent } from '../screenshot-upload/screenshot-upload.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parent',
  templateUrl: './assignments.component.html',
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    ScreenshotUploadComponent,
  ],
  standalone: true,
})
export class AssignmentsComponent {
  showDialog = false;
  scannedText: string = '';

  handleScannedText(text: string) {
    this.scannedText = text;
  }
}
