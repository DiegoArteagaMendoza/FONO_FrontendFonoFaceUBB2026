import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionDetalle } from './informacion-detalle';

describe('InformacionDetalle', () => {
  let component: InformacionDetalle;
  let fixture: ComponentFixture<InformacionDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformacionDetalle],
    }).compileComponents();

    fixture = TestBed.createComponent(InformacionDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
