import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Role } from '../../models/role.model';
import { ShiftTemplate } from '../../models/shift-template.model';
import { ShiftAssignment } from '../../models/schedule.model';
import { RoleService } from '../../services/role';
import { ShiftTemplateService } from '../../services/shift-template';
import { ScheduleService } from '../../services/schedule';
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
    ReactiveFormsModule,
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

  templateShiftForm: FormGroup;
  customShiftForm: FormGroup;
  timeOffForm: FormGroup;

  roles$!: Observable<Role[]>;
  templates$!: Observable<ShiftTemplate[]>;
  selectedTabIndex: number = 0;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private templateService: ShiftTemplateService,
    private scheduleService: ScheduleService,
    public dialogRef: MatDialogRef<ShiftFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string, date: string, assignment?: ShiftAssignment }
  ) {
    this.templateShiftForm = this.fb.group({
      roleId: [null, Validators.required],
      shiftTemplateId: [null, Validators.required],
    });

    this.customShiftForm = this.fb.group({
        roleId: [null, Validators.required],
        customStart: [null, Validators.required],
        customEnd: [null, Validators.required]
    });

    this.timeOffForm = this.fb.group({
      reason: [null, Validators.required],
    });

    if (data.assignment) {
      if (data.assignment.type === 'shift') {
        if (data.assignment.isCustom) {
          this.customShiftForm.patchValue(data.assignment);
          this.selectedTabIndex = 1;
        } else {
          this.templateShiftForm.patchValue(data.assignment);
          this.selectedTabIndex = 0;
        }
      } else if (data.assignment.type === 'time_off') {
        this.timeOffForm.patchValue(data.assignment);
        this.selectedTabIndex = 2;
      }
    }
  }

  ngOnInit(): void {
    this.roles$ = this.roleService.getRoles();
    this.templates$ = this.templateService.getShiftTemplates();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save(): void {
    let assignmentToSave: Partial<ShiftAssignment> | null = null;
    
    // Logic for the assign shift tab
    if (this.selectedTabIndex === 0 && this.templateShiftForm.valid) {
      assignmentToSave = {
        ...this.templateShiftForm.value,
        isCustom: false,
        customStart: null,
        customEnd: null,
        assignmentId: this.data.assignment?.assignmentId || `assign-${Date.now()}`,
        type: 'shift'
      };
    } 
    // Logic for the custom shift tab
    else if (this.selectedTabIndex === 1 && this.customShiftForm.valid) {
      assignmentToSave = {
        ...this.customShiftForm.value,
        isCustom: true,
        shiftTemplateId: null,
        assignmentId: this.data.assignment?.assignmentId || `assign-${Date.now()}`,
        type: 'shift'
      };
    } 
    // Logic for the time off tab
    else if (this.selectedTabIndex === 2 && this.timeOffForm.valid) {
      assignmentToSave = {
        ...this.timeOffForm.value,
        assignmentId: this.data.assignment?.assignmentId || `assign-${Date.now()}`,
        type: 'time_off'
      };
    }
    
    if (assignmentToSave) {
      this.scheduleService.saveAssignment(this.data.userId, this.data.date, assignmentToSave as ShiftAssignment).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  isSaveDisabled(): boolean {
    if (this.selectedTabIndex === 0) {
      return this.templateShiftForm.invalid;
    } else if (this.selectedTabIndex === 1) {
      return this.customShiftForm.invalid;
    } else if (this.selectedTabIndex === 2) {
      return this.timeOffForm.invalid;
    }
    return true; // Fallback
  }

  // Update the selectedTabIndex when the tab changes
  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }
}