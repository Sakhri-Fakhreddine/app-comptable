import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clientinformations } from './clientinformations';

describe('Clientinformations', () => {
  let component: Clientinformations;
  let fixture: ComponentFixture<Clientinformations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clientinformations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Clientinformations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
