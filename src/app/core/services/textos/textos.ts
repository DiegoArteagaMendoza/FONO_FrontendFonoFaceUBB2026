import { Injectable, signal } from "@angular/core";
import { TEXTOS_SITIO } from "../../../../commons/administracion/texts/textos";

@Injectable({
    providedIn: 'root'
})
export class TextosService {
    public t = signal(TEXTOS_SITIO);

    constructor() {}

    reemplazarVariables(texto: string, variables: Record<string, string>): string {
    let textoModificado = texto;
    for (const [clave, valor] of Object.entries(variables)) {
      textoModificado = textoModificado.replace(`{${clave}}`, valor);
    }
    return textoModificado;
  }
}