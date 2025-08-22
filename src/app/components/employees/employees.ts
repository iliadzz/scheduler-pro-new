import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

// Import Models and Services
import { Employee } from '../../models/employee.model';
import { Department } from '../../models/department.model';
import { EmployeeService } from '../../services/employee';
import { DepartmentService } from '../../services/department';
import { EmployeeFormComponent } from '../employee-form/employee-form';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule
  ],
  templateUrl: './employees.html',
  styleUrls: ['./employees.css']
})
export class EmployeesComponent implements OnInit {

  employees$!: Observable<any[]>;
  displayedColumns: string[] = ['displayName', 'department', 'role', 'status', 'actions'];

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private dialog: MatDialog // Inject the MatDialog service
  ) { }

  ngOnInit(): void {
    this.loadDataWithDepartmentNames();
  }

  loadDataWithDepartmentNames(): void {
    // This is more advanced: We are combining two streams of data.
    // We get the employees, and for each employee, we look up their department name.
    this.employees$ = combineLatest([
      this.employeeService.getEmployees(),
      this.departmentService.getDepartments()
    ]).pipe(
      map(([employees, departments]) => {
        const departmentMap = new Map(departments.map(d => [d.id, d.name]));
        return employees.map(employee => ({
          ...employee,
          departmentName: departmentMap.get(employee.departmentId ?? '') || 'N/A'
        }));
      })
    );
  }

  openEmployeeForm(employee?: Employee): void {
    const dialogRef = this.dialog.open(EmployeeFormComponent, {
      width: '800px',
      data: employee ? { ...employee } : {} // Pass a copy of the employee data
    });

    dialogRef.afterClosed().subscribe(result => {
      // This code runs after the dialog is closed.
      // If the form returns a 'true' result, it means we should save and refresh.
      if (result) {
        this.loadDataWithDepartmentNames();
      }
    });
  }

  onDelete(employeeId: string): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(employeeId).subscribe();
    }
  }
}