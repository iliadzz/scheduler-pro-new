import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { ShiftTemplate } from '../../models/shift-template.model';
import { Role } from '../../models/role.model';
import { ShiftTemplateService } from '../../services/shift-template';
import { RoleService } from '../../services/role';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-shift-templates',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './shift-templates.html',
  styleUrls: ['./shift-templates.css']
})
export class ShiftTemplatesComponent implements OnInit {
  templates$!: Observable<ShiftTemplate[]>;
  roles$!: Observable<Role[]>;
  selectedTemplate$ = new BehaviorSubject<ShiftTemplate | null>(null);
  templateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private templateService: ShiftTemplateService,
    private roleService: RoleService
  ) {
    this.templateForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required],
      roleId: ['', Validators.required],
      mon: [false], tue: [false], wed: [false], thu: [false], 
      fri: [false], sat: [false], sun: [false]
    });
  }

  ngOnInit(): void {
    this.templates$ = this.templateService.getShiftTemplates();
    this.roles$ = this.roleService.getRoles();
  }

  selectTemplate(template: ShiftTemplate): void {
    this.selectedTemplate$.next(template);
    const formValues: any = { ...template };
    template.availableDays.forEach(day => formValues[day] = true);
    this.templateForm.patchValue(formValues);
  }

  clearSelection(): void {
    this.selectedTemplate$.next(null);
    this.templateForm.reset();
  }

  saveTemplate(): void {
    if (this.templateForm.valid) {
      const formValue = this.templateForm.value;
      const availableDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
        .filter(day => formValue[day]);
      
      const templateData: ShiftTemplate = {
        id: formValue.id,
        name: formValue.name,
        start: formValue.start,
        end: formValue.end,
        roleId: formValue.roleId,
        availableDays: availableDays as any
      };
      
      this.templateService.saveTemplate(templateData).subscribe(() => {
        this.clearSelection();
      });
    }
  }
}