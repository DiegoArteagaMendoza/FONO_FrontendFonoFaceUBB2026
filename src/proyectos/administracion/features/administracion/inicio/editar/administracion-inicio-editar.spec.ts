import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AdministracionInicioEditarComponent } from './administracion-inicio-editar';

describe('Informacion', () => {
  let component: AdministracionInicioEditarComponent;
  let fixture: ComponentFixture<AdministracionInicioEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministracionInicioEditarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministracionInicioEditarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
