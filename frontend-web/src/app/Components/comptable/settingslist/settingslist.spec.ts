import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Settingslist } from './settingslist';

describe('Settingslist', () => {
  let component: Settingslist;
  let fixture: ComponentFixture<Settingslist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settingslist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Settingslist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
