import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddsettingsComponent } from './addsettings.component';

describe('AddsettingsComponent', () => {
  let component: AddsettingsComponent;
  let fixture: ComponentFixture<AddsettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddsettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
