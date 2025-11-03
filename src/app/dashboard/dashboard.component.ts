// dashboard.component.ts

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
import { HelpModalComponent } from '../help-modal/help-modal.component';

type RemediationIssue =
  | { type: 'fixed'; message: string }
  | { type: 'flagged'; message: string };

interface DocxRemediationResponse {
  fileName: string;
  suggestedFileName?: string | null;
  report: {
    fileName?: string;
    suggestedFileName?: string | null;
    summary: { fixed: number; flagged: number };
    details: {
      // FIXES (low risk)
      removedProtection?: boolean;
      documentProtected?: boolean;
      fileNameFixed?: boolean;
      tablesHeaderRowSet?: Array<{ tableIndex: number }>;
      languageDefaultFixed?: { setTo: string };

      // DETECT-ONLY (names changed)
      fileNameNeedsFixing: boolean;
      titleNeedsFixing?: boolean;
      emptyHeadings?: Array<{ paragraphIndex: number }>;
      headingOrderIssues?: Array<{
        paragraphIndex: number;
        previousLevel: number;
        currentLevel: number;
      }>;
      mergedSplitEmptyCells?: Array<{
        tableIndex: number;
        row: number;
        col: number;
        gridSpan?: number;
        vMerge?: any;
        isEmpty: boolean;
      }>;
      badLinks?: Array<{
        paragraphIndex: number;
        display: string;
        target?: string;
      }>;
      headerFooterAudit?: Array<{ part: string; preview: string }>;
      imagesMissingOrBadAlt?: number;
      anchoredDrawingsDetected?: number;
      embeddedMedia?: Array<{ id: string; target: string; type: string }>;
      gifsDetected?: string[];
      colorContrastIssues?: Array<{
        paragraphIndex: number;
        color: string;
        sizePt?: number;
        bold?: boolean;
        ratio: number;
        sample: string;
      }>;
      languageDefaultIssue?: {
        current: string | null;
        recommendation: string;
      } | null;
      filenameFlag?: string | null;
    };
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FileUploadComponent, HttpClientModule, CommonModule, HelpModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  // whether to show the unblock help modal after download
  showHelpModal = false;
  // show a small post-download banner with alternatives and a button to open modal
  showPostDownloadBanner = false;
  isUploading = false;
  progress = 0;
  selectedFile?: File;
  fileName: string = '';
  downloadFileName: string = '';

  // backend response
  remediation?: DocxRemediationResponse;

  // flattened list for the UI
  issues: RemediationIssue[] = [];

  constructor(private http: HttpClient) {}

  handleFile(payload: { file: File; title: string }) {
    const file = payload.file;
    const title = (payload.title || '').trim();
    this.selectedFile = file;
    this.progress = 0;
    this.isUploading = true;
    this.remediation = undefined;
    this.issues = [];

    // quick client-side guard: only .docx
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'docx') {
      this.isUploading = false;
      this.issues = [
        {
          type: 'flagged',
          message: `Unsupported file type ".${ext}". Please upload a .docx.`,
        },
      ];
      return;
    }

    // Directly upload without pinging the API
    this.uploadDocxFile(file, title);
  }

  private uploadDocxFile(file: File, title: string) {
    const uploadUrl = `${environment.apiUrl}${environment.uploadEndpoint}`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title); // backend may use this to set core title

