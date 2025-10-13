import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clientsdeclarations } from './clientsdeclarations';

describe('Clientsdeclarations', () => {
  let component: Clientsdeclarations;
  let fixture: ComponentFixture<Clientsdeclarations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clientsdeclarations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Clientsdeclarations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
