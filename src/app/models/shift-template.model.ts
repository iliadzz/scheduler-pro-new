export interface ShiftTemplate {
  id: string;
  name: string;
  start: string; // e.g., "09:00"
  end: string;   // e.g., "17:00"
  departmentIds: string[];
  availableDays: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
}