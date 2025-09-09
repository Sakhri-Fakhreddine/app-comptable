import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComptableslistComponent } from './comptableslist.component';

describe('ComptableslistComponent', () => {
  let component: ComptableslistComponent;
  let fixture: ComponentFixture<ComptableslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComptableslistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComptableslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
