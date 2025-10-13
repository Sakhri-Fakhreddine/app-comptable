import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Declarations } from './declarations';

describe('Declarations', () => {
  let component: Declarations;
  let fixture: ComponentFixture<Declarations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Declarations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Declarations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
