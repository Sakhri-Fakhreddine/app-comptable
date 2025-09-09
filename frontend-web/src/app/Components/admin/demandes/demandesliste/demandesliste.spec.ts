import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Demandesliste } from './demandesliste';

describe('Demandesliste', () => {
  let component: Demandesliste;
  let fixture: ComponentFixture<Demandesliste>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Demandesliste]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Demandesliste);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
