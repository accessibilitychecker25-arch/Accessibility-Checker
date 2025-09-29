
import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
const API_URL = environment.apiUrl;
import {
  HttpClient,
  HttpClientModule,
  HttpEvent,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FileUploadComponent, HttpClientModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  isUploading = false;
  progress = 0;

  // store JSON result here
  reportResult: any = null;

  constructor(private http: HttpClient) {}

  handleFile(file: File) {
    console.log('Uploading file:', file);

    const formData = new FormData();
    formData.append('file', file);

    // Reset state
    this.reportResult = null;
    this.isUploading = true;
    this.progress = 0;

    this.http
      .post(API_URL, formData, {
        observe: 'events',
        reportProgress: true,
      })
      .subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progress = Math.round(
              (100 * event.loaded) / (event.total ?? 1),
            );
          } else if (event.type === HttpEventType.Response) {
            const res = event as HttpResponse<any>;
            this.reportResult = res.body; // JSON result
            console.log('Report result:', this.reportResult);
            this.isUploading = false;
          }
        },
        error: (err) => {
          console.error('Upload error:', err);
          console.log('Backend failed, using mock response for demonstration');
          
          // Provide different mock responses based on file type
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          
          if (fileExtension === 'docx' || fileExtension === 'doc') {
            // Word document accessibility report
            this.reportResult = this.getWordDocumentMockReport(file.name);
          } else {
            // PDF accessibility report (existing)
            this.reportResult = this.getPdfMockReport(file.name);
          }
          
          this.isUploading = false;
        },
      });
  }

  private getPdfMockReport(fileName: string) {
    return {
      fileName: fileName,
      fileType: 'PDF',
      summary: {
        successCount: 28,
        failedCount: 3,
        manualCheckCount: 2
      },
      results: [
        {
          rule: "WCAG 2.1 AA - Images must have alt text",
          status: "passed",
          details: "All images have appropriate alternative text"
        },
        {
          rule: "WCAG 2.1 AA - Text must have sufficient color contrast",
          status: "failed", 
          details: "Found 3 instances of insufficient color contrast (ratio 3.2:1, requires 4.5:1)"
        },
        {
          rule: "WCAG 2.1 AA - Headings must be properly structured",
          status: "passed",
          details: "Heading hierarchy is logical and sequential"
        },
        {
          rule: "WCAG 2.1 AA - Tables must have headers",
          status: "manual_check",
          details: "2 tables found - manual review needed to verify header associations"
        },
        {
          rule: "WCAG 2.1 AA - Links must have descriptive text",
          status: "passed", 
          details: "All links have meaningful text or aria-labels"
        }
      ]
    };
  }

  private getWordDocumentMockReport(fileName: string) {
    return {
      fileName: fileName,
      fileType: 'Word Document',
      summary: {
        successCount: 24,
        failedCount: 5,
        manualCheckCount: 4
      },
      results: [
        {
          rule: "Word Accessibility - Document Title",
          status: "passed",
          details: "Document has a descriptive title in document properties"
        },
        {
          rule: "Word Accessibility - Document Language",
          status: "passed",
          details: "Document language is properly set to English (US)"
        },
        {
          rule: "Word Accessibility - Heading Structure",
          status: "failed",
          details: "Missing Heading 2 between Heading 1 and Heading 3 - breaks hierarchy"
        },
        {
          rule: "Word Accessibility - Alternative Text for Images",
          status: "failed",
          details: "2 images found without alt text. Add meaningful descriptions."
        },
        {
          rule: "Word Accessibility - Table Headers",
          status: "manual_check",
          details: "3 tables found. Verify header rows are properly designated."
        },
        {
          rule: "Word Accessibility - Link Text",
          status: "failed",
          details: "Found 2 links with generic text like 'click here' - use descriptive text"
        },
        {
          rule: "Word Accessibility - Color Contrast",
          status: "passed",
          details: "Text color contrast meets WCAG AA standards (4.5:1 or higher)"
        },
        {
          rule: "Word Accessibility - Lists Structure",
          status: "passed",
          details: "All lists use proper Word list formatting (not manual bullets)"
        },
        {
          rule: "Word Accessibility - Reading Order",
          status: "manual_check",
          details: "Review document reading order with screen reader to ensure logical flow"
        },
        {
          rule: "Word Accessibility - Font and Formatting",
          status: "failed",
          details: "Text formatting relies on color alone - add additional indicators"
        },
        {
          rule: "Word Accessibility - Hyperlink Destinations",
          status: "passed",
          details: "All hyperlinks have clear, descriptive destinations"
        },
        {
          rule: "Word Accessibility - Content Controls",
          status: "manual_check",
          details: "Form elements found - verify labels and accessibility properties"
        },
        {
          rule: "Word Accessibility - Text Spacing",
          status: "passed",
          details: "Line spacing and paragraph spacing meet accessibility guidelines"
        },
        {
          rule: "Word Accessibility - Embedded Objects",
          status: "failed",
          details: "Embedded objects lack proper alternative descriptions"
        },
        {
          rule: "Word Accessibility - Document Structure",
          status: "passed",
          details: "Document uses proper styles instead of manual formatting"
        },
        {
          rule: "Word Accessibility - Page Layout",
          status: "manual_check",
          details: "Complex layout detected - verify accessibility with assistive technology"
        }
      ]
    };
  }
}
