import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AdministracionUsuarioCrearComponente } from "../../inicio/administracion-inicio";

describe('Usuario', () => {
    let component: AdministracionUsuarioCrearComponente;
    let fixture: ComponentFixture<AdministracionUsuarioCrearComponente>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdministracionUsuarioCrearComponente],
        }).compileComponents();

        fixture = TestBed.createComponent(AdministracionUsuarioCrearComponente);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    })
})