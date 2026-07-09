import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmacosClienteComponent } from './farmacos';

describe('Informacion', () => {
  let component: FarmacosClienteComponent;
  let fixture: ComponentFixture<FarmacosClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmacosClienteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FarmacosClienteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
