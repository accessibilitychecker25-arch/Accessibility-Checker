import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpModalComponent } from './help-modal.component';

describe('HelpModalComponent', () => {
  let component: HelpModalComponent;
  let fixture: ComponentFixture<HelpModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('copyToClipboard should write the correct PowerShell command to clipboard and set copied flag', async () => {
    component.fileName = "example.docx";

    // mock navigator.clipboard.writeText
    const writeSpy = jasmine.createSpy('writeText').and.returnValue(Promise.resolve());
    (navigator as any).clipboard = { writeText: writeSpy };

    await component.copyToClipboard();

    expect(writeSpy).toHaveBeenCalledWith(component.copyCommand);
    expect(component.copied).toBeTrue();
  });
});
