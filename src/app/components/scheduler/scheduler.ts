import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

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

// Angular Material Modules
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ShiftFormComponent } from '../shift-form/shift-form';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { provideNativeDateAdapter } from '@angular/material/core';


// This interface defines the final shape of our data for the grid
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

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatDatepickerModule,
    MatMenuModule
  ],
  providers: [
    DatePipe,
    provideNativeDateAdapter()
  ],
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
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.departments$ = this.departmentService.getDepartments();

    this.currentDate$.subscribe(date => {
      this.weekDates = this.getWeek(date);
    });

    this.scheduleRows$ = combineLatest([
      this.currentDate$,
      this.employeeService.getEmployees(),
      this.departmentService.getDepartments(),
      this.scheduleService.getSchedule(),
      this.roleService.getRoles(),
      this.shiftTemplateService.getShiftTemplates()
    ]).pipe(
      map(([date, employees, departments, scheduleMap, roles, templates]) => {
        const weekDates = this.getWeek(date);
        const departmentMap = new Map(departments.map(d => [d.id, d.name]));
        const roleMap = new Map(roles.map(r => [r.id, r]));
        const templateMap = new Map(templates.map(t => [t.id, t]));

        const visibleEmployees = employees.filter(e =>
          e.isVisible &&
          e.status === 'Active' &&
          (this.activeDepartmentIds.has('all') || this.activeDepartmentIds.has(e.departmentId!))
        );

        return visibleEmployees.map(employee => {
          const row: ScheduleRow = {
            employee,
            days: weekDates.map(d => {
              const dateStr = this.datePipe.transform(d, 'yyyy-MM-dd')!;
              const key = `${employee.id}-${dateStr}`;
              const daySchedule = scheduleMap.get(key);

              if (daySchedule) {
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
              }
              return { date: d, schedule: undefined };
            })
          };
          return row;
        });
      })
    );
  }
  
  toggleDepartmentFilter(deptId: string): void {
      if (this.activeDepartmentIds.has('all')) {
          this.activeDepartmentIds.clear();
          this.activeDepartmentIds.add(deptId);
      } else {
          if (this.activeDepartmentIds.has(deptId)) {
              this.activeDepartmentIds.delete(deptId);
          } else {
              this.activeDepartmentIds.add(deptId);
          }
      }

      if (this.activeDepartmentIds.size === 0) {
          this.activeDepartmentIds.add('all');
      }
      
      this.currentDate$.next(this.currentDate$.getValue());
  }

  isDepartmentActive(deptId: string): boolean {
    return this.activeDepartmentIds.has(deptId) || this.activeDepartmentIds.has('all');
  }

  openShiftForm(userId: string, date: Date, assignment?: ShiftAssignment): void {
    const dateStr = this.datePipe.transform(date, 'yyyy-MM-dd')!;
    const dialogRef = this.dialog.open(ShiftFormComponent, {
      width: '500px',
      data: {
        userId,
        date: dateStr,
        assignment: assignment ? { ...assignment } : null
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentDate$.next(this.currentDate$.getValue());
      }
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
  
  // --- THIS IS THE MISSING METHOD ---
  handleDateChange(date: Date | null): void {
    if (date) {
      this.currentDate$.next(date);
    }
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