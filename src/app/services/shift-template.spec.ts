import { TestBed } from '@angular/core/testing';
import { ShiftTemplateService } from './shift-template'; // Import ShiftTemplateService, not ShiftTemplate

describe('ShiftTemplateService', () => { // Describe the service
  let service: ShiftTemplateService; // Use the correct service type

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShiftTemplateService); // Inject the service
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});