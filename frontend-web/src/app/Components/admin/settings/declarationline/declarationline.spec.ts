import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Declarationline } from './declarationline';

describe('Declarationline', () => {
  let component: Declarationline;
  let fixture: ComponentFixture<Declarationline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Declarationline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Declarationline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
