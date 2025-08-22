import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DaySchedule, ShiftAssignment } from '../models/schedule.model';

// Using a Map for schedule data is more efficient for lookups
// The key will be a string like "userId-YYYY-MM-DD"
type ScheduleMap = Map<string, DaySchedule>;

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private schedule$ = new BehaviorSubject<ScheduleMap>(new Map());

  constructor() {
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
      // Update existing assignment
      daySchedule.shifts[existingIndex] = assignment;
    } else {
      // Add new assignment
      daySchedule.shifts.push(assignment);
    }

    currentSchedule.set(key, daySchedule);
    this.schedule$.next(new Map(currentSchedule)); // Emit a new map to trigger updates
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
      currentSchedule.delete(key); // Clean up empty days
    } else {
      currentSchedule.set(key, daySchedule);
    }

    this.schedule$.next(new Map(currentSchedule));
    return of(daySchedule.shifts.length < initialLength);
  }

  private loadInitialData() {
    // Mock data representing a few shifts for our mock employees
    const newSchedule = new Map<string, DaySchedule>();

    const day1: DaySchedule = {
      userId: 'emp-1', // Jane Doe
      date: this.getTodayString(0), // Today
      shifts: [
        { assignmentId: 'assign-1', type: 'shift', shiftTemplateId: 'st-1' } // Morning Shift
      ]
    };

    const day2: DaySchedule = {
      userId: 'emp-2', // John Smith
      date: this.getTodayString(1), // Tomorrow
      shifts: [
        { assignmentId: 'assign-2', type: 'shift', shiftTemplateId: 'st-2' } // Evening Shift
      ]
    };

    newSchedule.set(`${day1.userId}-${day1.date}`, day1);
    newSchedule.set(`${day2.userId}-${day2.date}`, day2);

    this.schedule$.next(newSchedule);
  }

  // Helper to get dates relative to today for mock data
  private getTodayString(dayOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date.toISOString().split('T')[0];
  }
}