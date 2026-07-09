import { TestBed } from '@angular/core/testing';

import { AdministracionService } from './administracion';

describe('Cuidados', () => {
  let service: AdministracionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdministracionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
