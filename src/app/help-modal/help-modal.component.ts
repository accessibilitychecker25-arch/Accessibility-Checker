import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.css'],
})
export class HelpModalComponent {
  @Input() fileName: string = 'YourFile.docx';
  @Output() close = new EventEmitter<void>();

  copied = false;

  get copyCommand(): string {
    const safeName = (this.fileName || 'YourFile.docx').replace(/'/g, '');
    return `Unblock-File -Path 'C:\\path\\to\\${safeName}'`;
  }

  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.copyCommand);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }

  onClose() {
    this.close.emit();
  }
}
