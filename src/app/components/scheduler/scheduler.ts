import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, first } from 'rxjs';
import { map } from 'rxjs/operators';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

// Models and Services
import { Employee } from '../../models/employee.model';
import { Department } from '../../models/department.model';
import { Role } from '../../models/role.model';
import { ShiftTemplate } from '../../models/shift-template.model';
import { DaySchedule, ShiftAssignment } from '../../models/schedule.model';
import { EmployeeService } from '../../services/employee';
import { DepartmentService } from '../../services/department';
import { RoleService } from '../../services/role';
import { ShiftTemplateService } from '../../services/shift-template';
import { ScheduleService } from '../../services/schedule';
import { HistoryService } from '../../services/history.service';
import { MoveOrCopyAssignmentCommand } from '../../services/schedule.commands';

// Angular Material Modules
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ShiftFormComponent } from '../shift-form/shift-form';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

export interface EnrichedShiftAssignment extends ShiftAssignment {
  startTime?: string;
  endTime?: string;
  roleName?: string;
  roleColor?: string;
}

export interface EnrichedDaySchedule extends DaySchedule {
  shifts: EnrichedShiftAssignment[];
}

export interface ScheduleRow {
  employee: Employee;
  days: {
    date: Date;
    schedule?: EnrichedDaySchedule;
  }[];
}

export interface DropListData {
  userId: string;
  date: Date;
  schedule: EnrichedDaySchedule | undefined;
}

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatCardModule,
    MatDialogModule, MatDatepickerModule, MatMenuModule, DragDropModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './scheduler.html',
  styleUrls: ['./scheduler.css']
})
export class SchedulerComponent implements OnInit {

  private currentDate$ = new BehaviorSubject<Date>(new Date());
  weekDates: Date[] = [];
  scheduleRows$!: Observable<ScheduleRow[]>;
  departments$!: Observable<Department[]>;
  activeDepartmentIds = new Set<string>(['all']);

  constructor(
    private datePipe: DatePipe,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private scheduleService: ScheduleService,
    private roleService: RoleService,
    private shiftTemplateService: ShiftTemplateService,
    private dialog: MatDialog,
    public historyService: HistoryService // Made public to be accessible in the template
  ) { }

  ngOnInit(): void {
    this.departments$ = this.departmentService.getDepartments();
    this.currentDate$.subscribe(date => this.weekDates = this.getWeek(date));

    this.scheduleRows$ = combineLatest([
      this.currentDate$,
      this.employeeService.getEmployees(),
      this.scheduleService.getSchedule(),
      this.roleService.getRoles(),
      this.shiftTemplateService.getShiftTemplates()
    ]).pipe(
      map(([date, employees, scheduleMap, roles, templates]) => {
        const weekDates = this.getWeek(date);
        const roleMap = new Map(roles.map(r => [r.id, r]));
        const templateMap = new Map(templates.map(t => [t.id, t]));

        const visibleEmployees = employees.filter(e =>
          e.isVisible && e.status === 'Active' &&
          (this.activeDepartmentIds.has('all') || this.activeDepartmentIds.has(e.departmentId!))
        );

        return visibleEmployees.map(employee => ({
          employee,
          days: weekDates.map(d => {
            const dateStr = this.datePipe.transform(d, 'yyyy-MM-dd')!;
            const key = `${employee.id}-${dateStr}`;
            const daySchedule = scheduleMap.get(key);
            
            if (!daySchedule) return { date: d, schedule: undefined };

            const enrichedShifts = daySchedule.shifts.map(shift => {
              if (shift.type === 'shift') {
                const template = shift.shiftTemplateId ? templateMap.get(shift.shiftTemplateId) : null;
                const role = shift.roleId ? roleMap.get(shift.roleId) : null;
                return {
                  ...shift,
                  startTime: shift.isCustom ? shift.customStart : template?.start,
                  endTime: shift.isCustom ? shift.customEnd : template?.end,
                  roleName: role?.name || 'N/A',
                  roleColor: role?.color || '#a0a0a0'
                };
              }
              return shift;
            });
            return { date: d, schedule: { ...daySchedule, shifts: enrichedShifts } };
          })
        }));
      })
    );
  }

  toggleDepartmentFilter(deptId: string): void {
    if (this.activeDepartmentIds.has('all')) {
      this.activeDepartmentIds.clear();
      this.activeDepartmentIds.add(deptId);
    } else {
      if (this.activeDepartmentIds.has(deptId)) this.activeDepartmentIds.delete(deptId);
      else this.activeDepartmentIds.add(deptId);
    }
    if (this.activeDepartmentIds.size === 0) this.activeDepartmentIds.add('all');
    this.currentDate$.next(this.currentDate$.getValue());
  }

  isDepartmentActive(deptId: string): boolean {
    return this.activeDepartmentIds.has(deptId) || this.activeDepartmentIds.has('all');
  }

  openShiftForm(userId: string, date: Date, assignment?: ShiftAssignment): void {
    const dateStr = this.datePipe.transform(date, 'yyyy-MM-dd')!;
    const dialogRef = this.dialog.open(ShiftFormComponent, {
      width: '500px',
      data: { userId, date: dateStr, assignment: assignment ? { ...assignment } : null }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.currentDate$.next(this.currentDate$.getValue());
    });
  }

  changeWeek(offset: number): void {
    const newDate = new Date(this.currentDate$.getValue());
    newDate.setDate(newDate.getDate() + offset);
    this.currentDate$.next(newDate);
  }

  goToThisWeek(): void {
    this.currentDate$.next(new Date());
  }

  handleDateChange(date: Date | null): void {
    if (date) this.currentDate$.next(date);
  }

  onClearWeek(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Clear',
        message: 'Are you sure you want to clear all shifts for all visible employees for this week?',
        confirmText: 'Clear All'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.scheduleRows$.pipe(first()).subscribe(rows => {
          const userIds = rows.map(row => row.employee.id);
          if (userIds.length > 0) {
            this.scheduleService.clearWeek(userIds, this.weekDates).subscribe();
          }
        });
      }
    });
  }

  onShiftDrop(event: CdkDragDrop<DropListData>): void {
    if (event.previousContainer === event.container) return;
    
    const fromData = event.previousContainer.data;
    const toData = event.container.data;
    const assignment = event.item.data as ShiftAssignment;
    const mouseEvent = event.event as MouseEvent;
    
    const isCopy = mouseEvent.ctrlKey || mouseEvent.metaKey;
    const mode = isCopy ? 'copy' : 'move';

    const command = new MoveOrCopyAssignmentCommand(
      this.scheduleService,
      assignment,
      fromData.userId, fromData.date,
      toData.userId, toData.date,
      mode
    );

    this.historyService.execute(command);
  }

  private getWeek(date: Date): Date[] {
    const week: Date[] = [];
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(start);
      nextDay.setDate(start.getDate() + i);
      week.push(nextDay);
    }
    return week;
  }
}