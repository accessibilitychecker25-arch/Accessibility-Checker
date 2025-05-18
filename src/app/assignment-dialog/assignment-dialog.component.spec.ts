import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentDialogComponent } from './assignment-dialog.component';

describe('AssignmentDialogComponent', () => {
  let component: AssignmentDialogComponent;
  let fixture: ComponentFixture<AssignmentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
