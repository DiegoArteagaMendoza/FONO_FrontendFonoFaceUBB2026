import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AdministracionUsuarioEditarComponent } from './administracion-usuarios-editar';

describe('Informacion', () => {
  let component: AdministracionUsuarioEditarComponent;
  let fixture: ComponentFixture<AdministracionUsuarioEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministracionUsuarioEditarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministracionUsuarioEditarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
