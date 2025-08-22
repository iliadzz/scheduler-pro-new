import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { Role } from '../../models/role.model';
import { Department } from '../../models/department.model';
import { RoleService } from '../../services/role';
import { DepartmentService } from '../../services/department';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './roles.html',
  styleUrls: ['./roles.css']
})
export class RolesComponent implements OnInit {
  roles$!: Observable<Role[]>;
  departments$!: Observable<Department[]>;
  selectedRole$ = new BehaviorSubject<Role | null>(null);
  roleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private departmentService: DepartmentService
  ) {
    this.roleForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      departmentId: ['', Validators.required],
      color: ['#000000', Validators.required]
    });
  }

  ngOnInit(): void {
    this.roles$ = this.roleService.getRoles();
    this.departments$ = this.departmentService.getDepartments();
  }

  selectRole(role: Role): void {
    this.selectedRole$.next(role);
    this.roleForm.patchValue(role);
  }

  clearSelection(): void {
    this.selectedRole$.next(null);
    this.roleForm.reset({ color: '#000000' });
  }

  saveRole(): void {
    if (this.roleForm.valid) {
      this.roleService.saveRole(this.roleForm.value).subscribe(() => {
        this.clearSelection();
      });
    }
  }

  updateColor(colorInput: HTMLInputElement, event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    colorInput.value = color;
    this.roleForm.get('color')?.setValue(color);
  }
}