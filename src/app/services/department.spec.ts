import { TestBed } from '@angular/core/testing';
import { DepartmentService } from './department'; // Import DepartmentService, not Department

describe('DepartmentService', () => { // Describe the service
  let service: DepartmentService; // Use the correct service type

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepartmentService); // Inject the service
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});