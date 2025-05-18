import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  CollectionReference,
  DocumentData,
} from '@angular/fire/firestore';
import { Assignment } from '../models/assignment.model';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private assignmentsRef: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.assignmentsRef = collection(this.firestore, 'assignments');
  }

  addAssignment(data: Assignment) {
    return addDoc(this.assignmentsRef, {
      ...data,
      createdAt: new Date(),
    });
  }
}
