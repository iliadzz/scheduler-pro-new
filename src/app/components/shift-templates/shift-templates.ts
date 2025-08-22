import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Added FormBuilder, FormGroup, Validators, ReactiveFormsModule
import { Observable, BehaviorSubject } from 'rxjs';

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
import { MatSelectModule } from '@angular/material/select'; // Added MatSelectModule

@Component({
  selector: 'app-shift-templates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // ADD this import
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatSelectModule // ADD this import
  ],
  templateUrl: './shift-templates.html',
  styleUrls: ['./shift-templates.css']
})
export class ShiftTemplatesComponent implements OnInit {

  templates$!: Observable<ShiftTemplate[]>;
  departments$!: Observable<Department[]>;

  // Use a FormGroup instead of Partial<ShiftTemplate>
  templateForm: FormGroup;
  
  // Define the days of the week for the chips
  daysOfWeek = [
    { key: 'mon', name: 'Mon' }, { key: 'tue', name: 'Tue' },
    { key: 'wed', name: 'Wed' }, { key: 'thu', name: 'Thu' },
    { key: 'fri', name: 'Fri' }, { key: 'sat', name: 'Sat' },
    { key: 'sun', name: 'Sun' }
  ];

  constructor(
    private fb: FormBuilder, // Inject FormBuilder
    private shiftTemplateService: ShiftTemplateService,
    private departmentService: DepartmentService
  ) {
    // Initialize the form with FormBuilder
    this.templateForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required],
      departmentIds: [[]],
      availableDays: [[]]
    });
  }

  ngOnInit(): void {
    this.templates$ = this.shiftTemplateService.getShiftTemplates();
    this.departments$ = this.departmentService.getDepartments();
  }

  onEdit(template: ShiftTemplate): void {
    // Use patchValue to set form values
    this.templateForm.patchValue(template);
  }

  onDelete(templateId: string): void {
    if (confirm('Are you sure you want to delete this shift template?')) {
      this.shiftTemplateService.deleteShiftTemplate(templateId).subscribe(() => {
        this.resetForm();
      });
    }
  }

  onSave(): void {
    if (this.templateForm.valid) {
      const templateToSave = { ...this.templateForm.value };
      
      // Correct the service method name to saveShiftTemplate
      this.shiftTemplateService.saveShiftTemplate(templateToSave).subscribe({
        next: () => {
          this.resetForm();
        },
        error: (err) => {
          console.error('Error saving shift template:', err);
          alert('Failed to save shift template.');
        }
      });
    }
  }

  resetForm(): void {
    this.templateForm.reset({ availableDays: [], departmentIds: [] });
  }
}