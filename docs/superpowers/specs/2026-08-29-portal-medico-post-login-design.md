# Portal Médico: qué ve cada quien después de iniciar sesión

Fecha: 2026-08-29
Estado: aprobado, pendiente de implementación

## Problema

El Portal Médico trata igual a las tres situaciones posibles: visitante sin
sesión, fonoaudiólogo autenticado y paciente autenticado. Las tres aterrizan en
la misma landing de `/portalmedico/inicio`, que explica qué es el portal e invita
a registrarse — información inútil para quien ya entró.

De ahí salen cuatro problemas concretos:

1. El fonoaudiólogo que entra no tiene dónde ver su día. Tiene que ir a la agenda
   a buscarlo, y nada le avisa lo único que de verdad le importa: si no publicó
   horas, nadie puede reservarle.
2. El paciente autenticado tampoco tiene una respuesta rápida a "¿cuándo es mi
   hora?". Ve la misma landing de captación.
3. No hay señal visible de sesión iniciada. El profesional lo deduce porque
   aparecen enlaces nuevos; el paciente, porque hay un botón suelto de cerrar
   sesión. Ninguna de las dos es una respuesta a "¿estoy dentro y como quién?".
4. Al fonoaudiólogo se le muestra el directorio de los demás fonoaudiólogos, que
   es una vitrina para pacientes, no una herramienta suya.

Aparte, el orden reserva → video está a medias: la pantalla de éxito de la
reserva ya ofrece adjuntar el video con la cita preseleccionada, pero el video
sigue siendo además una pantalla suelta donde se puede subir sin cita asociada,
y al invitado el botón "Adjuntar video" lo bota al login.

## Alcance

Entra en esta iteración, todo frontend:

- Panel del fonoaudiólogo en `/portalmedico/inicio`.
- Pantalla "Mi próxima hora" del paciente, en la misma ruta.
- Indicador de sesión con avatar y menú, en la navbar.
- Directorio oculto al fonoaudiólogo, en la barra y en la ruta.
- Video siempre atado a una cita, y fin del botón muerto para el invitado.

Queda fuera, se hace otro día porque toca backend:

- Que quien reservó sin cuenta pueda subir su video usando el código de
  seguimiento. Ver "Tarea diferida" al final.

No se agrega ningún endpoint. Todo sale de lo que ya existe:
`getAgenda`, `getMisDisponibilidades`, `getEstadoAcreditacion`, `getMisCitas`,
`getMisVideos`, `getDirectorio`.

## Diseño

### 1. Una ruta, tres pantallas

`/portalmedico/inicio` decide qué mostrar según la identidad activa. No se crean
rutas nuevas: el enlace "Inicio" de la barra sigue siendo uno solo y lleva a cada
quien a lo suyo, que es lo que la gente espera del logo y del inicio.

El componente actual `PortalMedicoInicioComponent` pasa a ser un despachador
delgado: consulta `PortalMedicoService.profesionalActual()` y
`PmClienteService.clienteActual()`, y renderiza uno de tres hijos.

```
inicio/
  inicio.ts                    despachador
  inicio.html
  landing/                     lo que hoy es la landing, movido tal cual
  panel-profesional/           nuevo
  proxima-hora/                nuevo (paciente)
```

El orden de precedencia es profesional > paciente > visitante, el mismo que ya
usa la navbar hoy, para que las dos coincidan si alguien tiene ambas sesiones
abiertas en el mismo navegador.

### 2. Panel del fonoaudiólogo

Responde "¿cómo viene mi día y qué me falta?". De arriba abajo:

**Saludo y estado de acreditación.** El nombre del profesional. Si la
acreditación no está aprobada, un banner con el estado y un enlace a
`/portalmedico/acreditacion`, que es donde vive la guía de pasos. Si está
aprobada, el banner no aparece: no hay que celebrar lo normal.

**Hoy.** Las citas de hoy en orden de hora, con hora, paciente y motivo de
consulta, y el botón de marcar realizada en la misma fila. Sale de
`getAgenda(true)` filtrando por fecha de hoy. Si no hay ninguna, un texto corto
en vez de una tabla vacía.

**Tres cifras.** Citas en los próximos 7 días · horas libres publicadas · horas
ya reservadas. Las dos últimas salen de `getMisDisponibilidades(false)`
contando por `esta_disponible` y `esta_reservado`.

**Aviso de horas.** Si no hay ninguna hora libre publicada dentro de los próximos
7 días, un aviso con botón a `/portalmedico/disponibilidad`. Es la pieza más
valiosa del panel: sin horas publicadas el profesional es invisible para los
pacientes y hoy nada se lo dice.

**Accesos.** Publicar horas · Ver agenda completa.

Las tres llamadas (agenda, disponibilidades, acreditación) se lanzan en paralelo
y cada bloque se pinta cuando llega lo suyo. Si una falla, ese bloque muestra su
propio mensaje y los demás siguen funcionando: un panel que se cae entero porque
falló un conteo es peor que un panel incompleto.

### 3. Paciente: "Mi próxima hora", no un dashboard

Un paciente entra dos o tres veces por tratamiento, no a diario. No hay métricas
que le importen, y un tablero de cifras sería ruido con aire de importancia. La
pantalla responde una sola pregunta.

**Con hora reservada.** Una tarjeta grande con la cita más próxima: fecha legible,
profesional, y cuánto falta ("en 3 días", "mañana", "hoy a las 15:00"). Debajo,
solo lo pendiente:

- *Adjuntar un video* si `PmCitaService.admiteVideo(cita)` y todavía no hay
  ninguno asociado. Se cruza `getMisVideos()` contra el id de la cita.
