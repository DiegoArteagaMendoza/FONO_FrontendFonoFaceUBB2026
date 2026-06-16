import { TestBed } from '@angular/core/testing';

import { Informacion } from './informacion';

describe('Informacion', () => {
  let service: Informacion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Informacion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
