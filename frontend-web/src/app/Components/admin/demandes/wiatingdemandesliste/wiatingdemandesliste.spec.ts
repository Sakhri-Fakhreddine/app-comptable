import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wiatingdemandesliste } from './wiatingdemandesliste';

describe('Wiatingdemandesliste', () => {
  let component: Wiatingdemandesliste;
  let fixture: ComponentFixture<Wiatingdemandesliste>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wiatingdemandesliste]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Wiatingdemandesliste);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
