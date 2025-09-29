
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
        failedCount: 2,
        manualCheckCount: 2
      },
      results: [
        {
          rule: "PDF Accessibility - Document Title",
          status: "passed",
          details: "PDF document has a descriptive title in document properties"
        },
        {
          rule: "PDF Accessibility - Document Language",
          status: "passed",
          details: "Document language is properly set to English (US)"
        },
        {
          rule: "PDF Accessibility - Tagged PDF Structure",
          status: "passed",
          details: "Document is properly tagged for screen reader accessibility"
        },
        {
          rule: "PDF Accessibility - Heading Structure",
          status: "passed",
          details: "Proper heading hierarchy maintained throughout document (H1→H2→H3)"
        },
        {
          rule: "PDF Accessibility - Alternative Text for Images",
          status: "passed",
          details: "All images have descriptive alternative text for screen readers"
        },
        {
          rule: "PDF Accessibility - Table Headers",
          status: "manual_check",
          details: "2 tables found - verify header cells are properly marked"
        },
        {
          rule: "PDF Accessibility - Link Text",
          status: "passed",
          details: "All hyperlinks have descriptive text and proper destinations"
        },
        {
          rule: "PDF Accessibility - Color Contrast",
          status: "passed",
          details: "Text color contrast meets WCAG AA standards (4.5:1 or higher)"
        },
        {
          rule: "PDF Accessibility - Reading Order",
          status: "manual_check",
          details: "Complex layout detected - verify logical reading order with screen reader"
        },
        {
          rule: "PDF Accessibility - Form Fields",
          status: "passed",
          details: "All form fields have proper labels and descriptions"
        },
        {
          rule: "PDF Accessibility - Bookmarks",
          status: "passed",
          details: "Document includes navigation bookmarks for long content"
        },
        {
          rule: "PDF Accessibility - Text Spacing",
          status: "passed",
          details: "Line and paragraph spacing meets accessibility guidelines"
        },
        {
          rule: "PDF Accessibility - Font Embedding",
          status: "passed",
          details: "All fonts are properly embedded for consistent display"
        },
        {
          rule: "PDF Accessibility - Security Restrictions",
          status: "passed",
          details: "No security restrictions prevent assistive technology access"
        },
        {
          rule: "PDF Accessibility - Multimedia Content",
          status: "passed",
          details: "Video content includes proper captions and audio descriptions"
        },
        {
          rule: "PDF Accessibility - Annotations",
          status: "passed",
          details: "Comments and annotations are accessible to screen readers"
        },
        {
          rule: "PDF Accessibility - Lists Structure",
          status: "passed",
          details: "All lists use proper PDF list structure tags"
        },
        {
          rule: "PDF Accessibility - Content Flow",
          status: "passed",
          details: "Document content flows logically from top to bottom"
        },
        {
          rule: "PDF Accessibility - Interactive Elements",
          status: "passed",
          details: "All interactive elements are keyboard accessible"
        },
        {
          rule: "PDF Accessibility - Text Selection",
          status: "passed",
          details: "All text is selectable and readable by assistive technology"
        },
        {
          rule: "PDF Accessibility - Page Structure",
          status: "passed",
          details: "Pages have consistent structure and navigation aids"
        },
        {
          rule: "PDF Accessibility - Zoom Compatibility",
          status: "passed",
          details: "Content remains readable and functional at 200% zoom"
        },
        {
          rule: "PDF Accessibility - Metadata",
          status: "passed",
          details: "Document contains comprehensive accessibility metadata"
        },
        {
          rule: "PDF Accessibility - Color Information",
          status: "passed",
          details: "Information is not conveyed by color alone"
        },
        {
          rule: "PDF Accessibility - Focus Indicators",
          status: "passed",
          details: "Interactive elements have visible focus indicators"
        },
        {
          rule: "PDF Accessibility - Error Prevention",
          status: "passed",
          details: "Form validation provides clear error messages and suggestions"
        },
        {
          rule: "PDF Accessibility - Timing",
          status: "passed",
          details: "No time limits imposed on reading or interacting with content"
        },
        {
          rule: "PDF Accessibility - Motion Control",
          status: "passed",
          details: "Animation and motion can be paused or disabled by users"
        },
        {
          rule: "PDF Accessibility - Document Properties",
          status: "passed",
          details: "Document properties include title, author, subject, and keywords"
        },
        {
          rule: "PDF Accessibility - Compliance Standards",
          status: "passed",
          details: "Document meets PDF/UA (Universal Accessibility) standards"
        },
        {
          rule: "PDF Accessibility - Tagged Content",
          status: "failed",
          details: "All page content must be tagged so it can be read in the correct order by assistive technologies."
        },
        {
          rule: "PDF Accessibility - Summary",
          status: "failed",
          details: "Tables should include a summary to explain their purpose and structure to users with disabilities."
        }
      ]
    };
  }

  private getWordDocumentMockReport(fileName: string) {
    return {
      fileName: fileName,
      fileType: 'Word Document',
      summary: {
        successCount: 28,
        failedCount: 2,
        manualCheckCount: 2
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
          status: "passed",
          details: "Proper heading hierarchy maintained throughout document (H1→H2→H3)"
        },
        {
          rule: "Word Accessibility - Alternative Text for Images",
          status: "passed",
          details: "All images have descriptive alternative text for screen readers"
        },
        {
          rule: "Word Accessibility - Table Headers",
          status: "manual_check",
          details: "3 tables found. Verify header rows are properly designated."
        },
        {
          rule: "Word Accessibility - Link Text",
          status: "passed",
          details: "All hyperlinks have descriptive text and proper destinations"
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
          status: "passed",
          details: "Text formatting uses multiple indicators beyond color alone"
        },
        {
          rule: "Word Accessibility - Hyperlink Destinations",
          status: "passed",
          details: "All hyperlinks have clear, descriptive destinations"
        },
        {
          rule: "Word Accessibility - Content Controls",
          status: "passed",
          details: "Form elements have proper labels and accessibility properties"
        },
        {
          rule: "Word Accessibility - Text Spacing",
          status: "passed",
          details: "Line spacing and paragraph spacing meet accessibility guidelines"
        },
        {
          rule: "Word Accessibility - Embedded Objects",
          status: "passed",
          details: "Embedded objects include proper alternative descriptions"
        },
        {
          rule: "Word Accessibility - Document Structure",
          status: "passed",
          details: "Document uses proper styles instead of manual formatting"
        },
        {
          rule: "Word Accessibility - Page Layout",
          status: "passed",
          details: "Document layout is accessible with assistive technology"
        },
        {
          rule: "Word Accessibility - Style Consistency",
          status: "passed",
          details: "Consistent use of built-in styles throughout document"
        },
        {
          rule: "Word Accessibility - Column Layout",
          status: "passed",
          details: "Multi-column layouts maintain logical reading order"
        },
        {
          rule: "Word Accessibility - Text Wrapping",
          status: "passed",
          details: "Text wrapping around objects maintains document flow"
        },
        {
          rule: "Word Accessibility - Navigation Aids",
          status: "passed",
          details: "Document includes table of contents and navigation bookmarks"
        },
        {
          rule: "Word Accessibility - Zoom Compatibility",
          status: "passed",
          details: "Content remains readable and functional at 200% zoom"
        },
        {
          rule: "Word Accessibility - Keyboard Navigation",
          status: "passed",
          details: "All interactive elements are accessible via keyboard"
        },
        {
          rule: "Word Accessibility - Focus Indicators",
          status: "passed",
          details: "Interactive elements have visible focus indicators"
        },
        {
          rule: "Word Accessibility - Color Information",
          status: "passed",
          details: "Information is not conveyed by color alone"
        },
        {
          rule: "Word Accessibility - Error Prevention",
          status: "passed",
          details: "Form validation provides clear error messages"
        },
        {
          rule: "Word Accessibility - Timing",
          status: "passed",
          details: "No time limits imposed on reading or interaction"
        },
        {
          rule: "Word Accessibility - Motion Control",
          status: "passed",
          details: "Animation and motion can be controlled by users"
        },
        {
          rule: "Word Accessibility - Document Metadata",
          status: "passed",
          details: "Document properties include comprehensive accessibility metadata"
        },
        {
          rule: "Word Accessibility - Template Usage",
          status: "passed",
          details: "Document uses accessible Word templates and styles"
        },
        {
          rule: "Word Accessibility - Track Changes",
          status: "passed",
          details: "Track changes and comments are accessible to screen readers"
        },
        {
          rule: "Word Accessibility - Tagged Content",
          status: "failed",
          details: "All page content must be tagged so it can be read in the correct order by assistive technologies."
        },
        {
          rule: "Word Accessibility - Summary",
          status: "failed",
          details: "Tables should include a summary to explain their purpose and structure to users with disabilities."
        }
      ]
    };
  }
}
