import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private employees$ = new BehaviorSubject<Employee[]>([]);

  constructor() {
    this.loadInitialData();
  }

  getEmployees(): Observable<Employee[]> {
    return this.employees$.asObservable();
  }

  saveEmployee(employee: Omit<Employee, 'id' | 'isVisible'> & { id?: string }): Observable<Employee> {
    const employees = this.employees$.getValue();
    if (employee.id) {
      const index = employees.findIndex(e => e.id === employee.id);
      if (index > -1) {
        // Preserve the isVisible flag when updating
        const currentVisibility = employees[index].isVisible;
        employees[index] = { ...employee, id: employee.id, isVisible: currentVisibility };
        this.employees$.next([...employees]);
        return of(employees[index]);
      }
    } else {
      const newEmployee: Employee = {
        ...employee,
        id: `emp-${Date.now()}`,
        isVisible: true // Default new employees to visible
      };
      this.employees$.next([...employees, newEmployee]);
      return of(newEmployee);
    }
    return of(null as any);
  }

  deleteEmployee(employeeId: string): Observable<boolean> {
    let employees = this.employees$.getValue();
    const initialLength = employees.length;
    employees = employees.filter(e => e.id !== employeeId);
    this.employees$.next(employees);
    return of(employees.length < initialLength);
  }

  private loadInitialData() {
    // Mock data based on your original project, linked to previous mock data.
    const mockEmployees: Employee[] = [
      {
        id: 'emp-1',
        firstName: 'Jane',
        lastName: 'Doe',
        displayName: 'Jane D.',
        departmentId: 'dept-1', // Front of House
        role: 'User',
        status: 'Active',
        vacationBalance: 10,
        isVisible: true
      },
      {
        id: 'emp-2',
        firstName: 'John',
        lastName: 'Smith',
        displayName: 'John S.',
        departmentId: 'dept-2', // Back of House
        role: 'User',
        status: 'Active',
        vacationBalance: 5,
        isVisible: true
      },
      {
        id: 'emp-3',
        firstName: 'Peter',
        lastName: 'Jones',
        displayName: 'Peter',
        departmentId: 'dept-3', // Management
        role: 'General Manager',
        status: 'Active',
        vacationBalance: 20,
        isVisible: false // Example of a hidden employee
      },
    ];
    this.employees$.next(mockEmployees);
  }
}