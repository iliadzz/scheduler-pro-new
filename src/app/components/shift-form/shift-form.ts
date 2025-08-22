import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

// Import Models and Services
import { Role } from '../../models/role.model';
import { ShiftTemplate } from '../../models/shift-template.model';
import { Department } from '../../models/department.model';
import { ShiftAssignment } from '../../models/schedule.model';
import { RoleService } from '../../services/role';
import { ShiftTemplateService } from '../../services/shift-template';
import { DepartmentService } from '../../services/department';
import { ScheduleService } from '../../services/schedule';

// Import Angular Material Modules
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-shift-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule,
    MatCheckboxModule
  ],
  templateUrl: './shift-form.html',
  styleUrls: ['./shift-form.css']
})
export class ShiftFormComponent implements OnInit {

  // Data for dropdowns
  roles$!: Observable<Role[]>;
  templates$!: Observable<ShiftTemplate[]>;
  departments$!: Observable<Department[]>;

  // Form data
  assignment: Partial<ShiftAssignment> = { type: 'shift' };
  selectedTemplateId: string = '';
  selectedRoleId: string = '';

  // Injected data from the scheduler component
  userId: string;
  date: string;

  constructor(
    private roleService: RoleService,
    private templateService: ShiftTemplateService,
    private departmentService: DepartmentService,
    private scheduleService: ScheduleService,
    public dialogRef: MatDialogRef<ShiftFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string, date: string, assignment?: ShiftAssignment }
  ) {
    this.userId = data.userId;
    this.date = data.date;

    // If we are editing, populate the form
    if (data.assignment) {
      this.assignment = { ...data.assignment };
      this.selectedRoleId = data.assignment.roleId || '';
      this.selectedTemplateId = data.assignment.shiftTemplateId || '';
    }
  }

  ngOnInit(): void {
    // Load all necessary data for the form's dropdowns
    this.roles$ = this.roleService.getRoles();
    this.templates$ = this.templateService.getShiftTemplates();
    this.departments$ = this.departmentService.getDepartments();
  }

  onSave(): void {
    const finalAssignment: ShiftAssignment = {
      ...this.assignment,
      assignmentId: this.assignment.assignmentId || `assign-${Date.now()}`,
      roleId: this.selectedRoleId,
      shiftTemplateId: this.selectedTemplateId
    } as ShiftAssignment;

    this.scheduleService.saveAssignment(this.userId, this.date, finalAssignment).subscribe(() => {
      this.dialogRef.close(true); // Close and signal success
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}