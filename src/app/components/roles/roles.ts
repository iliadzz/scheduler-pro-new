import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

// Import Models and Services
import { Role } from '../../models/role.model';
import { Department } from '../../models/department.model';
import { RoleService } from '../../services/role';
import { DepartmentService } from '../../services/department';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './roles.html',
  styleUrls: ['./roles.css']
})
export class RolesComponent implements OnInit {

  roles$!: Observable<Role[]>;
  departments$!: Observable<Department[]>;

  editingRole: Partial<Role> = {};
  isEditing = false;
  
  // We are injecting both services now
  constructor(
    private roleService: RoleService,
    private departmentService: DepartmentService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.roles$ = this.roleService.getRoles();
    this.departments$ = this.departmentService.getDepartments();
  }

  onEdit(role: Role): void {
    this.editingRole = { ...role };
    this.isEditing = true;
  }

  onDelete(roleId: string): void {
    if (confirm('Are you sure you want to delete this role?')) {
      this.roleService.deleteRole(roleId).subscribe();
    }
  }

  onSave(): void {
    if (!this.editingRole.name || !this.editingRole.departmentId || !this.editingRole.color) {
      alert('Please fill out all fields for the role.');
      return;
    }

    const roleToSave: Omit<Role, 'id'> & { id?: string } = {
      id: this.editingRole.id,
      name: this.editingRole.name,
      color: this.editingRole.color,
      departmentId: this.editingRole.departmentId
    };

    this.roleService.saveRole(roleToSave).subscribe({
      next: () => {
        this.resetForm();
      },
      error: (err) => {
        console.error('Error saving role', err);
        alert('Failed to save role.');
      }
    });
  }

  resetForm(): void {
    this.editingRole = {};
    this.isEditing = false;
  }
}