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
import { firstValueFrom } from 'rxjs';
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
  // New remediation flags (backend)
  textShadowsRemoved?: boolean | number; // true or count
  fontsNormalized?: boolean | { replaced?: number };
  fontSizesNormalized?: boolean | { adjustedRuns?: number };
  minFontSizeEnforced?: boolean | { adjustedRuns?: number };
  lineSpacingFixed?: boolean | { adjustedParagraphs?: number };
      documentProtected?: boolean;
      fileNameFixed?: boolean;
      tablesHeaderRowSet?: Array<{ tableIndex: number }>;
      languageDefaultFixed?: { setTo: string };

      // DETECT-ONLY (names changed)
      fileNameNeedsFixing: boolean;
      titleNeedsFixing?: boolean;
      lineSpacingNeedsFixing?: boolean;
      fontTypeNeedsFixing?: boolean;
      fontSizeNeedsFixing?: boolean;
      // Location details are provided in separate arrays
      lineSpacingLocations?: Array<{
        type: string;
        currentSpacing: string;
        location: string;
        approximatePage: number;
        context: string;
        preview: string;
      }>;
      fontTypeLocations?: Array<{
        type: string;
        font: string;
        location: string;
        approximatePage: number;
        context: string;
        preview: string;
      }>;
      fontSizeLocations?: Array<{
        type: string;
        size: string;
        location: string;
        approximatePage: number;
        context: string;
        preview: string;
      }>;
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
      imagesMissingOrBadAlt?: number | Array<{
        imageIndex: number;
        page?: number;
        section?: string;
        description?: string;
        altText?: string;
      }>;
      // Image locations provided in separate array  
      imageLocations?: Array<{
        location: string;
        approximatePage: number;
        context: string;
        imagePath?: string;
        preview?: string;
        altText?: string;
      }>;
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

interface ProcessedReport {
  response: DocxRemediationResponse;
  original?: File;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FileUploadComponent, HttpClientModule, CommonModule, HelpModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  // temporary debug flag to help diagnose "empty" dashboard issues
  // whether to show the unblock help modal after download
  showHelpModal = false;
  // show a small post-download banner with alternatives and a button to open modal
  showPostDownloadBanner = false;
  // debug: show raw remediation.report JSON
  showRawReport = false;
  isUploading = false;
  progress = 0;
  selectedFile?: File;
  fileName: string = '';
  downloadFileName: string = '';

  // backend response
  remediation?: DocxRemediationResponse;

  // store processed reports for multi-file batches so user can inspect each
  processedReports: ProcessedReport[] = [];

  // flattened list for the UI
  issues: RemediationIssue[] = [];

  // For debug/UX: list of auto-fixed items computed on the client
  getAutoFixedItems(): string[] {
    if (!this.remediation?.report?.details) return [];
    const d = this.remediation.report.details;
    const items: string[] = [];

    if (d.removedProtection) items.push('Document protection removed');
    if (d.fileNameFixed) items.push('File name fixed');
    if (d.tablesHeaderRowSet?.length) items.push(`${d.tablesHeaderRowSet.length} table header(s) set`);
    if (d.languageDefaultFixed) items.push(`Language set to ${d.languageDefaultFixed.setTo}`);
    // new backend flags
    const tsCount = this.getTextShadowsCount(d);
    if (tsCount > 0) {
      if (tsCount === 1) items.push('Text shadows removed');
      else items.push(`${tsCount} text shadow(s) removed`);
    }
    
    // Only show font size normalization as fixed (not font type or line spacing)
    if (d.fontSizesNormalized) {
      items.push('Font sizes normalized for consistency');
    }
    
    const minFontMsg = this.getMinFontSizeMessage(d);
    if (minFontMsg) items.push(minFontMsg);
    
    // Note: Line spacing and font types are now flagged for user action, not auto-fixed

    return items;
  }

  // Normalize the backend's textShadowsRemoved flag into a non-negative integer count
  private getTextShadowsCount(details: DocxRemediationResponse['report']['details'] | undefined): number {
    if (!details) return 0;
    const v = details.textShadowsRemoved;
    if (v === true) return 1; // boolean true means at least one was removed
    if (typeof v === 'number' && isFinite(v) && v > 0) return Math.floor(v);
    return 0;
  }

