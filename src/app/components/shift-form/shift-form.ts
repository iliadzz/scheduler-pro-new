import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SettingsService } from '../../services/settings';

@Component({
  selector: 'app-shift-form',
  standalone: true,
  templateUrl: './shift-form.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule,
    MatDialogModule
  ]
})
export class ShiftFormComponent implements OnInit {
  selectedTabIndex = 0;
  is12h = false;

  // Forms
  templateShiftForm!: FormGroup;
  customShiftForm!: FormGroup;
  timeOffForm!: FormGroup;

  // Prefer arrays provided by the opener via MAT_DIALOG_DATA to avoid service coupling
  get rolesList(): Array<{ id: any; name: string }> {
    return (this.data?.roles as Array<{ id: any; name: string }>) ?? [];
  }
  get templatesList(): Array<{ id: any; name: string }> {
    return (this.data?.templates as Array<{ id: any; name: string }>) ?? [];
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ShiftFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.settingsService.load();
    this.is12h = this.settingsService.timeFormat === '12h';

    // Forms
    this.templateShiftForm = this.fb.group({
      roleId: [null, Validators.required],
      shiftTemplateId: [null, Validators.required],
    });

    this.customShiftForm = this.fb.group({
      roleId: [null, Validators.required],
      customStartHour: [null, Validators.required],
      customStartMinute: [null, Validators.required],
      customStartPeriod: ['AM'], // only used in 12h mode
      customEndHour: [null, Validators.required],
      customEndMinute: [null, Validators.required],
      customEndPeriod: ['PM'],   // only used in 12h mode
    });

    this.timeOffForm = this.fb.group({
      reason: ['']
    });

    // Hydrate when editing
    if (this.data?.assignment) {
      const a = this.data.assignment;
      if (a.shiftTemplateId) {
        this.selectedTabIndex = 0;
        this.templateShiftForm.patchValue({ roleId: a.roleId, shiftTemplateId: a.shiftTemplateId });
      } else if (a.customStart && a.customEnd) {
        this.selectedTabIndex = 1;
        this.patchFromHhMm(a.customStart, true);
        this.patchFromHhMm(a.customEnd, false);
        this.customShiftForm.patchValue({ roleId: a.roleId });
      } else if (a.type === 'timeOff') {
        this.selectedTabIndex = 2;
        this.timeOffForm.patchValue({ reason: a.reason ?? '' });
      }
    }
  }

  onTabChange(idx: number) {
    this.selectedTabIndex = idx;
  }

  onNoClick() {
    this.dialogRef.close();
  }

  isSaveDisabled(): boolean {
    if (this.selectedTabIndex === 0) return !this.templateShiftForm.valid;
    if (this.selectedTabIndex === 1) return !this.customShiftForm.valid;
    if (this.selectedTabIndex === 2) return !this.timeOffForm.valid;
    return true;
  }

  save() {
    let assignmentToSave: any = null;

    if (this.selectedTabIndex === 0 && this.templateShiftForm.valid) {
      const v = this.templateShiftForm.value as any;
      assignmentToSave = {
        type: 'shift',
        roleId: v.roleId,
        shiftTemplateId: v.shiftTemplateId,
        isCustom: false,
        assignmentId: this.data?.assignment?.assignmentId ?? `assign-${Date.now()}`
      };
    } else if (this.selectedTabIndex === 1 && this.customShiftForm.valid) {
      const v = this.customShiftForm.value as any;
      const start = this.toHhMm(v.customStartHour, v.customStartMinute, v.customStartPeriod);
      const end = this.toHhMm(v.customEndHour, v.customEndMinute, v.customEndPeriod);
      assignmentToSave = {
        type: 'shift',
        roleId: v.roleId,
        customStart: start,
        customEnd: end,
        isCustom: true,
        shiftTemplateId: null,
        assignmentId: this.data?.assignment?.assignmentId ?? `assign-${Date.now()}`
      };
    } else if (this.selectedTabIndex === 2 && this.timeOffForm.valid) {
      const v = this.timeOffForm.value as any;
      assignmentToSave = {
        type: 'timeOff',
        reason: v.reason ?? '',
        assignmentId: this.data?.assignment?.assignmentId ?? `assign-${Date.now()}`
      };
    }

    if (assignmentToSave) {
      this.dialogRef.close(assignmentToSave);
    }
  }

  private toHhMm(hour: string | number, minute: string | number, period?: 'AM'|'PM'): string {
    let h = typeof hour === 'number' ? hour : parseInt(hour as string, 10);
    const m = typeof minute === 'number' ? minute : parseInt(minute as string, 10);
    if (this.is12h) {
      if (period === 'AM' && h === 12) h = 0;
      if (period === 'PM' && h !== 12) h += 12;
    }
    return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
  }

  private patchFromHhMm(hhmm: string, isStart: boolean) {
    const [H, M] = (hhmm ?? '').split(':').map(x => parseInt(x, 10));
    if (Number.isNaN(H) || Number.isNaN(M)) return;

    if (this.is12h) {
      const period: 'AM'|'PM' = H >= 12 ? 'PM' : 'AM';
      const h12 = H % 12 === 0 ? 12 : H % 12;
      if (isStart) {
        this.customShiftForm.patchValue({ customStartHour: String(h12).padStart(2,'0'), customStartMinute: String(M).padStart(2,'0'), customStartPeriod: period });
      } else {
        this.customShiftForm.patchValue({ customEndHour: String(h12).padStart(2,'0'), customEndMinute: String(M).padStart(2,'0'), customEndPeriod: period });
      }
    } else {
      if (isStart) {
        this.customShiftForm.patchValue({ customStartHour: String(H).padStart(2,'0'), customStartMinute: String(M).padStart(2,'0') });
      } else {
        this.customShiftForm.patchValue({ customEndHour: String(H).padStart(2,'0'), customEndMinute: String(M).padStart(2,'0') });
      }
    }
  }
}