- *Reagendar o cancelar* si `PmCitaService.permiteCambios(cita)`, enlazando a
  "Mis citas", que ya sabe hacerlo. No se duplica esa lógica aquí.

**Sin ninguna hora.** Un estado vacío con una sola acción grande: *Reservar una
hora*. Nada más.

Abajo, en ambos casos, un enlace discreto a "Todas mis horas".

Reutiliza los componentes de tarjeta del panel del profesional, así que las dos
pantallas se ven de la misma familia.

### 4. Indicador de sesión

Un avatar circular con las iniciales, al extremo derecho de la barra, con el
nombre al lado en escritorio. Al pulsarlo, el desplegable que hoy cuelga de "Mi
perfil".

Es la convención que la gente ya reconoce, contesta "¿estoy dentro y como quién?"
de un vistazo, y arregla la asimetría actual: hoy el profesional tiene menú y el
paciente solo un botón suelto de cerrar sesión. Con el avatar los dos quedan
iguales, cada uno con sus opciones:

- Profesional: Mi perfil · Documentos · Especialidades · Acreditación · Cerrar sesión.
- Paciente: Mis citas · Mi video · Cerrar sesión.

Sin sesión no hay avatar: queda el botón *Iniciar sesión* que ya existe.

Las iniciales salen del nombre y apellido que ya trae cada servicio en memoria.
No se sube ninguna foto: no hay campo para eso en el backend y no vale la pena
inventarlo para esto.

El comportamiento del desplegable (cierra al navegar, al hacer clic fuera y con
Escape) ya está resuelto en `navbar.ts` y se conserva.

### 5. Directorio oculto al fonoaudiólogo

Se quita el enlace de la barra, en escritorio y en móvil, cuando hay sesión de
profesional. Además la ruta `/portalmedico/directorio` recibe un guard que
redirige al profesional a su panel, para que tampoco entre escribiendo la URL.

El guard es una función nueva junto a los que ya existen, con la misma forma que
`soloVisitantes`: recibe la identidad que debe rebotar y devuelve un
`CanActivateFn`.

### 6. Video siempre atado a una cita

Dos cambios, ninguno de backend:

- En la pantalla de video, el selector de cita pasa a ser obligatorio y
  desaparece la opción de subir sin asociar. Si el paciente no tiene ninguna cita
  que admita video, la pantalla no muestra el formulario: muestra un estado vacío
  que lleva a reservar. El orden queda explícito — primero la hora, después el
  video.
- En la pantalla de éxito de la reserva, el botón "Adjuntar video" solo se ofrece
  a quien tiene sesión de paciente. Al invitado se le explica que para adjuntar
  un video necesita cuenta, con el botón de crear cuenta que ya está ahí, en vez
  de un botón que lo bota al login.

## Textos

Todo el texto estático nuevo va a `src/commons/administracion/texts/textos.ts`,
en secciones nuevas junto a las que ya existen:

- `pm_panel` — panel del fonoaudiólogo.
- `pmc_proxima_hora` — pantalla del paciente.
- Claves sueltas en `pm_navbar` y `pmc_navbar` para el menú del avatar.

Los conteos y las fechas se arman con `reemplazarVariables`, como el resto.

## Estructura de archivos

Según `Specs.md`, ningún `.ts` de componente lleva interfaces, enums ni
constantes. Los componentes nuevos quedan así:

```
features/inicio/
  panel-profesional/
    panel-profesional.ts | .html
    interface/panel-profesional.interface.ts     ResumenAgenda, ResumenHoras
    constants/panel-profesional.const.ts         DIAS_RESUMEN = 7
  proxima-hora/
    proxima-hora.ts | .html
    interface/proxima-hora.interface.ts          PendientePaciente
core/guards/
  solo-pacientes.guard.ts                        guard del directorio
```

Los estilos del avatar van en `layout/navbar/navbar.scss`, que ya existe
justamente porque la navbar queda fuera del bloque `.admin-theme` de
`styles.scss` y una regla puesta en los estilos compartidos nunca la alcanza.

## Verificación

Con los dos backends levantados y el dev server corriendo:

1. Sin sesión, `/portalmedico/inicio` sigue mostrando la landing con sus conteos.
2. Con sesión de fonoaudiólogo: aparece el panel, el aviso de horas aparece
   cuando no hay horas publicadas para los próximos 7 días y desaparece al
   publicar una, el directorio no está en la barra y entrar por URL redirige.
3. Con sesión de paciente: aparece "Mi próxima hora" con la cita más cercana;
   sin citas, el estado vacío con el botón de reservar.
4. El avatar muestra las iniciales correctas en las dos identidades y su menú
   abre, cierra con Escape, con clic fuera y al navegar.
5. La pantalla de video no permite subir sin elegir cita; sin citas que admitan
   video, lleva a reservar.
6. Como invitado, la pantalla de éxito de la reserva no ofrece adjuntar video.

## Tarea diferida: video del invitado

Para que quien reservó sin cuenta pueda subir su video haría falta, en el
backend `FonoAppPortalMedico`:

- Un endpoint de subida que se autentique con el código de seguimiento en vez del
  JWT del paciente, resolviendo la cita con `PmCita_Queryset.por_codigo()`.
- Limitar la subida a la cita de ese código y a las que admiten video, para que
  el código no sirva para colgar archivos en cualquier parte.
- Rate limiting, que ya está pendiente para el resto de los endpoints por código.

En el frontend, la pantalla de seguimiento sumaría el bloque de subida cuando la
cita lo admita.
