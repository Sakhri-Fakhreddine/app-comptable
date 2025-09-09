import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComptableinfoComponent } from './comptableinfo.component';

describe('ComptableinfoComponent', () => {
  let component: ComptableinfoComponent;
  let fixture: ComponentFixture<ComptableinfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComptableinfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComptableinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
