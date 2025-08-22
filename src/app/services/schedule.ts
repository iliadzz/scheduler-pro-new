import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DaySchedule, ShiftAssignment } from '../models/schedule.model';
import { DatePipe } from '@angular/common';

type ScheduleMap = Map<string, DaySchedule>;

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private schedule$ = new BehaviorSubject<ScheduleMap>(new Map());

  constructor(private datePipe: DatePipe) {
    this.loadInitialData();
  }

  getSchedule(): Observable<ScheduleMap> {
    return this.schedule$.asObservable();
  }

  saveAssignment(userId: string, date: string, assignment: ShiftAssignment): Observable<DaySchedule> {
    const currentSchedule = this.schedule$.getValue();
    const key = `${userId}-${date}`;
    const daySchedule = currentSchedule.get(key) || { userId, date, shifts: [] };
    const existingIndex = daySchedule.shifts.findIndex(s => s.assignmentId === assignment.assignmentId);

    if (existingIndex > -1) {
      daySchedule.shifts[existingIndex] = assignment;
    } else {
      daySchedule.shifts.push(assignment);
    }

    currentSchedule.set(key, daySchedule);
    this.schedule$.next(new Map(currentSchedule));
    return of(daySchedule);
  }

  deleteAssignment(userId: string, date: string, assignmentId: string): Observable<boolean> {
    const currentSchedule = this.schedule$.getValue();
    const key = `${userId}-${date}`;
    const daySchedule = currentSchedule.get(key);

    if (!daySchedule) return of(false);

    const initialLength = daySchedule.shifts.length;
    daySchedule.shifts = daySchedule.shifts.filter(s => s.assignmentId !== assignmentId);

    if (daySchedule.shifts.length === 0) {
      currentSchedule.delete(key);
    } else {
      currentSchedule.set(key, daySchedule);
    }

    this.schedule$.next(new Map(currentSchedule));
    return of(daySchedule.shifts.length < initialLength);
  }

  clearWeek(userIds: string[], weekDates: Date[]): Observable<void> {
    const currentSchedule = this.schedule$.getValue();
    let changed = false;
    for (const userId of userIds) {
      for (const date of weekDates) {
        const dateStr = this.datePipe.transform(date, 'yyyy-MM-dd')!;
        const key = `${userId}-${dateStr}`;
        if (currentSchedule.delete(key)) {
          changed = true;
        }
      }
    }
    if (changed) {
      this.schedule$.next(new Map(currentSchedule));
    }
    return of(undefined);
  }

  moveOrCopyAssignment(
    assignment: ShiftAssignment,
    fromUserId: string,
    fromDate: Date,
    toUserId: string,
    toDate: Date,
    mode: 'move' | 'copy'
  ): Observable<void> {
    const currentSchedule = this.schedule$.getValue();
    const fromDateStr = this.datePipe.transform(fromDate, 'yyyy-MM-dd')!;
    const toDateStr = this.datePipe.transform(toDate, 'yyyy-MM-dd')!;
    const fromKey = `${fromUserId}-${fromDateStr}`;
    const toKey = `${toUserId}-${toDateStr}`;

    if (mode === 'copy') {
      const newAssignment = { ...assignment, assignmentId: `assign-${Date.now()}` };
      const toDaySchedule = currentSchedule.get(toKey) || { userId: toUserId, date: toDateStr, shifts: [] };
      toDaySchedule.shifts.push(newAssignment);
      currentSchedule.set(toKey, toDaySchedule);
    } else { // 'move'
      const fromDaySchedule = currentSchedule.get(fromKey);
      if (fromDaySchedule) {
        fromDaySchedule.shifts = fromDaySchedule.shifts.filter(s => s.assignmentId !== assignment.assignmentId);
        if (fromDaySchedule.shifts.length === 0) {
          currentSchedule.delete(fromKey);
        }
      }
      const toDaySchedule = currentSchedule.get(toKey) || { userId: toUserId, date: toDateStr, shifts: [] };
      toDaySchedule.shifts.push(assignment);
      currentSchedule.set(toKey, toDaySchedule);
    }

    this.schedule$.next(new Map(currentSchedule));
    return of(undefined);
  }

  getScheduleForUsersAndDates(userIds: string[], dates: Date[]): Observable<Map<string, DaySchedule>> {
    const currentSchedule = this.schedule$.getValue();
    const result = new Map<string, DaySchedule>();
    for (const userId of userIds) {
      for (const date of dates) {
        const dateStr = this.datePipe.transform(date, 'yyyy-MM-dd')!;
        const key = `${userId}-${dateStr}`;
        if (currentSchedule.has(key)) {
          result.set(key, { ...currentSchedule.get(key)! });
        }
      }
    }
    return of(result);
  }

  restoreShifts(shiftsToRestore: Map<string, DaySchedule>): Observable<void> {
    const currentSchedule = this.schedule$.getValue();
    shiftsToRestore.forEach((daySchedule, key) => {
      currentSchedule.set(key, daySchedule);
    });
    this.schedule$.next(new Map(currentSchedule));
    return of(undefined);
  }

  private loadInitialData() {
    const newSchedule = new Map<string, DaySchedule>();
    const day1: DaySchedule = {
      userId: 'emp-1',
      date: this.getTodayString(0),
      shifts: [{ assignmentId: 'assign-1', type: 'shift', roleId: 'role-1', shiftTemplateId: 'st-1' }]
    };
    const day2: DaySchedule = {
      userId: 'emp-2',
      date: this.getTodayString(1),
      shifts: [{ assignmentId: 'assign-2', type: 'shift', roleId: 'role-3', shiftTemplateId: 'st-2' }]
    };
    newSchedule.set(`${day1.userId}-${day1.date}`, day1);
    newSchedule.set(`${day2.userId}-${day2.date}`, day2);
    this.schedule$.next(newSchedule);
  }

  private getTodayString(dayOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date.toISOString().split('T')[0];
  }
}