import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

// Import Models and Services
import { ShiftTemplate } from '../../models/shift-template.model';
import { Department } from '../../models/department.model';
import { ShiftTemplateService } from '../../services/shift-template';
import { DepartmentService } from '../../services/department';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-shift-templates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule
  ],
  templateUrl: './shift-templates.html',
  styleUrls: ['./shift-templates.css']
})
export class ShiftTemplatesComponent implements OnInit {

  templates$!: Observable<ShiftTemplate[]>;
  departments$!: Observable<Department[]>;

  editingTemplate: Partial<ShiftTemplate> = { availableDays: [], departmentIds: [] };
  isEditing = false;
  
  // Define the days of the week for the chips
  daysOfWeek = [
    { key: 'mon', name: 'Mon' }, { key: 'tue', name: 'Tue' },
    { key: 'wed', name: 'Wed' }, { key: 'thu', name: 'Thu' },
    { key: 'fri', name: 'Fri' }, { key: 'sat', name: 'Sat' },
    { key: 'sun', name: 'Sun' }
  ];

  constructor(
    private shiftTemplateService: ShiftTemplateService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.templates$ = this.shiftTemplateService.getShiftTemplates();
    this.departments$ = this.departmentService.getDepartments();
  }

  onEdit(template: ShiftTemplate): void {
    this.editingTemplate = { ...template };
    this.isEditing = true;
  }

  onDelete(templateId: string): void {
    if (confirm('Are you sure you want to delete this shift template?')) {
      this.shiftTemplateService.deleteShiftTemplate(templateId).subscribe();
    }
  }

  onSave(): void {
    if (!this.editingTemplate.name || !this.editingTemplate.start || !this.editingTemplate.end) {
      alert('Template name, start time, and end time are required.');
      return;
    }

    // Ensure departmentIds is an array
    if (!Array.isArray(this.editingTemplate.departmentIds)) {
        this.editingTemplate.departmentIds = [];
    }

    const templateToSave = { ...this.editingTemplate };
    
    this.shiftTemplateService.saveShiftTemplate(templateToSave as any).subscribe({
      next: () => {
        this.resetForm();
      },
      error: (err) => {
        console.error('Error saving shift template:', err);
        alert('Failed to save shift template.');
      }
    });
  }

  resetForm(): void {
    this.editingTemplate = { availableDays: [], departmentIds: [] };
    this.isEditing = false;
  }
}