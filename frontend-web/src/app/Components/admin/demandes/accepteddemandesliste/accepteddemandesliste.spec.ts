import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Accepteddemandesliste } from './accepteddemandesliste';

describe('Accepteddemandesliste', () => {
  let component: Accepteddemandesliste;
  let fixture: ComponentFixture<Accepteddemandesliste>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accepteddemandesliste]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Accepteddemandesliste);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
