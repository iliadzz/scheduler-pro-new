import { Component, signal } from '@angular/core';

// --- CHANGES START HERE ---

// 1. Import the necessary Angular Material module for tabs
import { MatTabsModule } from '@angular/material/tabs';

// 2. Import both of your custom components
import { DepartmentsComponent } from './components/departments/departments';
import { RolesComponent } from './components/roles/roles';
import { EmployeesComponent } from './components/employees/employees'; // <-- ADD THIS
import { ShiftTemplatesComponent } from './components/shift-templates/shift-templates'; // <-- ADD THIS
import { SchedulerComponent } from './components/scheduler/scheduler'; // <-- ADD THIS

// --- CHANGES END HERE ---


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    // 3. Add the modules to the imports array
    MatTabsModule,
    SchedulerComponent, // Should be the first thing we see.
    DepartmentsComponent,
    RolesComponent,
    EmployeesComponent, // <-- ADD THIS
    ShiftTemplatesComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('scheduler-pro');
}