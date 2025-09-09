import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Activecomptable } from './activecomptable';

describe('Activecomptable', () => {
  let component: Activecomptable;
  let fixture: ComponentFixture<Activecomptable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Activecomptable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Activecomptable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
