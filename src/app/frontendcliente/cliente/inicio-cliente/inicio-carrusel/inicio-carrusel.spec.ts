import { ComponentFixture, TestBed } from "@angular/core/testing";
import { InicioCarruselComponent } from './inicio-carrusel';

describe('InicioCarruselComponent', () => {
    let component: InicioCarruselComponent;
    let fixture: ComponentFixture<InicioCarruselComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InicioCarruselComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(InicioCarruselComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    })
})