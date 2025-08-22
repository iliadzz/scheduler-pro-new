import { TestBed } from '@angular/core/testing';
import { ScheduleService } from './schedule'; // Import ScheduleService, not Schedule

describe('ScheduleService', () => { // Describe the service
  let service: ScheduleService; // Use the correct service type

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScheduleService); // Inject the service
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});