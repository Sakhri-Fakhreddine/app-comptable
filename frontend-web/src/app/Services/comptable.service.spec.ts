import { TestBed } from '@angular/core/testing';

import { ComptableService } from './comptable.service';

describe('ComptableService', () => {
  let service: ComptableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComptableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
