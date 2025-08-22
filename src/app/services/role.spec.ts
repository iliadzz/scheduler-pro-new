import { TestBed } from '@angular/core/testing';
import { RoleService } from './role'; // Import RoleService, not Role

describe('RoleService', () => { // Describe the service
  let service: RoleService; // Use the correct service type

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleService); // Inject the service
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});