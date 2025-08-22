import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

// Import Models and Services
import { Employee } from '../../models/employee.model';
import { Department } from '../../models/department.model';
import { EmployeeService } from '../../services/employee';
import { DepartmentService } from '../../services/department';

// Import Angular Material Modules for Dialogs and Forms
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatCardModule
  ],
  providers: [provideNativeDateAdapter()], // Necessary for the date picker
  templateUrl: './employee-form.html',
  styleUrls: ['./employee-form.css']
})
export class EmployeeFormComponent implements OnInit {
  
  employeeData: Partial<Employee> = {};
  departments$!: Observable<Department[]>;
  isEditing = false;
  
  // Termination reasons from your original project
  terminationReasons: string[] = ["Resigned", "Terminated", "Contract Ended", "Retired", "Other"];

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    public dialogRef: MatDialogRef<EmployeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Employee>
  ) {
    // Check if data was passed in (meaning we are editing)
    if (data && data.id) {
      this.isEditing = true;
      this.employeeData = { ...data }; // Work on a copy
    }
  }

  ngOnInit(): void {
    this.departments$ = this.departmentService.getDepartments();
  }

  onSave(): void {
    if (!this.employeeData.firstName || !this.employeeData.lastName) {
      alert('First and Last name are required.');
      return;
    }

    // Ensure status is set
    this.employeeData.status = this.employeeData.status || 'Active';
    
    this.employeeService.saveEmployee(this.employeeData as any).subscribe({
      next: () => {
        this.dialogRef.close(true); // Close the dialog and signal success
      },
      error: (err) => {
        console.error('Failed to save employee', err);
        alert('An error occurred while saving.');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(); // Close the dialog without sending a success signal
  }
}