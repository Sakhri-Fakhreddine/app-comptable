import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Demandeinfo } from './demandeinfo';

describe('Demandeinfo', () => {
  let component: Demandeinfo;
  let fixture: ComponentFixture<Demandeinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Demandeinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Demandeinfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
