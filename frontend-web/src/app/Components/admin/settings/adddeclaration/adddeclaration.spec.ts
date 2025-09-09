import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Adddeclaration } from './adddeclaration';

describe('Adddeclaration', () => {
  let component: Adddeclaration;
  let fixture: ComponentFixture<Adddeclaration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Adddeclaration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Adddeclaration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
