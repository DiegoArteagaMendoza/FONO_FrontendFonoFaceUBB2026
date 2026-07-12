import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministracionInicioCrearComponent } from './administracion-inicio-crear';

describe('Informacion', () => {
  let component: AdministracionInicioCrearComponent;
  let fixture: ComponentFixture<AdministracionInicioCrearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministracionInicioCrearComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministracionInicioCrearComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
