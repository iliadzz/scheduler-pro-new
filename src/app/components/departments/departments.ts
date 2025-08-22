import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Department } from '../../models/department.model';
import { DepartmentService } from '../../services/department';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    DragDropModule // Correctly added here
  ],
  templateUrl: './departments.html',
  styleUrls: ['./departments.css']
})
export class DepartmentsComponent implements OnInit {

  // An observable that will hold our list of departments.
  departments$!: Observable<Department[]>;

  // This object will hold the data for the "Add/Edit" form.
  editingDepartment: Partial<Department> = {};
  isEditing = false;

  // We "inject" the DepartmentService so this component can use it.
  constructor(private departmentService: DepartmentService) { }

  ngOnInit(): void {
    // When the component initializes, get the departments from the service.
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departments$ = this.departmentService.getDepartments();
  }

  onEdit(department: Department): void {
    // When the edit button is clicked, copy the department's data
    // into our form object and set the editing flag.
    this.editingDepartment = { ...department };
    this.isEditing = true;
  }

  onDelete(departmentId: string): void {
    if (confirm('Are you sure you want to delete this department?')) {
      this.departmentService.deleteDepartment(departmentId).subscribe();
    }
  }

  // --- NEW METHOD FOR DRAG & DROP ---
  onDrop(event: CdkDragDrop<Department[]>, departments: Department[]): void {
    // This function reorders the array in place
    moveItemInArray(departments, event.previousIndex, event.currentIndex);

    // After reordering, we need to update the sortOrder property for each item
    const updatedDepartments = departments.map((dept, index) => {
      return { ...dept, sortOrder: index };
    });

    // TODO: In a future step, we will create and call a service method
    // to persist this new order to the database.
    // For now, it will reorder on the screen but not save.
    console.log('New order to be saved:', updatedDepartments);
    // this.departmentService.updateOrder(updatedDepartments).subscribe();
  }

  onSave(): void {
    // Check for required fields
    if (!this.editingDepartment.name || !this.editingDepartment.abbreviation) {
      alert('Department name and abbreviation cannot be empty.');
      return;
    }

    // Create a new object that matches the type expected by the service.
    const departmentToSave: Omit<Department, 'id' | 'sortOrder'> & { id?: string } = {
      id: this.editingDepartment.id,
      name: this.editingDepartment.name,
      abbreviation: this.editingDepartment.abbreviation
    };

    // Call the service with the correctly typed object
    this.departmentService.saveDepartment(departmentToSave).subscribe({
      next: () => {
        // Success! Reset the form.
        this.resetForm();
      },
      error: (err) => {
        console.error('Error saving department', err);
        alert('Failed to save department.');
      }
    });
  }

  resetForm(): void {
    this.editingDepartment = {};
    this.isEditing = false;
  }
}