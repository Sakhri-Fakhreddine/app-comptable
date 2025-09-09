import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComptablehomeComponent } from './comptablehome.component';

describe('ComptablehomeComponent', () => {
  let component: ComptablehomeComponent;
  let fixture: ComponentFixture<ComptablehomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComptablehomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComptablehomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
