import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Adddeclarationline } from './adddeclarationline';

describe('Adddeclarationline', () => {
  let component: Adddeclarationline;
  let fixture: ComponentFixture<Adddeclarationline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Adddeclarationline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Adddeclarationline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
