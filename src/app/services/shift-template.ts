import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ShiftTemplate } from '../models/shift-template.model';

@Injectable({
  providedIn: 'root'
})
export class ShiftTemplateService {

  private shiftTemplates$ = new BehaviorSubject<ShiftTemplate[]>([]);

  constructor() {
    this.loadInitialData();
  }

  getShiftTemplates(): Observable<ShiftTemplate[]> {
    return this.shiftTemplates$.asObservable();
  }

  saveShiftTemplate(template: Omit<ShiftTemplate, 'id'> & { id?: string }): Observable<ShiftTemplate> {
    const templates = this.shiftTemplates$.getValue();
    if (template.id) {
      const index = templates.findIndex(t => t.id === template.id);
      if (index > -1) {
        templates[index] = { ...templates[index], ...template };
        this.shiftTemplates$.next([...templates]);
        return of(templates[index]);
      }
    } else {
      const newTemplate: ShiftTemplate = {
        ...template,
        id: `st-${Date.now()}`,
      };
      this.shiftTemplates$.next([...templates, newTemplate]);
      return of(newTemplate);
    }
    return of(null as any);
  }

  deleteShiftTemplate(templateId: string): Observable<boolean> {
    let templates = this.shiftTemplates$.getValue();
    const initialLength = templates.length;
    templates = templates.filter(t => t.id !== templateId);
    this.shiftTemplates$.next(templates);
    return of(templates.length < initialLength);
  }


  private loadInitialData() {
    const mockTemplates: ShiftTemplate[] = [
      {
        id: 'st-1',
        name: 'Morning Shift',
        start: '08:00',
        end: '16:00',
        departmentIds: ['dept-1'], // FOH
        availableDays: ['mon', 'tue', 'wed', 'thu', 'fri']
      },
      {
        id: 'st-2',
        name: 'Evening Shift',
        start: '16:00',
        end: '23:00',
        departmentIds: ['dept-1', 'dept-2'], // FOH & BOH
        availableDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      },
      {
        id: 'st-3',
        name: 'Weekend Brunch',
        start: '10:00',
        end: '15:00',
        departmentIds: ['dept-2'], // BOH
        availableDays: ['sat', 'sun']
      },
    ];
    this.shiftTemplates$.next(mockTemplates);
  }
}