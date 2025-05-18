import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenshotUploadComponent } from './screenshot-upload.component';

describe('ScreenshotUploadComponent', () => {
  let component: ScreenshotUploadComponent;
  let fixture: ComponentFixture<ScreenshotUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenshotUploadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScreenshotUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
