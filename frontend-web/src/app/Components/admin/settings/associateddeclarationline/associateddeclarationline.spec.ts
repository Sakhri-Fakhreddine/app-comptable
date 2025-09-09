import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Associateddeclarationline } from './associateddeclarationline';

describe('Associateddeclarationline', () => {
  let component: Associateddeclarationline;
  let fixture: ComponentFixture<Associateddeclarationline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Associateddeclarationline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Associateddeclarationline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
