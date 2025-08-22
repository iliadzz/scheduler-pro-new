import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftTemplates } from './shift-templates';

describe('ShiftTemplates', () => {
  let component: ShiftTemplates;
  let fixture: ComponentFixture<ShiftTemplates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftTemplates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftTemplates);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