  // Return a user-friendly message for font normalization when the backend reports it
  getFontNormalizationMessage(details: DocxRemediationResponse['report']['details'] | undefined): string | null {
    if (!details) return null;
    // Prefer fontSizesNormalized (more specific) — caller/template can use this to avoid duplicates
    if (details.fontSizesNormalized) {
      if (typeof details.fontSizesNormalized === 'object' && (details.fontSizesNormalized as any).adjustedRuns)
        return `${(details.fontSizesNormalized as any).adjustedRuns} font size run(s) normalized`;
      return 'Font sizes normalized for consistency';
    }
    // Font types are now flagged for user action, not auto-fixed
    return null;
  }

  // Build a human-friendly message for min font size enforcement (or adjustments)
  private getMinFontSizeMessage(details: DocxRemediationResponse['report']['details'] | undefined): string | null {
    if (!details || details.minFontSizeEnforced === undefined || details.minFontSizeEnforced === null) return null;
    const v = details.minFontSizeEnforced;
    if (typeof v === 'object') {
      const adj = (v as any).adjustedRuns;
      const enforcedPt = (v as any).enforcedSizePt || (v as any).targetPt || (v as any).minSizePt;
      const sizeText = enforcedPt ? `${enforcedPt}pt` : '11pt';
      if (typeof adj === 'number' && adj > 0) return `${adj} run(s) adjusted to min font size (${sizeText})`;
      return `Minimum font size enforced (${sizeText})`;
    }
    return 'Minimum font size enforced (11pt)';
  }

