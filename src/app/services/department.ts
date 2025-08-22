import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Department } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  // We'll use a BehaviorSubject to hold our data.
  // This allows components to "subscribe" to changes and automatically update.
  // We're starting with an empty array.
  private departments$ = new BehaviorSubject<Department[]>([]);

  constructor() {
    // In a real app, you would fetch data from an API here.
    // For now, we'll load some mock data to simulate that.
    this.loadInitialData();
  }

  // --- Public Methods ---

  /**
   * Returns an Observable stream of the departments array.
   * Components can subscribe to this to get real-time updates.
   */
  getDepartments(): Observable<Department[]> {
    return this.departments$.asObservable();
  }

  /**
   * Adds a new department or updates an existing one.
   * @param department The department to save.
   */
  saveDepartment(department: Omit<Department, 'id' | 'sortOrder'> & { id?: string }): Observable<Department> {
    const departments = this.departments$.getValue();
    if (department.id) {
      // This is an update
      const index = departments.findIndex(d => d.id === department.id);
      if (index > -1) {
        departments[index] = { ...departments[index], ...department };
        this.departments$.next([...departments]);
        return of(departments[index]);
      }
    } else {
      // This is a new department
      const newDepartment: Department = {
        ...department,
        id: `dept-${Date.now()}`, // Simple unique ID for now
        sortOrder: departments.length
      };
      this.departments$.next([...departments, newDepartment]);
      return of(newDepartment);
    }
    // Return an observable of null if something went wrong
    return of(null as any);
  }

  /**
   * Deletes a department by its ID.
   * @param departmentId The ID of the department to delete.
   */
  deleteDepartment(departmentId: string): Observable<boolean> {
    let departments = this.departments$.getValue();
    const initialLength = departments.length;
    departments = departments.filter(d => d.id !== departmentId);

    // Re-assign sortOrder after deletion
    departments.forEach((dept, index) => dept.sortOrder = index);

    this.departments$.next(departments);
    return of(departments.length < initialLength); // Return true if an item was deleted
  }

  // --- Private Helper Method ---

  private loadInitialData() {
    // This is mock data based on your original project.
    // Later, this method will be replaced with an HTTP call to your MySQL backend.
    const mockDepartments: Department[] = [
      { id: 'dept-1', name: 'Front of House', abbreviation: 'FOH', sortOrder: 0 },
      { id: 'dept-2', name: 'Back of House', abbreviation: 'BOH', sortOrder: 1 },
      { id: 'dept-3', name: 'Management', abbreviation: 'MGMT', sortOrder: 2 },
    ];
    this.departments$.next(mockDepartments);
  }
}