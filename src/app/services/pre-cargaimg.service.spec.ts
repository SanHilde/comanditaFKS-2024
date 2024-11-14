import { TestBed } from '@angular/core/testing';

import { PreCargaimgService } from './pre-cargaimg.service';

describe('PreCargaimgService', () => {
  let service: PreCargaimgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreCargaimgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
