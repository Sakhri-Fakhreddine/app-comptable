import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Inactivecomptable } from './inactivecomptable';

describe('Inactivecomptable', () => {
  let component: Inactivecomptable;
  let fixture: ComponentFixture<Inactivecomptable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inactivecomptable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Inactivecomptable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
