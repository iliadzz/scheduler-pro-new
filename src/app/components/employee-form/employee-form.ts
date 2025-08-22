import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Employee } from '../../models/employee.model';
import { Department } from '../../models/department.model';
import { EmployeeService } from '../../services/employee';
import { DepartmentService } from '../../services/department';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './employee-form.html',
  styleUrls: ['./employee-form.css']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  departments$!: Observable<Department[]>;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    public dialogRef: MatDialogRef<EmployeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee: Employee | null }
  ) {
    this.employeeForm = this.fb.group({
      id: [null],
      displayName: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      departmentId: ['', Validators.required],
      // Add other default fields as necessary
      status: ['Active'],
      isVisible: [true]
    });
  }

  ngOnInit(): void {
    this.departments$ = this.departmentService.getDepartments();
    if (this.data.employee) {
      this.employeeForm.patchValue(this.data.employee);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.employeeForm.valid) {
      this.employeeService.saveEmployee(this.employeeForm.value).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }
}