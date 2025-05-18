import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ScreenshotUploadComponent } from '../screenshot-upload/screenshot-upload.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ScreenshotUploadComponent,
    CommonModule,
    DialogModule,
    ButtonModule,
  ],
  templateUrl: './assignment-dialog.component.html',
  styleUrls: ['./assignment-dialog.component.css'],
})
export class AssignmentDialogComponent {
  @Output() submitted = new EventEmitter<any>();
  @ViewChild(ScreenshotUploadComponent)
  screenshotUpload!: ScreenshotUploadComponent;
  form: FormGroup;
  showDialog = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      class: ['', Validators.required],
      extractedText: ['', Validators.required],
    });
  }

  open() {
    this.showDialog = true;
  }
  close() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.form.updateValueAndValidity();

    if (this.screenshotUpload) {
      this.screenshotUpload.reset(); // ✅ resets file, text, errors, and revokes URL
    }

    this.showDialog = false;
  }

  onScannedText(text: string) {
    this.form.patchValue({ extractedText: text });
  }

  onSubmit() {
    if (this.form.valid) {
      this.submitted.emit(this.form.value);
      this.close();
    }
  }
}
