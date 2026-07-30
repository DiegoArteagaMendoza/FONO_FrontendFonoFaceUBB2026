import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionClienteComponent } from './informacion';

describe('Informacion', () => {
  let component: InformacionClienteComponent;
  let fixture: ComponentFixture<InformacionClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformacionClienteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InformacionClienteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
