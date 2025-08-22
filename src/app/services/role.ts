import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Role } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private roles$ = new BehaviorSubject<Role[]>([]);

  constructor() {
    this.loadInitialData();
  }

  getRoles(): Observable<Role[]> {
    return this.roles$.asObservable();
  }

  saveRole(role: Omit<Role, 'id'> & { id?: string }): Observable<Role> {
    const roles = this.roles$.getValue();
    if (role.id) {
      const index = roles.findIndex(r => r.id === role.id);
      if (index > -1) {
        roles[index] = { ...roles[index], ...role };
        this.roles$.next([...roles]);
        return of(roles[index]);
      }
    } else {
      const newRole: Role = {
        ...role,
        id: `role-${Date.now()}`,
      };
      this.roles$.next([...roles, newRole]);
      return of(newRole);
    }
    return of(null as any);
  }

  deleteRole(roleId: string): Observable<boolean> {
    let roles = this.roles$.getValue();
    const initialLength = roles.length;
    roles = roles.filter(r => r.id !== roleId);
    this.roles$.next(roles);
    return of(roles.length < initialLength);
  }

  private loadInitialData() {
    // Mock data based on your original project.
    // We're linking these roles to the mock department IDs from DepartmentService.
    const mockRoles: Role[] = [
      { id: 'role-1', name: 'Server', color: '#2E86C1', departmentId: 'dept-1' },
      { id: 'role-2', name: 'Host', color: '#5DADE2', departmentId: 'dept-1' },
      { id: 'role-3', name: 'Chef', color: '#239B56', departmentId: 'dept-2' },
      { id: 'role-4', name: 'Dishwasher', color: '#2ECC71', departmentId: 'dept-2' },
      { id: 'role-5', name: 'General Manager', color: '#B03A2E', departmentId: 'dept-3' },
    ];
    this.roles$.next(mockRoles);
  }
}