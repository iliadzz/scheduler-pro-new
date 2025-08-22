import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Role } from '../../models/role.model';
import { ShiftTemplate } from '../../models/shift-template.model';
import { RoleService } from '../../services/role';
import { ShiftTemplateService } from '../../services/shift-template';
import { ScheduleService } from '../../services/schedule';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-shift-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule
  ],
  templateUrl: './shift-form.html',
  styleUrls: ['./shift-form.css']
})
export class ShiftFormComponent implements OnInit {
  assignShiftForm: FormGroup;
  timeOffForm: FormGroup;
  roles$!: Observable<Role[]>;
  templates$!: Observable<ShiftTemplate[]>;
  selectedTab = 0; // 0 for Assign Shift, 1 for Time Off

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private roleService: RoleService,
    private shiftTemplateService: ShiftTemplateService,
    public dialogRef: MatDialogRef<ShiftFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.assignShiftForm = this.fb.group({
      roleId: [''],
      shiftTemplateId: ['']
    });

    this.timeOffForm = this.fb.group({
      reason: ['']
    });
  }

  ngOnInit(): void {
    this.roles$ = this.roleService.getRoles();
    this.templates$ = this.shiftTemplateService.getShiftTemplates();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save(): void {
    const newAssignment = {
      assignmentId: this.data.assignment?.assignmentId || `assign-${Date.now()}`,
      type: this.selectedTab === 0 ? 'shift' : 'time_off',
      ...this.assignShiftForm.value,
      ...this.timeOffForm.value
    };
    
    this.scheduleService.saveAssignment(this.data.userId, this.data.date, newAssignment)
      .subscribe(() => this.dialogRef.close(true));
  }

  isSaveDisabled(): boolean {
    if (this.selectedTab === 0) {
      return !this.assignShiftForm.value.roleId || !this.assignShiftForm.value.shiftTemplateId;
    } else {
      return !this.timeOffForm.value.reason;
    }
  }
}