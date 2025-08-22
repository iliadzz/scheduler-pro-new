import { TestBed } from '@angular/core/testing';

import { ShiftTemplate } from './shift-template';

describe('ShiftTemplate', () => {
  let service: ShiftTemplate;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShiftTemplate);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