  // Handle multiple files submitted from the file picker (sequentially)
  async handleFiles(files: File[]) {
    if (!files || !files.length) return;
    this.isUploading = true;
    this.progress = 0;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // set selectedFile so downloadFixed() has a file to operate on (single-file download)
      this.selectedFile = f;
      try {
        const res = await this.uploadDocxFilePromise(f, '');
        // For now, show the latest file's remediation in the UI
        this.remediation = res;
        this.fileName = res.suggestedFileName ? res.suggestedFileName : f.name;
        this.issues = this.flattenIssues(res);
        // keep a copy of each processed file's report for per-file viewing (store original file)
        try {
          if (res && res.report) this.processedReports.push({ response: res, original: f });
        } catch (e) {}
      } catch (err: any) {
        this.issues = [{ type: 'flagged', message: `Upload failed for ${f.name}: ${err?.message || err?.statusText || 'error'}` }];
        break;
      }
      // simple progress indicator by files
      this.progress = Math.round(((i + 1) / files.length) * 100);
    }
    this.isUploading = false;
  }

  // Promise-based uploader used for sequential multi-file processing
  private uploadDocxFilePromise(file: File, title: string): Promise<DocxRemediationResponse> {
    const uploadUrl = `${environment.apiUrl}${environment.uploadEndpoint}`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    return firstValueFrom(this.http.post<DocxRemediationResponse>(uploadUrl, formData));
  }
  get rawReportJson(): string {
    try {
      return this.remediation?.report ? JSON.stringify(this.remediation.report, null, 2) : '';
    } catch (e) {
      return '';
    }
  }

  constructor(private http: HttpClient) {
    // debug logging removed
  }

  // Select a processed report to view its details in the main panel
  selectReport(index: number) {
    const rep = this.processedReports[index];
    if (!rep) return;
    // rep is a ProcessedReport { response, original }
    this.remediation = rep.response;
    this.issues = this.flattenIssues(rep.response);
    this.fileName = rep.response.suggestedFileName || rep.response.report?.fileName || '';
    // expose the original file so Download uses it
    this.selectedFile = rep.original;
    // reset download filename when switching
    this.downloadFileName = '';
  }

  // Download a specific processed report by index (uses stored original file when available)
  downloadReport(index: number) {
    const rep = this.processedReports[index];
    if (!rep) return;
    if (rep.original) {
      this.selectedFile = rep.original;
      this.downloadFixed();
    } else {
      this.issues = [{ type: 'flagged', message: 'Original file not available for download' }];
    }
  }

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
            // Save processed report so the user can inspect it individually later (include original file)
            try {
              if (res && res.report) this.processedReports.push({ response: res, original: file });
            } catch (e) {}
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
    this.processedReports = []; // Clear all processed reports
  }

  // Remove individual report
  removeReport(index: number) {
    this.processedReports.splice(index, 1);
    
    // If we removed the currently selected report, clear the view
    if (this.remediation && this.processedReports.length === 0) {
      this.remediation = undefined;
      this.issues = [];
    }
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
    // New backend fixes
    const tsCountFlat = this.getTextShadowsCount(d);
    if (tsCountFlat > 0)
      out.push({
        type: 'fixed',
        message:
          tsCountFlat === 1
            ? 'Text shadows were removed to improve text legibility.'
            : `${tsCountFlat} text shadow style(s) were removed for improved readability.`,
      });

    // Font types are now flagged for user action, not auto-fixed
    
    if (d.fontSizesNormalized) {
      out.push({
        type: 'fixed',
        message:
          typeof d.fontSizesNormalized === 'object' && (d.fontSizesNormalized as any).adjustedRuns
            ? `${(d.fontSizesNormalized as any).adjustedRuns} font size run(s) were normalized for consistency.`
            : 'Font sizes were normalized for consistency.',
      });
    }

    const minFontMsgFlat = this.getMinFontSizeMessage(d);
    if (minFontMsgFlat) out.push({ type: 'fixed', message: minFontMsgFlat.includes('adjusted') ? minFontMsgFlat.replace('adjusted to min font size', 'enforced to') : minFontMsgFlat.replace('Minimum font size enforced', 'Minimum font size enforced to') });
    
    // Line spacing and font type are now flagged for user action
    if (d.lineSpacingNeedsFixing) {
      let message = 'Line spacing needs to be at least 1.5 for improved readability (flagged for your attention).';
      
      // If detailed location information is available, include it
      if (d.lineSpacingLocations && d.lineSpacingLocations.length > 0) {
        const count = d.lineSpacingLocations.length;
        message += `\n\n📍 ${count} location${count > 1 ? 's' : ''} found - Click to expand details`;
        
        const locationDetails = d.lineSpacingLocations.map((item, index) => {
          let location = `${index + 1}. ${item.location}`;
          if (item.approximatePage) location += ` (Page ${item.approximatePage})`;
          if (item.context && item.context !== 'Document body') location += ` • ${item.context}`;
          if (item.currentSpacing) location += ` • Current: ${item.currentSpacing}`;
          if (item.preview && !item.preview.includes('<w:')) {
            location += `\n   Preview: "${item.preview.substring(0, 80)}..."`;
          }
          return location;
        }).join('\n\n');
        
        message += `\n\n<details class="mt-2">\n<summary class="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View ${count} Line Spacing Issue${count > 1 ? 's' : ''}</summary>\n<div class="mt-2 pl-4 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">${locationDetails}</div>\n</details>`;
      }
      
      out.push({
        type: 'flagged',
        message: message,
      });
    }
    
    if (d.fontTypeNeedsFixing) {
      let message = 'Font types should be Arial/sans-serif for better accessibility (flagged for your attention).';
      
      // If detailed location information is available, include it
      if (d.fontTypeLocations && d.fontTypeLocations.length > 0) {
        const count = d.fontTypeLocations.length;
        message += `\n\n📍 ${count} location${count > 1 ? 's' : ''} found - Click to expand details`;
        
        const locationDetails = d.fontTypeLocations.map((item, index) => {
          let location = `${index + 1}. ${item.location}`;
          if (item.approximatePage) location += ` (Page ${item.approximatePage})`;
          if (item.context && item.context !== 'Document body') location += ` • ${item.context}`;
          if (item.font) location += ` • Current: ${item.font}`;
          if (item.preview && !item.preview.includes('<w:')) {
            location += `\n   Preview: "${item.preview.substring(0, 80)}..."`;
          }
          return location;
        }).join('\n\n');
        
        message += `\n\n<details class="mt-2">\n<summary class="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View ${count} Font Type Issue${count > 1 ? 's' : ''}</summary>\n<div class="mt-2 pl-4 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">${locationDetails}</div>\n</details>`;
      }
      
      out.push({
        type: 'flagged',
        message: message,
      });
    }
    
    if (d.fontSizeNeedsFixing) {
      let message = 'Font sizes should be consistent and appropriately sized (flagged for your attention).';
      
      // If detailed location information is available, include it
      if (d.fontSizeLocations && d.fontSizeLocations.length > 0) {
        const count = d.fontSizeLocations.length;
        message += `\n\n📍 ${count} location${count > 1 ? 's' : ''} found - Click to expand details`;
        
        const locationDetails = d.fontSizeLocations.map((item, index) => {
          let location = `${index + 1}. ${item.location}`;
          if (item.approximatePage) location += ` (Page ${item.approximatePage})`;
          if (item.context && item.context !== 'Document body') location += ` • ${item.context}`;
          if (item.size) location += ` • Current: ${item.size}`;
          if (item.preview && !item.preview.includes('<w:')) {
            location += `\n   Preview: "${item.preview.substring(0, 80)}..."`;
          }
          return location;
        }).join('\n\n');
        
        message += `\n\n<details class="mt-2">\n<summary class="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View ${count} Font Size Issue${count > 1 ? 's' : ''}</summary>\n<div class="mt-2 pl-4 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">${locationDetails}</div>\n</details>`;
      }
      
      out.push({
        type: 'flagged',
        message: message,
      });
    }
    
    if (d.documentProtected === true)
      out.push({
        type: 'fixed',
        message:
          'Document protection was removed to allow full editing access.',
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

    if (d.imagesMissingOrBadAlt && (typeof d.imagesMissingOrBadAlt === 'number' && d.imagesMissingOrBadAlt > 0)) {
      let message = `${d.imagesMissingOrBadAlt} image(s) are missing or have poor alt text. Alt text should describe the content and purpose of the image for accessibility.`;
      
      // If detailed location information is available, include it
      if (d.imageLocations && d.imageLocations.length > 0) {
        const count = d.imageLocations.length;
        message += `\n\n📍 ${count} location${count > 1 ? 's' : ''} found - Click to expand details`;
        
        const locationDetails = d.imageLocations.map((item, index) => {
          let location = `${index + 1}. ${item.location}`;
          if (item.approximatePage) location += ` (Page ${item.approximatePage})`;
          if (item.context && item.context !== 'Document body') location += ` • ${item.context}`;
          if (item.imagePath) location += ` • File: ${item.imagePath}`;
          if (item.altText) location += ` • Current alt: "${item.altText}"`;
          if (item.preview && item.preview !== 'No surrounding text') {
            location += `\n   Preview: "${item.preview.substring(0, 80)}..."`;
          }
          return location;
        }).join('\n\n');
        
        message += `\n\n<details class="mt-2">\n<summary class="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View ${count} Image Issue${count > 1 ? 's' : ''}</summary>\n<div class="mt-2 pl-4 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">${locationDetails}</div>\n</details>`;
      }
      
      out.push({
        type: 'flagged',
        message: message,
      });
    }

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

          // Note: do not mutate the server-provided summary here. The UI shows a
          // client-estimated auto-fix count with `countAutoFixableIssues()` and
          // we perform an authoritative re-check immediately after download that
          // replaces the report with the server's post-remediation response.

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

          // Authoritative re-check: send the downloaded blob back to the upload analysis endpoint
          // so the UI shows the exact server-side post-remediation report (avoids client heuristics).
          try {
            const analysisUrl = `${environment.apiUrl}${environment.uploadEndpoint}`;
            const reForm = new FormData();
            // Append blob as a file; use the filename determined above so server sees correct name
            reForm.append('file', blob, filename);

            this.http.post(analysisUrl, reForm).subscribe({
              next: (resp: any) => {
                // Replace remediation with authoritative server response and re-render issues
                try {
                  const res = resp as DocxRemediationResponse;
                  if (res && res.report) {
                    this.remediation = res;
                    this.fileName = res.suggestedFileName ? res.suggestedFileName : filename;
                    this.issues = this.flattenIssues(res);
                    // Hide post-download banner if server confirms protection removed
                    if (!this.remediation.report.details?.documentProtected) {
                      this.showPostDownloadBanner = false;
                    }
                  }
                } catch (e) {
                  console.warn('Failed to parse authoritative report', e);
                }
              },
              error: (err) => {
                console.warn('Authoritative re-check failed', err);
                // keep existing remediation but surface a message
                this.issues = [
                  { type: 'flagged', message: `Could not refresh authoritative report: ${err?.message || err?.statusText || 'error'}` },
                ];
              },
            });
          } catch (e) {
            console.warn('Authoritative re-check error', e);
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

  countAutoFixableIssues(): number {
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
  // New backend auto-fixes
  const tsCount = this.getTextShadowsCount(d);
  if (tsCount > 0) count += tsCount;
    // Only count font size normalization (not font type or line spacing - those are now flagged)
    if (d.fontSizesNormalized) {
      if (typeof d.fontSizesNormalized === 'object' && (d.fontSizesNormalized as any).adjustedRuns)
        count += (d.fontSizesNormalized as any).adjustedRuns;
      else count++;
    }
    
    if (d.minFontSizeEnforced) {
      if (typeof d.minFontSizeEnforced === 'object' && d.minFontSizeEnforced.adjustedRuns)
        count += d.minFontSizeEnforced.adjustedRuns;
      else count++;
    }
    
    // Note: Line spacing and font types are now flagged for user action, not auto-fixed
    
    return count;
  }
}