    this.http
      .post(uploadUrl, formData, { observe: 'events', reportProgress: true })
      .subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progress = Math.round(
              (100 * event.loaded) / (event.total ?? 1),
            );
          } else if (event.type === HttpEventType.Response) {
            const res = (event as HttpResponse<any>)
              .body as DocxRemediationResponse;
            this.remediation = res;
            this.fileName = res.suggestedFileName ? res.suggestedFileName : "remediated.docx";
            this.issues = this.flattenIssues(res);
            this.isUploading = false;
          }
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.isUploading = false;
          this.issues = [
            {
              type: 'flagged',
              message: `Upload failed: ${err?.error?.message || err.statusText || err.message || 'Unknown error'}`,
            },
          ];
        },
      });
  }

  handleClear() {
    this.selectedFile = undefined;
    this.remediation = undefined;
    this.issues = [];
    this.isUploading = false;
    this.progress = 0;
    this.fileName = '';
    this.downloadFileName = '';
  }

  private flattenIssues(res: DocxRemediationResponse): RemediationIssue[] {
    if (!res?.report?.details) return [];
    const d = res.report.details;
    const out: RemediationIssue[] = [];

    // FIXED (conservative)
    if (d.removedProtection)
      out.push({
        type: 'fixed',
        message:
          'Document protection has been successfully removed, allowing full editing access.',
      });
    
    if (d.documentProtected === true)
      out.push({
        type: 'flagged',
        message:
          'Document is protected - will be unlocked in remediation for improved accessibility.',
      });

    if (d.fileNameFixed)
      out.push({
        type: 'fixed',
        message:
          'The file name has been updated to a more descriptive and accessible name.',
      });
    if (d.titleNeedsFixing)
      out.push({
        type: 'flagged',
        message:
          'The document title needs to be updated. It should be set to something descriptive.',
      });
    if (d.tablesHeaderRowSet?.length)
      out.push({
        type: 'fixed',
        message: `Repeating header row has been set for ${d.tablesHeaderRowSet.length} table(s) for better accessibility in long documents.`,
      });
    if (d.languageDefaultFixed)
      out.push({
        type: 'fixed',
        message: `The document language has been set to ${d.languageDefaultFixed.setTo} for consistent language and readability.`,
      });

    // FLAGGED (detect-only)
    if (d.fileNameNeedsFixing) {
      out.push({
        type: 'flagged',
        message: `The file name is too generic or unclear. Please make sure it reflects the content of the document and avoids terms like 'document' or 'untitled'. Also, replace any underscores (_) with hyphens (-) for better readability.`,
      });
    }

    if (d.emptyHeadings?.length)
      out.push({
        type: 'flagged',
        message: `${d.emptyHeadings.length} empty heading(s) detected. Headings should contain meaningful text for structure and accessibility.`,
      });

    if (d.headingOrderIssues?.length)
      out.push({
        type: 'flagged',
        message: `${d.headingOrderIssues.length} heading order issue(s) detected. Ensure headings are in proper order (e.g., Heading 1 followed by Heading 2).`,
      });

    if (d.badLinks?.length)
      out.push({
        type: 'flagged',
        message: `${d.badLinks.length} hyperlink(s) need descriptive text. Use clear, meaningful link text that indicates the target of the link.`,
      });

    if (d.mergedSplitEmptyCells?.length)
      out.push({
        type: 'flagged',
        message: `${d.mergedSplitEmptyCells.length} table cell issue(s) detected (merged, split, or empty). Ensure all table cells are properly structured for readability.`,
      });

    if (d.headerFooterAudit?.length)
      out.push({
        type: 'flagged',
        message: `The header/footer contains content. Consider duplicating key information within the document body for better accessibility.`,
      });

    if (
      typeof d.imagesMissingOrBadAlt === 'number' &&
      d.imagesMissingOrBadAlt > 0
    )
      out.push({
        type: 'flagged',
        message: `${d.imagesMissingOrBadAlt} image(s) are missing or have poor alt text. Alt text should describe the content and purpose of the image for accessibility.`,
      });

    if (
      typeof d.anchoredDrawingsDetected === 'number' &&
      d.anchoredDrawingsDetected > 0
    )
      out.push({
        type: 'flagged',
        message: `${d.anchoredDrawingsDetected} anchored drawing(s) detected. For improved reading order, use inline images instead.`,
      });

    if (d.embeddedMedia?.length)
      out.push({
        type: 'flagged',
        message: `${d.embeddedMedia.length} embedded media item(s) detected. Ensure captions or transcripts are provided for accessibility.`,
      });

    if (d.gifsDetected?.length)
      out.push({
        type: 'flagged',
        message: `${d.gifsDetected.length} GIF(s) detected. Verify that none of them contain flashing content, which can cause accessibility issues.`,
      });

    if (d.colorContrastIssues?.length)
      out.push({
        type: 'flagged',
        message: `${d.colorContrastIssues.length} low contrast text run(s) detected against a white background. Consider increasing contrast for readability.`,
      });

    if (d.languageDefaultIssue && !d.languageDefaultFixed)
      out.push({
        type: 'flagged',
        message: `Document default language is set to ${d.languageDefaultIssue.current || 'unset'}. It is recommended to set it to ${d.languageDefaultIssue.recommendation} for consistency.`,
      });

    if (d.filenameFlag) out.push({ type: 'flagged', message: d.filenameFlag });

    return out;
  }

  downloadFixed() {
    const downloadUrl = `${environment.apiUrl}${environment.downloadEndpoint}`;

    if (!this.selectedFile) {
      console.error('No file selected for download');
      return; // Early return if no file is selected
    }
    // Prepare form data to send file to the server
    const formData = new FormData();
    formData.append('file', this.selectedFile); // Add the file object

    // Send POST request with file object
    this.http
      .post(downloadUrl, formData, {
        responseType: 'blob',
        observe: 'response',
      })
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          // Check if the response body is not null
          const blob = response.body;
          if (!blob) {
            console.error('Error: Empty response body');
            return;
          }

          const contentType = (response.headers.get('content-type') || '').toLowerCase();

          // If server returned JSON (error payload), parse and show a user message
          if (contentType.includes('application/json')) {
            // blob.text() returns a promise with the JSON string
            blob.text().then((txt) => {
              try {
                const payload = JSON.parse(txt);
                this.issues = [
                  { type: 'flagged', message: payload?.error || 'Server error during remediation' },
                ];
              } catch (e) {
                this.issues = [
                  { type: 'flagged', message: 'Unexpected server response during remediation.' },
                ];
              }
            });
            return;
          }

          // Extract filename from Content-Disposition header (supports filename and filename*=)
          const contentDisposition = response.headers.get('content-disposition') || response.headers.get('Content-Disposition') || '';
          let filename = 'remediated-document.docx'; // default

          if (contentDisposition) {
            // Try filename*=UTF-8''name.docx first
            const fstar = contentDisposition.match(/filename\*=[^']*''([^;\n\r]+)/i);
            if (fstar && fstar[1]) {
              try {
                filename = decodeURIComponent(fstar[1]);
              } catch (e) {
                filename = fstar[1];
              }
            } else {
              const matches = /filename=\s*"?([^";]+)"?/i.exec(contentDisposition);
              if (matches && matches[1]) filename = matches[1];
            }
          }

          // Store the filename for display purposes
          this.downloadFileName = filename;

          // Update the "fixed" counter after successful download
          if (this.remediation?.report?.summary) {
            const autoFixableCount = this.countAutoFixableIssues();
            this.remediation.report.summary.fixed += autoFixableCount;
            this.remediation.report.summary.flagged -= autoFixableCount;
            if (this.remediation.report.summary.flagged < 0) {
              this.remediation.report.summary.flagged = 0;
            }
          }

          // Create download link with the correct filename
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename; // Use the filename from the header
          a.click();
          URL.revokeObjectURL(url);

          // If the original report said the document was protected, show a post-download banner
          // with alternatives and a button to open the unblock help modal.
          if (this.remediation?.report?.details?.documentProtected) {
            this.showPostDownloadBanner = true;
          }
        },
        error: (err) => {
          console.error('Download failed', err);
          this.issues = [
            { type: 'flagged', message: `Download failed: ${err?.error?.message || err.statusText || err.message || 'Unknown error'}` },
          ];
        },
      });
  }

  private countAutoFixableIssues(): number {
    // Count issues that the backend automatically fixes during download/remediation
    // These are the same issues that show "fixed" status but weren't counted yet
    if (!this.remediation?.report?.details) return 0;
    
    const d = this.remediation.report.details;
    let count = 0;
    
    // These are auto-fixed by the backend during remediation:
    if (d.documentProtected === true) count++; // Protection removal
    if (d.fileNameNeedsFixing && !d.fileNameFixed) count++; // Filename fix
    if (d.tablesHeaderRowSet?.length) count += d.tablesHeaderRowSet.length; // Table headers
    if (d.languageDefaultIssue && !d.languageDefaultFixed) count++; // Language fix
    
    return count;
  }
}
