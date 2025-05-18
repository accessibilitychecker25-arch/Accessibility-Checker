import { Component } from '@angular/core';
import { AssignmentDialogComponent } from '../assignment-dialog/assignment-dialog.component';
import { AssignmentService } from '../services/assignment.service';
import { Assignment } from '../models/assignment.model';

@Component({
  selector: 'app-parent',
  templateUrl: './assignments.component.html',
  imports: [AssignmentDialogComponent],
  standalone: true,
})
export class AssignmentsComponent {
  constructor(private assignmentService: AssignmentService) {}

  saveAssignment(data: Assignment) {
    this.assignmentService
      .addAssignment(data)
      .then(() => console.log('Assignment saved'))
      .catch((err) => console.error('Error saving:', err));
  }
}
