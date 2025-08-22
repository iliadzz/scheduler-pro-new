import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { Department } from '../../models/department.model';
import { DepartmentService } from '../../services/department';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './departments.html',
  styleUrls: ['./departments.css']
})
export class DepartmentsComponent implements OnInit {
  departments$!: Observable<Department[]>;
  selectedDepartment$ = new BehaviorSubject<Department | null>(null);
  departmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService
  ) {
    this.departmentForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      abbreviation: ['', [Validators.required, Validators.maxLength(3)]],
      manager: ['']
    });
  }

  ngOnInit(): void {
    this.departments$ = this.departmentService.getDepartments();
  }

  selectDepartment(dept: Department): void {
    this.selectedDepartment$.next(dept);
    this.departmentForm.patchValue(dept);
  }

  clearSelection(): void {
    this.selectedDepartment$.next(null);
    this.departmentForm.reset();
  }

  saveDepartment(): void {
    if (this.departmentForm.valid) {
      const departmentData = this.departmentForm.value;
      this.departmentService.saveDepartment(departmentData).subscribe(() => {
        this.clearSelection();
      });
    }
  }
}