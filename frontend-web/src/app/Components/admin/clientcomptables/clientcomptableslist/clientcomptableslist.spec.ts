import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clientcomptableslist } from './clientcomptableslist';

describe('Clientcomptableslist', () => {
  let component: Clientcomptableslist;
  let fixture: ComponentFixture<Clientcomptableslist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clientcomptableslist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Clientcomptableslist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
