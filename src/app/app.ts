import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { DepartmentsComponent } from './components/departments/departments';
import { RolesComponent } from './components/roles/roles';
import { EmployeesComponent } from './components/employees/employees';
import { ShiftTemplatesComponent } from './components/shift-templates/shift-templates';
import { SchedulerComponent } from './components/scheduler/scheduler';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatTabsModule,
    MatButtonModule,
    SchedulerComponent,
    DepartmentsComponent,
    RolesComponent,
    EmployeesComponent,
    ShiftTemplatesComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('scheduler-pro');
  selectedTabIndex: number = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedIndex = localStorage.getItem('lastActiveTab');
      if (savedIndex !== null) {
        this.selectedTabIndex = +savedIndex;
      }
    }
  }

  onTabChange(index: number): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lastActiveTab', index.toString());
    }
  }
}