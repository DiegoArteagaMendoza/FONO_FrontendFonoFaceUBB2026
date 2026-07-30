import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuidadosDetalleComponent } from './cuidados-detalle';

describe('InformacionDetalle', () => {
  let component: CuidadosDetalleComponent;
  let fixture: ComponentFixture<CuidadosDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuidadosDetalleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CuidadosDetalleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
