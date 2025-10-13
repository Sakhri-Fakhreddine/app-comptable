import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Editdeclaration } from './editdeclaration';

describe('Editdeclaration', () => {
  let component: Editdeclaration;
  let fixture: ComponentFixture<Editdeclaration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Editdeclaration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Editdeclaration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
