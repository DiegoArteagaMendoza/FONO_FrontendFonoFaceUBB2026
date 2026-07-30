import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministracionInfoGeneralEditarComponent } from './infoGeneral-editar';

describe('AdministracionInfoGeneralEditarComponent', () => {
  let component: AdministracionInfoGeneralEditarComponent;
  let fixture: ComponentFixture<AdministracionInfoGeneralEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministracionInfoGeneralEditarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministracionInfoGeneralEditarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});