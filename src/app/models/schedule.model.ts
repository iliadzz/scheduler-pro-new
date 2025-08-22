export interface ShiftAssignment {
  assignmentId: string;
  type: 'shift' | 'time_off';
  roleId?: string;
  shiftTemplateId?: string;
  isCustom?: boolean;
  customStart?: string; // "HH:MM"
  customEnd?: string;   // "HH:MM"
  reason?: 'Vacation' | 'Sick Leave' | 'Personal Day' | 'Unpaid Time Off';
}

// This defines the structure for a full day's schedule for one employee
export interface DaySchedule {
  userId: string;
  date: string; // "YYYY-MM-DD"
  shifts: ShiftAssignment[];
}