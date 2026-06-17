import { TestBed } from '@angular/core/testing';

import { Cuidados } from './cuidados';

describe('Cuidados', () => {
  let service: Cuidados;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cuidados);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
