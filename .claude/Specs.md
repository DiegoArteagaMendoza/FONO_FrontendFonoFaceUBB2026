# Specs para el desarrollo
1. Se debe respetar la arquitectura de los proyectos, esto considera la separación de:
- 'administracion' como el portal de administración para los superusuarios.
- 'cliente' como la puerta de entrada para los clientes que buscan consumir el contenido
- 'portalMedico' como el portal publico para fonoaudiologos y clientes que quieran acceder a tratamientos
2. El diseño implementado es uniforme para todo el sistema, utilizando estilos compartidos.
3. El texto estatico debe ir en el documento 'textos.ts'.
4. Todas las interfaces deben ir en un archivo con el nombre "<componente>.interface.ts" dentro de una carpeta interface.
5. Todos los enums deben ir en un archivo con el nombre "<componente>.enum.ts" dentro de una carpeta enums.
6. Todas las constantes deben ir en un archivo con el nombre "<componente>.const.ts" dentro de una carpeta constants.
7. No deben haber interfaces, enums o constantes en los documentos .ts base de los componentes.