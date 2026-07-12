import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioClienteComponent } from './inicio-cliente';

describe('InicioCliente', () => {
  let component: InicioClienteComponent;
  let fixture: ComponentFixture<InicioClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioClienteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioClienteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
