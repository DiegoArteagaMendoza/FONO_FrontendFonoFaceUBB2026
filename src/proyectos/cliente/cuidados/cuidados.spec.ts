import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CuidadosClienteComponent } from './cuidados';

describe('Cuidados', () => {
    let component: CuidadosClienteComponent;
    let fixture: ComponentFixture<CuidadosClienteComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CuidadosClienteComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CuidadosClienteComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});