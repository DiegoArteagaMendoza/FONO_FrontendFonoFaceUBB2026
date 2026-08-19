import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cuidados } from './cuidados';

describe('Cuidados', () => {
  let component: Cuidados;
  let fixture: ComponentFixture<Cuidados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cuidados],
    }).compileComponents();

    fixture = TestBed.createComponent(Cuidados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
