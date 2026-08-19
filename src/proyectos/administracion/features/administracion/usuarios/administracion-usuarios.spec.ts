import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AdministracionUsuarioComponent } from './administracion-usuarios';

describe('Informacion', () => {
  let component: AdministracionUsuarioComponent;
  let fixture: ComponentFixture<AdministracionUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministracionUsuarioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministracionUsuarioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});