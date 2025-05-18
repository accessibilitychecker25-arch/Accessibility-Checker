import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Assignment } from '../models/assignment.model';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private assignmentCollection;

  constructor(private firestore: Firestore) {
    this.assignmentCollection = collection(this.firestore, 'assignments');
  }

  getAssignments(): Observable<Assignment[]> {
    return collectionData(this.assignmentCollection, {
      idField: 'id',
    }) as Observable<Assignment[]>;
  }

  addAssignment(assignment: Assignment) {
    return addDoc(this.assignmentCollection, {
      ...assignment,
      createdAt: new Date(),
    });
  }

  deleteAssignment(id: string) {
    return deleteDoc(doc(this.firestore, 'assignments', id));
  }
}
