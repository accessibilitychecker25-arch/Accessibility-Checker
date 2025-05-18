import { Component, OnInit, ViewChild } from '@angular/core';
import { AssignmentService } from '../services/assignment.service';
import { AssignmentDialogComponent } from '../assignment-dialog/assignment-dialog.component';
import { Assignment } from '../models/assignment.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parent',
  templateUrl: './assignments.component.html',
  imports: [AssignmentDialogComponent, CommonModule],
  standalone: true,
})
export class AssignmentsComponent implements OnInit {
  assignments: Assignment[] = [];

  @ViewChild('assignmentDialog') assignmentDialog!: AssignmentDialogComponent;

  constructor(private assignmentService: AssignmentService) {}

  ngOnInit() {
    this.assignmentService.getAssignments().subscribe((data) => {
      this.assignments = data;
    });
  }

  saveAssignment(data: Assignment) {
    this.assignmentService.addAssignment(data).then(() => {
      console.log('Assignment saved');
    });
  }

  deleteAssignment(id: string) {
    this.assignmentService.deleteAssignment(id).then(() => {
      console.log('Assignment deleted');
    });
  }
}
