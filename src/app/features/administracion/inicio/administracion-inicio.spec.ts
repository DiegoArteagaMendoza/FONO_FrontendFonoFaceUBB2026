import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministracionInicioComponent } from './administracion-inicio';

describe('Informacion', () => {
  let component: AdministracionInicioComponent;
  let fixture: ComponentFixture<AdministracionInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministracionInicioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministracionInicioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
