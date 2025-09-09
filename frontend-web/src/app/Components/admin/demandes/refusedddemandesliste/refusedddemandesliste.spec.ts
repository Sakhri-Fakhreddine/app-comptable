import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Refusedddemandesliste } from './refusedddemandesliste';

describe('Refusedddemandesliste', () => {
  let component: Refusedddemandesliste;
  let fixture: ComponentFixture<Refusedddemandesliste>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Refusedddemandesliste]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Refusedddemandesliste);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
