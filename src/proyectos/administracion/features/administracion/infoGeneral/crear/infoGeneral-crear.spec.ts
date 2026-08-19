import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministracionInfoGeneralCrearComponent } from './infoGeneral-crear';

describe('AdministracionInfoGeneralCrearComponent', () => {
  let component: AdministracionInfoGeneralCrearComponent;
  let fixture: ComponentFixture<AdministracionInfoGeneralCrearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministracionInfoGeneralCrearComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministracionInfoGeneralCrearComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});