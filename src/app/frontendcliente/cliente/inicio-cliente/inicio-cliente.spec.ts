import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioCliente } from './inicio-cliente';

describe('InicioCliente', () => {
  let component: InicioCliente;
  let fixture: ComponentFixture<InicioCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
