import { TestBed } from '@angular/core/testing';
import { EmployeeService } from './employee'; // Import EmployeeService, not Employee

describe('EmployeeService', () => { // Describe the service
  let service: EmployeeService; // Use the correct service type

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeService); // Inject the service
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});