import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Valida el dígito verificador (DV) de un RUT chileno con el algoritmo módulo 11,
 * el mismo que usa el backend en Security.validators.validar_rut_chileno (PmMedico).
 *
 * Validators.pattern solo comprueba la FORMA (dígitos + guion opcional + DV), no que
 * ese DV corresponda realmente al cuerpo del RUT. Sin este validador, un RUT con
 * formato correcto pero checksum inválido (ej: '12345678-9') pasa el formulario y
 * recién es rechazado por el backend con un 400 poco claro para el usuario.
 */
export function rutChilenoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (!valor) return null; // el vacío lo maneja Validators.required

    const limpio = String(valor).replace(/[.\-\s]/g, '').toUpperCase();
    if (!/^\d{7,8}[0-9K]$/.test(limpio)) {
      return null; // la forma inválida la maneja Validators.pattern
    }

    const cuerpo = limpio.slice(0, -1);
    const dvIngresado = limpio.slice(-1);

    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += Number(cuerpo[i]) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const resto = 11 - (suma % 11);
    const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);

    return dvIngresado === dvEsperado ? null : { rutDigitoVerificador: true };
  };
}
