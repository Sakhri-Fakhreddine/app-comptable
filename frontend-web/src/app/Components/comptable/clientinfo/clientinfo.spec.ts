import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clientinfo } from './clientinfo';

describe('Clientinfo', () => {
  let component: Clientinfo;
  let fixture: ComponentFixture<Clientinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clientinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Clientinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
