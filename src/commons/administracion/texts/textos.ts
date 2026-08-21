export const TEXTOS_SITIO = {
    // TEXTOS GLOBALES
    
    globales: {
        marca: "FonoFace",
        boton_guardar: "Guardar Cambios",
        boton_cancelar: "Cancelar",
        boton_volver: "Volver",
        cerrar_sesion: "Cerrar Sesión",
        activar_tema_oscuro: "Activar modo oscuro",
        activar_tema_claro: "Activar modo claro",
        ultima_actualizacion_label: "Última actualización:",
        imagenes_adjuntas: "Imágenes adjuntas",
        cargando: "Cargando registros...",
        sin_datos: "No hay registros disponibles",
        proximamente: "PROXIMAMENTE",
        confirmacion_eliminar: "¿Estás seguro de que deseas eliminar este registro?",
        sin_imagen: "No hay imágenes adjuntas a este registro.",
        sin_informacion_encontrada: "No se encontro la informacion solicitada",
        eliminar_imagen: "¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.",
    },

    // ERRORES

    erorres: {
        error_eliminacion: "Ocurrió un error al eliminar. Por favor, verifica tus permisos o vuelve a iniciar sesión.",
        error_actualizar: "Ocurrió un error al actualizar. Verifica tus permisos o sesión.",
        error_cargando_datos: "Error al cargar los datos actuales.",
    },

    // ENCABEZADOS TABLAS

    tablas: {
        imagen_tabla: "Imagen",
        titulo_tabla: "Título",
        categoria_tabla: "Categoría",
        ultima_actualizacion: "	Última Actualización",
        acciones_tabla: "Acciones",
        filtrar_tabla: "Filtrar",
        descripcion_tabla: "Descripción",
        nombre_tabla: "Nombre",
        rut_tabla: "Rut",
        email_tabla: "Email",
        boton_ver: "Ver",
        boton_editar: "Editar",
        boton_eliminar: "Eliminar",
        sin_img: "Sin img",
        estado_usuario: "Estado",
        gestion_info_general: {
            titulo: "Gestión de Textos Dinámicos",
            subtitulo: "Administra los textos, títulos y enlaces que se muestran en el portal público.",
            nuevo_texto: "Nuevo Texto",
            filtrar_seccion: "Filtrar por Sección:",
            seccion_todas: "Todas las secciones"
        },
    },

    // INICIO PORTAL ADMINISTRACION

    inicio_admin: {
        bienvenida_titulo: "¡Hola, {nombre}! 👋",
        bienvenida_desc: "Bienvenido al panel de adminisrtación. Aquí tienes un resumen de la plataforma al",
        accesos_titulo: "Accesos Rápidos",
        actividad_reciente: "Actividad Reciente",
        actividad_vacia: "Pronto podrás ver aquí los últimos registros añadidos al sistema.",
        nueva_informacion: "Nueva Información",
        nuevo_cuidado: "Nuevo Cuidado",
        nueva_noticia: "Nueva Noticia",
        informacion_publicada: "Información Publicada",
        cuidados_activos: "Cuidados Activos",
        noticias_recientes: "Noticias Recientes",
        noticias_proximamente: "Noticias Recientes (PROXIMAMENTE)",

        // ACTIVIDAD RECIENTE
        actividad_cargando: "Cargando actividad...",
        actividad_tipo_informacion: "Información",
        actividad_tipo_cuidado: "Cuidado",
        actividad_tipo_noticia: "Noticia",
        actividad_ahora_mismo: "Justo ahora",
        actividad_hace_minutos: "Hace {n} min",
        actividad_hace_horas: "Hace {n} h",
        actividad_ayer: "Ayer",
        actividad_hace_dias: "Hace {n} días",
        actividad_fecha_desconocida: "Fecha desconocida",

        // PROFESIONALES PENDIENTES DE APROBACIÓN
        pendientes_titulo: "Profesionales por aprobar",
        pendientes_aviso_singular: "1 profesional está esperando revisión de acreditación.",
        pendientes_aviso_plural: "{n} profesionales están esperando revisión de acreditación.",
        pendientes_boton_revisar: "Revisar",
        pendientes_ver_todos: "Ver todos",
        pendientes_ver_mas: "Ver {n} más"
    },

    // GESTION

    gestion_informacion: {
        titulo: "Gestión de Información",
        subtitulo: "Administra la información farmacologica, de prevención y de promoción del portal.",
        nueva_informacion: "Nueva Información",
        categorias_todas: "Todas las categorías",
        categorias_promocion: "Promoción",
        categorias_prevencion: "Prevención",
        categorias_farmacos: "Farmacos",
    },
    gestion_cuidados: {
        titulo: "Gestión de Cuidados",
        subtitulo: "Administra las recomendaciones y cuidados vocales específicos.",
        nueva_informacion: "Nuevo Cuidado",
    },
    cuidados_extras: {
        publico_objetivo: "Público Objetivo",
        fuente: "Fuente",
        imagen_adjunta: "Imagen adjunta",
        ver_enlace: "Ver Enlace",
        todos: "Todos",
        ninos: "Niños",
        profesores: "Profesores",
        cantantes: "Cantantes y Actores",
        locutores: "Locutores",
        publico_general: "Público General",
        filtrar_publico: "Filtrar por Público:",
    },
    gestion_voz: {
        titulo: "Gestión de La Voz",
        subtitulo: "Administra el contenido informativo sobre la voz: definición, anatomía, fisiología y más.",
        nueva_informacion: "Nuevo Contenido",
    },
    voz_extras: {
        categoria_tema: "Categoría",
        fuente: "Fuente",
        imagen_adjunta: "Imagen adjunta",
        ver_enlace: "Ver Enlace",
        todas: "Todas",
        definicion: "Definición",
        anatomia: "Anatomía",
        fisiologia: "Fisiología",
        trastornos: "Trastornos de la Voz",
        importancia: "Importancia del Cuidado",
        curiosidades: "Curiosidades",
        filtrar_categoria: "Filtrar por Categoría:",
    },
    gestion_noticias: {
        titulo: "Gestión de Noticias",
        subtitulo: "Administra las noticias y novedades que se publican en el portal.",
        nueva_noticia: "Nueva Noticia",
    },
    gestion_carrusel: {
        titulo: "Gestión del Carrusel de Inicio",
        subtitulo: "Configura las imágenes y textos del carrusel principal del portal público.",
        nuevo_carrusel: "Nuevo Carrusel"
    },
    gestion_usuarios: {
        titulo: "Gestión de Usuarios",
        subtitulo: "Administra los usuarios registrados en el sistema.",
        nuevo_usuario: "Nuevo Usuario",
        filtrar_estado: "Filtrar por Estado:",
        estado_todos: "Todos",
        estado_activos: "Activos",
        estado_inactivos: "Inactivos"
    },

    // TEXTOS EDICION
    edicion_informacion: {
        titulo: "Editar Información",
        subtitulo: "Modifica los textos o la categoría de este registro.",
        titulo_articulo: "Título del artículo",
        titulo_obligatorio_alerta: "El título es obligatorio.",
        categoria: "Categoría",
        categorias_promocion: "Promoción",
        categorias_prevencion: "Prevención",
        categorias_farmacos: "Farmacos",
        contenido: "Contenido",
        contenido_obligatorio_alerta: "El contenido es obligatorio.",
        imagenes_actuales: "Imágenes Actuales",
        boton_actualizando: "Actualizando...",
        boton_actualizar: "Guardar Cambios",
    },

    // TEXTOS CREACIÓN INFORMACIÓN
    creacion_informacion: {
        titulo: "Crear Nueva Información",
        subtitulo: "Completa los campos para publicar un nuevo artículo o cuidado.",
        label_titulo: "Título del artículo",
        placeholder_titulo: "Ej. Síntomas de parvovirus...",
        alerta_titulo: "El título es obligatorio.",
        label_categoria: "Categoría",
        placeholder_categoria: "Seleccione una...",
        alerta_categoria: "Selecciona una categoría.",
        categorias_promocion: "Promoción",
        categorias_prevencion: "Prevención",
        categorias_farmacos: "Farmacos",
        label_contenido: "Contenido",
        placeholder_contenido: "Desarrolla el contenido aquí...",
        alerta_contenido: "El contenido es obligatorio.",
        label_imagenes: "Imágenes (Opcional - Máximo 4)",
        help_imagenes: "Puedes seleccionar varias imágenes al mismo tiempo (JPG, PNG).",
        max_imagenes: "Solo puedes subir un máximo de 4 imágenes.",
        archivos_seleccionados: "Archivos seleccionados:",
        boton_guardando: "Guardando...",
        boton_guardar: "Guardar Información"
    },

    // TEXTOS CREACIÓN USUARIOS
    creacion_usuarios: {
        titulo: "Crear Nuevo Usuario",
        subtitulo: "Registra a una persona en el sistema y asígnale sus credenciales y permisos.",
        label_nombre: "Nombre Completo",
        placeholder_nombre: "Ej: Diego Arteaga",
        alerta_nombre: "El nombre es obligatorio.",
        label_rut: "RUT",
        placeholder_rut: "11111111-1",
        alerta_rut: "El RUT es obligatorio.",
        label_email: "Correo Electrónico",
        placeholder_email: "ejemplo@correo.com",
        alerta_email_req: "El correo es obligatorio.",
        alerta_email_inv: "El formato del correo no es válido.",
        label_password: "Contraseña Inicial",
        placeholder_password: "Min. 6 caracteres",
        help_password: "El usuario podrá cambiarla después desde su perfil.",
        alerta_password: "La contraseña es obligatoria.",
        permisos_titulo: "Permisos del Sistema",
        label_rol: "Rol del Usuario",
        desc_rol_usuario: "Usuario: gestiona el contenido público del portal (información, cuidados, la voz, noticias, carrusel de inicio y textos dinámicos). Sin acceso al Portal Médico ni a Gestión de Usuarios.",
        desc_rol_admin: "Admin: todo lo de Usuario, más el Portal Médico completo (aprobar/rechazar acreditaciones de profesionales, validar sus documentos y gestionar el catálogo de especialidades). No puede administrar otras cuentas del sistema.",
        desc_rol_superadmin: "SuperAdmin: acceso total, incluida la Gestión de Usuarios (crear/editar/activar cuentas y asignar roles). Es el único rol que puede otorgar Admin o SuperAdmin a otra persona.",
        label_tipo: "Cuenta Tipo 1",
        desc_tipo: "Marca interna sin efecto sobre los permisos de acceso; no habilita ni restringe ninguna acción del panel ni del Portal Médico.",
        label_estado: "Cuenta Activa",
        desc_estado: "Si se desmarca, el usuario no podrá entrar aunque tenga los demás permisos activados.",
        boton_creando: "Creando Usuario...",
        boton_crear: "Crear Usuario"
    },
    
    // TEXTOS CREACIÓN CARRUSEL DE INICIO
    creacion_carrusel: {
        titulo: "Crear Elemento del Carrusel",
        subtitulo: "Añade un nuevo bloque de imagen y texto para el inicio del portal.",
        label_titulo: "Título Principal",
        placeholder_titulo: "Ej: ¿Qué es la voz?",
        alerta_titulo: "El título es obligatorio.",
        label_descripcion: "Descripción",
        placeholder_descripcion: "Describe brevemente de qué trata este elemento...",
        alerta_descripcion: "La descripción es obligatoria.",
        label_imagen: "Imagen de Fondo",
        help_imagen: "Formatos recomendados: JPG, PNG, WEBP (Max 2MB).",
        previsualizacion: "Previsualización:",
        boton_quitar_imagen: "Quitar Imagen",
        alerta_imagen: "Debes adjuntar una imagen.",
        boton_guardando: "Guardando...",
        boton_guardar: "Guardar Elemento"
    },
    
    // TEXTOS MODAL USUARIO
    modal_usuario: {
        titulo: "Detalle de Usuario",
        nombre_completo: "Nombre Completo:",
        rut: "RUT:",
        correo: "Correo Electrónico:",
        rol: "Rol del Sistema:",
        rol_admin: "Administrador",
        rol_regular: "Usuario Regular",
        rol_superadmin: "Superadmin"
    },

    // LOGIN
    login: {
        titulo: "Bienvenido a FonoFace",
        subtitulo: "Ingresa tus credenciales para continuar",
        label_email: "Correo Electrónico",
        placeholder_email: "ejemplo@correo.com",
        alerta_email_req: "El correo es obligatorio.",
        alerta_email_inv: "El formato del correo no es válido.",
        label_password: "Contraseña",
        placeholder_password: "********",
        alerta_password_req: "La contraseña es obligatoria.",
        alerta_password_min: "Debe tener al menos 6 caracteres.",
        btn_ingresando: "Ingresando...",
        btn_ingresar: "Iniciar Sesión",
        msg_admin: "Para registrarse como usuario autorizado contacte con el administrador del sistema",
        msg_portal: "Para volver al portal cliente presiona en 'Portal Cliente'",
        btn_redirigiendo: "Redirigiendo...",
        btn_portal: "Portal cliente",
        error_credenciales: "Correo o contraseña incorrectos.",
        error_servidor: "Error al conectar con el servidor.",
        alerta_sesion_expirada: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
    },

    // CREACION NOTICIAS
    creacion_noticias: {
        titulo: "Crear Nueva Noticia",
        subtitulo: "Completa los campos para publicar una nueva noticia en el portal.",
        label_titulo: "Título de la noticia",
        placeholder_titulo: "Ej. Taller de cuidado vocal para profesores...",
        alerta_titulo: "El título es obligatorio.",
        label_contenido: "Cuerpo de la noticia",
        placeholder_contenido: "Desarrolla el contenido de la noticia aquí...",
        alerta_contenido: "El contenido es obligatorio.",
        label_imagenes: "Imágenes (Opcional - Máximo 4)",
        help_imagenes: "Puedes seleccionar varias imágenes al mismo tiempo (JPG, PNG).",
        max_imagenes: "Solo puedes subir un máximo de 4 imágenes.",
        archivos_seleccionados: "Archivos seleccionados:",
        boton_guardando: "Guardando...",
        boton_guardar: "Publicar Noticia"
    },

    // EDICION NOTICIAS
    edicion_noticias: {
        titulo: "Editar Noticia",
        subtitulo: "Modifica el título, el contenido o las imágenes de esta noticia.",
        label_titulo: "Título de la noticia",
        alerta_titulo: "El título es obligatorio.",
        label_contenido: "Cuerpo de la noticia",
        alerta_contenido: "El contenido es obligatorio.",
        imagenes_actuales: "Imágenes Actuales",
        label_agregar_imagenes: "Agregar Imágenes Nuevas (Opcional)",
        help_agregar_imagenes: "Entre las actuales y las nuevas no pueden superar las 4 imágenes.",
        max_imagenes_total: "Una noticia puede tener un máximo de 4 imágenes en total.",
        archivos_seleccionados: "Archivos seleccionados:",
        boton_actualizando: "Actualizando...",
        boton_actualizar: "Guardar Cambios"
    },

    // CREACION CUIDADOS
    creacion_cuidados: {
        titulo: "Crear Nuevo Cuidado",
        subtitulo: "Añade una recomendación o cuidado vocal para un público específico.",
        label_titulo: "Título de la recomendación",
        placeholder_titulo: "Ej. Calentamiento vocal...",
        alerta_titulo: "El título es obligatorio.",
        label_publico: "Público Objetivo",
        placeholder_publico: "Seleccione uno...",
        alerta_publico: "Selecciona el público objetivo.",
        label_contenido: "Contenido y Detalles",
        placeholder_contenido: "Explica detalladamente el cuidado...",
        alerta_contenido: "El contenido es obligatorio.",
        label_fuente: "Fuente o Referencia (Opcional)",
        placeholder_fuente: "https://ejemplo.com/estudio...",
        alerta_fuente: "Debe ser una URL válida (ej. https://...).",
        label_imagen: "Imagen Principal (Opcional)",
        help_imagen: "Sube una imagen ilustrativa para esta recomendación (JPG, PNG).",
        archivo_seleccionado: "Archivo seleccionado:",
        btn_guardando: "Guardando...",
        btn_guardar: "Guardar Cuidado"
    },

    // EDICION CUIDADOS
    edicion_cuidados: {
        titulo: "Editar Cuidado",
        subtitulo: "Modifica el contenido, público o la imagen asociada a esta recomendación.",
        cargando_datos: "Cargando datos del registro...",
        error_no_encontrado: "No se encontró el cuidado solicitado.",
        imagen_actual: "Imagen Actual:",
        label_reemplazar: "Reemplazar Imagen (Opcional)",
        help_reemplazar: "Selecciona un archivo solo si deseas cambiar la imagen actual.",
        nueva_imagen: "Nueva imagen a subir:",
        btn_actualizando: "Actualizando...",
        btn_actualizar: "Guardar Cambios"
    },

    // CREACION VOZ
    creacion_voz: {
        titulo: "Crear Nuevo Contenido de Voz",
        subtitulo: "Añade contenido informativo sobre la voz para una categoría específica.",
        label_titulo: "Título del contenido",
        placeholder_titulo: "Ej. ¿Cómo se produce la voz?...",
        alerta_titulo: "El título es obligatorio.",
        label_categoria: "Categoría",
        placeholder_categoria: "Seleccione una...",
        alerta_categoria: "Selecciona una categoría.",
        label_contenido: "Contenido y Detalles",
        placeholder_contenido: "Desarrolla el contenido aquí...",
        alerta_contenido: "El contenido es obligatorio.",
        label_fuente: "Fuente o Referencia (Opcional)",
        placeholder_fuente: "https://ejemplo.com/estudio...",
        alerta_fuente: "Debe ser una URL válida (ej. https://...).",
        label_imagen: "Imagen Principal (Opcional)",
        help_imagen: "Sube una imagen ilustrativa para este contenido (JPG, PNG).",
        archivo_seleccionado: "Archivo seleccionado:",
        btn_guardando: "Guardando...",
        btn_guardar: "Guardar Contenido"
    },

    // EDICION VOZ
    edicion_voz: {
        titulo: "Editar Contenido de Voz",
        subtitulo: "Modifica el contenido, la categoría o la imagen asociada a este registro.",
        cargando_datos: "Cargando datos del registro...",
        error_no_encontrado: "No se encontró el contenido de voz solicitado.",
        imagen_actual: "Imagen Actual:",
        label_reemplazar: "Reemplazar Imagen (Opcional)",
        help_reemplazar: "Selecciona un archivo solo si deseas cambiar la imagen actual.",
        nueva_imagen: "Nueva imagen a subir:",
        btn_actualizando: "Actualizando...",
        btn_actualizar: "Guardar Cambios"
    },
    footer: {
        descripcion: "Sistema integral de administración FonoFace. Simplificando la gestión y el cuidado paso a paso.",
        contacto_email: "contacto@fonoface.cl",
        contacto_telefono: "+56 9 1234 5678",
        derechos: "Todos los derechos reservados.",
        enlaces: [
        { label: "Inicio", path: "/administracion/inicio" },
        { label: "Información", path: "/administracion/informacion" },
        { label: "Cuidados", path: "/administracion/cuidados" },
        { label: "La Voz", path: "/administracion/voz" },
        { label: "Noticias", path: "/administracion/noticias" }
        ],
        legales: [
        { label: "Términos de Servicio", path: "/terminos" },
        { label: "Privacidad", path: "/privacidad" }
        ]
    },

    // EDITCIÓN DE CARRUSEL DE INICIO
    edicion_carrusel: {
        titulo: "Editar Elemento del Carrusel",
        subtitulo: "Modifica el texto o la imagen de este bloque del inicio.",
        cargando_datos: "Cargando datos del elemento...",
        error_no_encontrado: "No se encontró el elemento solicitado.",
        imagen_actual: "Imagen Actual:",
        label_reemplazar: "Reemplazar Imagen (Opcional)",
        help_reemplazar: "Selecciona un archivo solo si deseas cambiar la imagen actual (Max 2MB).",
        nueva_imagen: "Nueva imagen a subir:",
        btn_actualizando: "Actualizando...",
        btn_actualizar: "Guardar Cambios"
    },

    // EDITAR USUARIO
    // TEXTOS EDICIÓN USUARIOS
    edicion_usuarios: {
        titulo: "Editar Permisos de Usuario",
        subtitulo: "Modifica el acceso, rol o actualiza la contraseña de este usuario.",
        label_password: "Nueva Contraseña (Opcional)",
        placeholder_password: "Min. 6 caracteres",
        help_password: "Déjalo en blanco si no deseas cambiar la contraseña actual.",
        permisos_titulo: "Permisos del Sistema",
        btn_actualizando: "Actualizando...",
        btn_actualizar: "Guardar Cambios"
    },

    // CREACIÓN DE INFORMACIÓN GENERAL (TEXTOS DINÁMICOS)
    creacion_info_general: {
        titulo: "Crear Texto Dinámico",
        subtitulo: "Añade un nuevo bloque de texto para una sección del portal público.",
        label_seccion: "Sección",
        placeholder_seccion: "Ej: inicio, footer, nosotros",
        alerta_seccion: "La sección es obligatoria.",
        label_clave: "Clave Única",
        placeholder_clave: "Ej: inicio_bienvenida",
        alerta_clave: "La clave es obligatoria y sin espacios.",
        label_titulo_texto: "Título a mostrar (Opcional)",
        placeholder_titulo_texto: "Ej: Bienvenido al portal",
        label_descripcion: "Contenido / Descripción (Opcional)",
        placeholder_descripcion: "Cuerpo del texto...",
        label_enlace: "Enlace o URL (Opcional)",
        placeholder_enlace: "Ej: /portal/cuidados",
        boton_guardando: "Guardando...",
        boton_guardar: "Guardar Texto"
    },

    // EDICIÓN DE INFORMACIÓN GENERAL
    edicion_info_general: {
        titulo: "Editar Texto Dinámico",
        subtitulo: "Modifica el contenido o la configuración de este bloque de texto.",
        label_estado: "Bloque Activo",
        desc_estado: "Si se desmarca, este texto dejará de aparecer en el portal público.",
        boton_actualizando: "Actualizando...",
        boton_actualizar: "Guardar Cambios"
    },

    // ===================== PORTAL CLIENTE =====================

    // NAVBAR DEL PORTAL CLIENTE
    portal_navbar: {
        marca: "FonoFace",
        inicio: "Inicio",
        la_voz: "La Voz",
        menu_informacion: "Información",
        farmacos: "Efectos Farmacológicos",
        prevencion: "Prevención de la voz",
        promocion: "Promoción de la voz",
        cuidados: "Cuidados",
        noticias: "Noticias",
        portal_medico: "Portal Médico",
        acceso_admin: "Acceso Admin"
    },

    // VISTA INICIO DEL PORTAL CLIENTE
    portal_inicio: {
        seccion_titulo: "¿Qué puedes encontrar aquí?",
        ver_mas: "Ver más →",
        card_informacion_titulo: "Información Fonoaudiologica",
        card_informacion_desc: "Explora nuestra biblioteca de informacion sobre niños, profesores, cantantes y actores, locutores y publico general.",
        card_cuidados_titulo: "Cuidados Vocales",
        card_cuidados_desc: "Recomendaciones específicas para profesores, cantantes, locutores y público en general.",
        card_noticias_titulo: "Últimas Noticias",
        card_noticias_desc: "Mantente al día con las novedades, eventos y actualizaciones de nuestra plataforma."
    },

    // VISTA PREVENCIÓN DEL PORTAL CLIENTE
    portal_prevencion: {
        titulo: "Prevención de la voz",
        subtitulo: "Explora artículos, guías y consejos especializados en la prevención de la voz.",
        cargando: "Cargando artículos...",
        vacio: "No hay artículos disponibles en esta categoría.",
        leer_mas: "Leer artículo completo →"
    },

    // VISTA FÁRMACOS DEL PORTAL CLIENTE
    portal_farmacos: {
        titulo: "Efectos Farmacológicos en la Voz",
        subtitulo: "Descubre cómo diferentes medicamentos y tratamientos pueden impactar tu salud vocal y qué precauciones tomar.",
        cargando: "Cargando información...",
        vacio: "Aún no hay artículos disponibles sobre efectos farmacológicos.",
        badge: "Fármacos",
        leer_mas: "Leer artículo completo →"
    },

    // VISTA CUIDADOS DEL PORTAL CLIENTE
    portal_cuidados: {
        titulo: "Guía de Cuidados Vocales",
        subtitulo: "Recomendaciones prácticas, ejercicios y tips diseñados específicamente para tu perfil.",
        cargando: "Cargando recomendaciones...",
        vacio: "No hay cuidados disponibles para este perfil en este momento.",
        ver_mas: "Ver recomendación →"
    },

    // VISTA DETALLE DE INFORMACIÓN DEL PORTAL CLIENTE
    portal_informacion_detalle: {
        volver: "← Volver a Información",
        cargando: "Cargando artículo...",
        regresar: "Regresar"
    },

    // VISTA DETALLE DE CUIDADO DEL PORTAL CLIENTE
    portal_cuidados_detalle: {
        volver: "← Volver a Cuidados",
        cargando: "Cargando recomendación...",
        regresar: "Regresar",
        fuente: "Fuente:"
    },

    // VISTA LA VOZ DEL PORTAL CLIENTE
    portal_voz: {
        titulo: "La Voz",
        subtitulo: "Conoce su definición, anatomía, fisiología, trastornos y curiosidades.",
        cargando: "Cargando contenido...",
        vacio: "No hay contenido disponible para esta categoría en este momento.",
        ver_mas: "Ver contenido →"
    },

    // VISTA DETALLE DE LA VOZ DEL PORTAL CLIENTE
    portal_voz_detalle: {
        volver: "← Volver a La Voz",
        cargando: "Cargando contenido...",
        regresar: "Regresar",
        fuente: "Fuente:"
    },

    // FOOTER DEL PORTAL CLIENTE
    portal_footer: {
        descripcion: "Plataforma de información y cuidados de la voz de la Universidad del Bío-Bío. Recursos especializados para niños, profesores, cantantes, locutores y público general.",
        titulo_enlaces: "Enlaces Rápidos",
        titulo_contacto: "Contacto",
        contacto_email: "contacto@fonoface.cl",
        contacto_direccion: "Universidad del Bío-Bío, Concepción, Chile",
        derechos: "FonoFace — Universidad del Bío-Bío. Todos los derechos reservados.",
        enlaces: [
        { label: "Inicio", path: "/portal/inicio" },
        { label: "La Voz", path: "/portal/lavoz" },
        { label: "Efectos Farmacológicos", path: "/portal/farmacos" },
        { label: "Prevención de la voz", path: "/portal/prevencion" },
        { label: "Promoción", path: "/portal/promocion" },
        { label: "Cuidados", path: "/portal/cuidados" },
        { label: "Noticias", path: "/portal/noticias" }
        ]
    },

    // VISTA PROMOCIÓN DEL PORTAL CLIENTE
    portal_promocion: {
        titulo: "Promoción de la voz",
        subtitulo: "Descubre artículos y recursos para promover una voz sana en tu vida diaria.",
        cargando: "Cargando artículos...",
        vacio: "No hay artículos disponibles en esta categoría.",
        leer_mas: "Leer artículo completo →"
    },

    // VISTA DETALLE DE NOTICIA DEL PORTAL CLIENTE
    portal_noticia_detalle: {
        volver: "← Volver a Noticias",
        cargando: "Cargando noticia...",
        no_encontrada: "La noticia no existe o ya no está disponible.",
        error_conexion: "Error de conexión. Inténtalo más tarde.",
        regresar: "Regresar",
        publicada: "Publicada el"
    },

    // VISTA NOTICIAS DEL PORTAL CLIENTE
    portal_noticias: {
        titulo: "Noticias",
        subtitulo: "Mantente al día con las novedades, eventos y actualizaciones de nuestra plataforma.",
        cargando: "Cargando noticias...",
        vacio: "Aún no hay noticias publicadas. ¡Vuelve pronto!",
        ultimas_titulo: "Últimas noticias",
        sin_imagen: "Sin Imagen",
        leer_mas: "Leer noticia completa →",
        newsletter_titulo: "Suscríbete a nuestro newsletter",
        newsletter_subtitulo: "Recibe en tu correo las últimas noticias y consejos para el cuidado de tu voz.",
        newsletter_placeholder: "ejemplo@correo.com",
        newsletter_boton: "Suscribirme",
        newsletter_boton_enviando: "Enviando...",
        newsletter_error_email: "Ingresa un correo electrónico válido.",
        newsletter_error_servidor: "No pudimos registrar tu suscripción. Inténtalo más tarde.",
        newsletter_exito: "¡Gracias por suscribirte! Pronto recibirás nuestras novedades."
    },

    // ===================== PORTAL MÉDICO (profesionales fonoaudiólogos) =====================

    // NAVBAR DEL PORTAL MÉDICO
    pm_navbar: {
        marca: "Portal Médico",
        inicio: "Inicio",
        directorio: "Directorio",
        mi_perfil: "Mi Perfil",
        documentos: "Documentos",
        especialidades: "Especialidades",
        acreditacion: "Mi Acreditación",
        iniciar_sesion: "Iniciar Sesión",
        registrarme: "Registrarme",
        cerrar_sesion: "Cerrar Sesión",
        volver_portal: "← Volver al portal público"
    },

    // INICIO DEL PORTAL MÉDICO (landing: fonoaudiólogo vs. quien busca atención)
    pm_inicio: {
        titulo: "Portal Médico FonoFace",
        subtitulo: "El punto de encuentro entre fonoaudiólogos acreditados y quienes buscan atención personalizada de la voz.",

        card_fono_titulo: "¿Eres fonoaudiólogo/a?",
        card_fono_desc: "Regístrate para acreditarte, publicar tu perfil profesional en el directorio público y que pacientes puedan encontrarte y contactarte directamente.",
        beneficio_1: "✓ Aparece en el directorio público una vez acreditado.",
        beneficio_2: "✓ Sube tus documentos de respaldo y sigue el estado de tu acreditación.",
        beneficio_3: "✓ Elige las especialidades que ofreces.",
        beneficio_4: "✓ Gestiona tus datos de contacto en cualquier momento.",
        stat_resumen: "Ya son {profesionales} profesionales acreditados con {especialidades} especialidades disponibles.",
        btn_registro: "¿Eres fonoaudiólogo? Regístrate aquí",
        btn_login: "Ya tengo cuenta, iniciar sesión",

        card_cliente_titulo: "¿Buscas atención fonoaudiológica?",
        card_cliente_desc: "Regístrate para solicitar atención telemática y graba un video corto mostrando tus síntomas: el fonoaudiólogo podrá revisarlo antes de atenderte. También puedes explorar el directorio de profesionales acreditados.",
        beneficio_cliente_1: "✓ Registro simple, sin trámites.",
        beneficio_cliente_2: "✓ Muestra tus síntomas en un video de hasta 30 segundos.",
        beneficio_cliente_3: "✓ Tu video es privado y se elimina solo a los 30 días.",
        beneficio_cliente_4: "✓ Revisa el directorio de profesionales acreditados.",
        btn_registro_cliente: "Registrarme como paciente",
        btn_directorio: "Ver directorio de profesionales"
    },

    // ESTADOS DE ACREDITACIÓN (compartido por varias vistas)
    pm_estados: {
        PENDIENTE: "Pendiente",
        EN_REVISION: "En revisión",
        APROBADO: "Aprobado",
        RECHAZADO: "Rechazado"
    },

    // TIPOS DE DOCUMENTO (compartido)
    pm_tipos_documento: {
        CEDULA_IDENTIDAD: "Cédula de identidad",
        CERTIFICADO_TITULO: "Certificado de título",
        CERTIFICADO_SUPERINTENDENCIA: "Certificado Superintendencia de Salud"
    },

    // PESTAÑAS DEL INICIO DE SESIÓN DEL PORTAL MÉDICO
    pm_login_tabs: {
        aria_selector: "Elige el tipo de cuenta con la que quieres entrar",
        paciente: "Soy paciente",
        profesional: "Soy fonoaudiólogo/a",
        sin_cuenta: "¿Todavía no tienes cuenta?",
        registro_paciente: "Regístrate como paciente",
        registro_profesional: "Regístrate como profesional"
    },

    // LOGIN DEL PROFESIONAL
    pm_login: {
        titulo: "Portal Médico FonoFace",
        subtitulo: "Ingresa con tu correo o RUT para gestionar tu acreditación",
        label_identificador: "Correo o RUT",
        placeholder_identificador: "ejemplo@correo.com o 12345678-9",
        alerta_identificador: "El correo o RUT es obligatorio.",
        label_password: "Contraseña",
        placeholder_password: "********",
        alerta_password: "La contraseña es obligatoria.",
        btn_ingresando: "Ingresando...",
        btn_ingresar: "Iniciar Sesión",
        msg_sin_cuenta: "¿Aún no tienes una cuenta profesional?",
        btn_registrarme: "Regístrate aquí",
        error_credenciales: "Correo/RUT o contraseña incorrectos.",
        error_servidor: "Error al conectar con el servidor.",
        aviso_sesion_expirada: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
    },

    // REGISTRO DEL PROFESIONAL
    pm_registro: {
        titulo: "Registro de Profesional",
        subtitulo: "Crea tu cuenta para iniciar el proceso de acreditación como fonoaudiólogo/a.",
        label_nombres: "Nombres",
        placeholder_nombres: "Ej: María José",
        alerta_nombres: "Los nombres son obligatorios.",
        label_apellidos: "Apellidos",
        placeholder_apellidos: "Ej: González Soto",
        alerta_apellidos: "Los apellidos son obligatorios.",
        label_rut: "RUT",
        placeholder_rut: "12345678-5",
        alerta_rut: "Ingresa un RUT chileno válido, con el dígito verificador correcto (ej: 12345678-5).",
        label_email: "Correo Electrónico",
        placeholder_email: "ejemplo@correo.com",
        alerta_email_req: "El correo es obligatorio.",
        alerta_email_inv: "El formato del correo no es válido.",
        label_telefono: "Teléfono",
        placeholder_telefono: "+56912345678",
        alerta_telefono: "Ingresa un teléfono chileno válido (ej: +56912345678).",
        label_numero_registro: "Número de Registro de Salud (opcional)",
        placeholder_numero_registro: "Puedes completarlo más adelante desde tu perfil",
        label_password: "Contraseña",
        placeholder_password: "Mín. 8 caracteres",
        alerta_password: "La contraseña debe tener al menos 8 caracteres.",
        help_info: "Tras registrarte, tu solicitud de acreditación quedará en estado \"Pendiente\". Sube tus documentos de respaldo desde tu perfil para avanzar en la revisión.",
        btn_registrando: "Creando cuenta...",
        btn_registrar: "Crear Cuenta",
        msg_ya_tengo_cuenta: "¿Ya tienes una cuenta?",
        btn_ir_login: "Inicia sesión aquí",
        exito: "Cuenta creada correctamente. Ahora puedes iniciar sesión.",
        error_servidor: "No se pudo completar el registro. Verifica los datos ingresados."
    },

    // DIRECTORIO PÚBLICO DE PROFESIONALES
    pm_directorio: {
        titulo: "Directorio de Fonoaudiólogos",
        subtitulo: "Profesionales acreditados y habilitados para prestar servicios.",
        cargando: "Cargando profesionales...",
        vacio: "Aún no hay profesionales acreditados publicados en el directorio.",
        sin_especialidades: "Sin especialidades registradas",
        contacto_email: "Correo:",
        contacto_telefono: "Teléfono:",
        numero_registro: "N° Registro Salud:"
    },

    // MI PERFIL (profesional)
    pm_perfil: {
        titulo: "Mi Perfil Profesional",
        subtitulo: "Revisa y actualiza tus datos de contacto.",
        cargando: "Cargando tu perfil...",
        seccion_datos: "Datos de Contacto",
        label_nombres: "Nombres",
        label_apellidos: "Apellidos",
        label_rut: "RUT",
        label_email: "Correo Electrónico",
        label_telefono: "Teléfono",
        label_numero_registro: "Número de Registro de Salud",
        placeholder_numero_registro: "Necesario para que tu acreditación pueda aprobarse",
        btn_guardando: "Guardando...",
        btn_guardar: "Guardar Cambios",
        exito_actualizacion: "Perfil actualizado correctamente.",

        seccion_password: "Cambiar Contraseña",
        label_password_actual: "Contraseña Actual",
        label_password_nueva: "Contraseña Nueva",
        placeholder_password_nueva: "Mín. 8 caracteres",
        btn_cambiando: "Cambiando...",
        btn_cambiar_password: "Cambiar Contraseña",
        exito_password: "Contraseña actualizada correctamente.",

        seccion_peligro: "Zona de Peligro",
        desc_eliminar: "Al desactivar tu cuenta ya no podrás iniciar sesión ni prestar servicios en el directorio.",
        btn_eliminar_cuenta: "Desactivar mi Cuenta",
        confirmar_eliminar: "¿Estás seguro de que deseas desactivar tu cuenta? Esta acción no se puede deshacer desde el portal.",

        error_actualizar: "No se pudo actualizar el perfil. Revisa los datos ingresados.",
        error_password: "No se pudo cambiar la contraseña. Verifica tu contraseña actual."
    },

    // MIS DOCUMENTOS DE RESPALDO
    pm_documentos: {
        titulo: "Mis Documentos de Respaldo",
        subtitulo: "Sube tus documentos para avanzar en la revisión de tu acreditación.",
        cargando: "Cargando documentos...",
        vacio: "Aún no has subido documentos de respaldo.",
        label_tipo: "Tipo de Documento",
        placeholder_tipo: "Selecciona un tipo...",
        label_archivo: "Archivo (PDF, JPG o PNG, máx. 5MB)",
        alerta_archivo: "Debes seleccionar un archivo.",
        btn_subiendo: "Subiendo...",
        btn_subir: "Subir Documento",
        estado_validado: "Validado",
        estado_pendiente: "Pendiente de revisión",
        // Visor del documento (se abre sobre la ficha, sin salir de la página)
        visor_titulo: "Documento de respaldo",
        visor_cargando: "Abriendo el documento...",
        visor_error_titulo: "No se pudo mostrar el documento",
        visor_error_desc: "El archivo existe, pero el servicio de almacenamiento está bloqueando su entrega. Un administrador debe habilitar la entrega de PDF en Cloudinary (Settings → Security → Restricted media types).",
        visor_btn_descargar: "Abrir en una pestaña nueva",
        visor_btn_cerrar: "Cerrar",
        btn_ver: "Ver",
        btn_eliminar: "Eliminar",
        confirmar_eliminar: "¿Deseas eliminar este documento? Solo es posible si aún no fue validado.",
        exito_subir: "Documento subido correctamente. Quedó pendiente de revisión.",
        exito_eliminar: "Documento eliminado correctamente.",
        error_subir: "No se pudo subir el documento. Verifica el formato y el tamaño del archivo.",
        error_eliminar: "No se pudo eliminar el documento (puede que ya haya sido validado)."
    },

    // MIS ESPECIALIDADES
    pm_especialidades: {
        titulo: "Mis Especialidades",
        subtitulo: "Elige las especialidades que ofreces como profesional.",
        cargando: "Cargando especialidades...",
        seccion_mias: "Especialidades Asignadas",
        vacio_mias: "Aún no tienes especialidades asignadas.",
        seccion_catalogo: "Catálogo Disponible",
        requiere_certificado: "Requiere certificado validado",
        btn_asignar: "Asignar",
        btn_quitar: "Quitar",
        confirmar_quitar: "¿Deseas quitar esta especialidad de tu perfil?",
        exito_asignar: "Especialidad asignada correctamente.",
        exito_quitar: "Especialidad quitada correctamente.",
        error_asignar: "No se pudo asignar la especialidad (revisa si requiere un documento validado).",
        error_quitar: "No se pudo quitar la especialidad."
    },

    // ESTADO DE MI ACREDITACIÓN
    pm_acreditacion: {
        titulo: "Estado de mi Acreditación",
        subtitulo: "Sigue el avance de la revisión de tu solicitud.",
        cargando: "Consultando el estado de tu acreditación...",
        sin_solicitud: "No se encontró una solicitud de acreditación asociada a tu cuenta.",
        fecha_solicitud: "Fecha de solicitud:",
        fecha_resolucion: "Fecha de resolución:",
        desc_pendiente: "Tu solicitud fue registrada. Sube tus documentos de respaldo para pasar a revisión.",
        desc_en_revision: "Un administrador está revisando tus documentos y tus datos.",
        desc_aprobado: "¡Felicidades! Tu acreditación fue aprobada y ya apareces en el directorio público.",
        desc_rechazado: "Tu solicitud fue rechazada. Revisa tus documentos y contacta al equipo de soporte."
    },

    // ===================== PORTAL MÉDICO — PANEL DE ADMINISTRACIÓN =====================

    // LISTADO ADMIN DE PROFESIONALES
    gestion_pm_profesionales: {
        titulo: "Profesionales del Portal Médico",
        subtitulo: "Revisa las solicitudes de acreditación de los fonoaudiólogos registrados.",
        filtrar_estado: "Filtrar por Estado:",
        estado_todos: "Todos",
        boton_ver: "Ver Detalle"
    },

    // DETALLE ADMIN DE UN PROFESIONAL
    pm_profesional_detalle: {
        titulo: "Detalle del Profesional",
        volver: "Volver al listado",
        seccion_datos: "Datos del Profesional",
        label_nombre: "Nombre completo:",
        label_rut: "RUT:",
        label_email: "Correo:",
        label_telefono: "Teléfono:",
        label_numero_registro: "N° Registro de Salud:",
        label_registrado_desde: "Registrado desde:",

        seccion_acreditacion: "Acreditación",
        sin_acreditacion: "Este profesional no tiene solicitudes de acreditación.",
        btn_aprobar: "Aprobar Acreditación",
        btn_rechazar: "Rechazar Acreditación",
        confirmar_aprobar: "¿Confirmas aprobar la acreditación de este profesional? Pasará a aparecer en el directorio público.",
        confirmar_rechazar: "¿Confirmas rechazar la acreditación de este profesional?",
        exito_aprobar: "Acreditación aprobada correctamente. El profesional ya aparece en el directorio público.",
        exito_rechazar: "Acreditación rechazada correctamente.",
        error_resolver: "No se pudo resolver la acreditación. Verifica que el profesional cumpla los requisitos (N° de registro y al menos un documento validado) y que tengas permisos de administrador (rol Admin o SuperAdmin).",
        error_permisos: "Requiere el rol Admin o SuperAdmin para realizar esta acción.",
        ya_resuelta: "Esta solicitud ya fue resuelta.",

        seccion_documentos: "Documentos de Respaldo",
        sin_documentos: "El profesional aún no ha subido documentos.",
        btn_marcar_valido: "Marcar como Válido",
        btn_marcar_invalido: "Quitar Validación",
        exito_validar: "Documento marcado como válido correctamente.",
        exito_invalidar: "Se quitó la validación del documento.",
        error_validar: "No se pudo actualizar el documento. Verifica que tengas permisos de administrador (rol Admin o SuperAdmin).",

        seccion_especialidades: "Especialidades",
        sin_especialidades: "El profesional no tiene especialidades asignadas."
    },

    // CATÁLOGO ADMIN DE ESPECIALIDADES
    gestion_pm_especialidades: {
        titulo: "Catálogo de Especialidades",
        subtitulo: "Administra las especialidades que los profesionales pueden asignarse.",
        nueva_especialidad: "Nueva Especialidad",
        label_nombre: "Nombre de la Especialidad",
        placeholder_nombre: "Ej: Terapia de deglución",
        alerta_nombre: "El nombre es obligatorio.",
        label_requiere_certificado: "Requiere certificado validado",
        desc_requiere_certificado: "El profesional necesitará un documento validado para poder asignársela.",
        btn_guardando: "Guardando...",
        btn_guardar: "Guardar Especialidad",
        btn_cancelar: "Cancelar",
        confirmar_eliminar: "¿Deseas eliminar esta especialidad del catálogo?",
        exito_crear: "Especialidad creada correctamente.",
        exito_editar: "Especialidad actualizada correctamente.",
        exito_eliminar: "Especialidad eliminada correctamente.",
        error_guardar: "No se pudo guardar la especialidad. Verifica que tengas permisos de administrador (rol Admin o SuperAdmin).",
        error_eliminar: "No se pudo eliminar la especialidad."
    },

    // =====================================================================
    // PORTAL MÉDICO — PACIENTES (apps PmCliente y PmVideo del backend)
    // =====================================================================

    // GUÍA DE PASOS DEL PROFESIONAL (mejora de usabilidad del portal médico)
    pm_pasos: {
        titulo: "Tu acreditación paso a paso",
        subtitulo: "Completa estos pasos para aparecer en el directorio público.",
        paso_1_titulo: "Crea tu cuenta",
        paso_1_desc: "Registra tus datos profesionales.",
        paso_2_titulo: "Sube tus documentos",
        paso_2_desc: "Cédula de identidad y certificado de título.",
        paso_3_titulo: "Elige tus especialidades",
        paso_3_desc: "Indica las áreas en las que atiendes.",
        paso_4_titulo: "Espera la revisión",
        paso_4_desc: "Un administrador valida tus antecedentes.",
        estado_completado: "Listo",
        estado_actual: "Vas aquí",
        estado_pendiente: "Pendiente",
        ir_al_paso: "Continuar"
    },

    // REGISTRO DEL PACIENTE
    pmc_registro: {
        titulo: "Regístrate como paciente",
        subtitulo: "Completa tus datos para solicitar atención fonoaudiológica telemática. Solo te tomará un minuto.",
        label_nombres: "Nombres",
        placeholder_nombres: "Ej: María José",
        alerta_nombres: "Escribe tus nombres.",
        label_apellidos: "Apellidos",
        placeholder_apellidos: "Ej: Soto Rivas",
        alerta_apellidos: "Escribe tus apellidos.",
        label_rut: "RUT",
        placeholder_rut: "12345678-9",
        ayuda_rut: "Sin puntos y con guion. Ejemplo: 12345678-9",
        alerta_rut: "Escribe un RUT válido (sin puntos y con guion).",
        label_fecha_nacimiento: "Fecha de nacimiento",
        alerta_fecha_nacimiento: "Selecciona tu fecha de nacimiento.",
        alerta_fecha_futura: "La fecha de nacimiento no puede ser posterior a hoy.",
        label_email: "Correo electrónico",
        placeholder_email: "ejemplo@correo.cl",
        ayuda_email: "Lo usaremos para contactarte sobre tu atención.",
        alerta_email_req: "Escribe tu correo electrónico.",
        alerta_email_inv: "El formato del correo no es válido.",
        label_telefono: "Teléfono",
        placeholder_telefono: "+56912345678",
        ayuda_telefono: "Incluye el código del país o parte con 9.",
        alerta_telefono: "Escribe un teléfono válido.",
        label_password: "Contraseña",
        placeholder_password: "Mínimo 8 caracteres",
        ayuda_password: "La usarás para entrar y revisar tus videos. Evita contraseñas obvias o solo numéricas.",
        alerta_password_req: "Crea una contraseña.",
        alerta_password_min: "Debe tener al menos 8 caracteres.",
        btn_registrando: "Registrando...",
        btn_registrar: "Crear mi cuenta",
        exito_titulo: "¡Listo, {nombre}! Tu cuenta quedó creada.",
        exito_desc: "Inicia sesión para subir tu video de síntomas y revisarlo cuando quieras.",
        btn_ir_login: "Iniciar sesión",
        btn_ver_directorio: "Ver fonoaudiólogos disponibles",
        error_servidor: "No pudimos completar tu registro. Revisa tus datos e inténtalo nuevamente.",
        ya_autenticado_titulo: "Ya tienes la sesión iniciada",
        ya_autenticado_desc: "Estás dentro como {nombre}.",
        btn_ir_video: "Ir a mis videos"
    },

    // INICIO DE SESIÓN DEL PACIENTE
    pmc_login: {
        titulo: "Inicia sesión como paciente",
        subtitulo: "Entra con tu correo o RUT para subir y revisar tus videos de síntomas.",
        label_identificador: "Correo o RUT",
        placeholder_identificador: "ejemplo@correo.cl o 12345678-9",
        alerta_identificador: "Escribe tu correo o tu RUT.",
        label_password: "Contraseña",
        placeholder_password: "Tu contraseña",
        alerta_password: "Escribe tu contraseña.",
        btn_ingresando: "Entrando...",
        btn_ingresar: "Entrar",
        sin_cuenta: "¿Todavía no tienes cuenta?",
        btn_registrarme: "Regístrate aquí",
        error_credenciales: "Correo/RUT o contraseña incorrectos.",
        error_servidor: "No pudimos iniciar tu sesión. Inténtalo nuevamente.",
        aviso_sesion_expirada: "Tu sesión expiró. Vuelve a entrar para continuar."
    },

    // LISTA DE VIDEOS DEL PACIENTE
    pmc_mis_videos: {
        titulo: "Mis videos",
        subtitulo: "Estos son los videos que el profesional podrá revisar.",
        cargando: "Cargando tus videos...",
        vacio: "Todavía no has subido ningún video.",
        subido_el: "Subido el",
        duracion: "Duración:",
        vence_en: "Se elimina en {dias} días",
        btn_eliminar: "Retirar video",
        confirmar_eliminar: "¿Seguro que quieres retirar este video? No se puede deshacer.",
        exito_eliminar: "Video retirado correctamente.",
        error_eliminar: "No pudimos retirar el video. Inténtalo nuevamente."
    },

    // SUBIDA DEL VIDEO DE SÍNTOMAS
    pmc_video: {
        titulo: "Sube tu video de síntomas",
        subtitulo: "Un video corto ayuda al fonoaudiólogo a entender tu caso antes de la atención.",
        sin_registro_titulo: "Primero necesitas registrarte",
        sin_registro_desc: "Para asociar el video a tu ficha, necesitamos tus datos de contacto.",
        btn_ir_registro: "Ir al registro",
        identificado_como: "Subiendo como:",
        label_cita: "¿Es para una cita en particular? (opcional)",
        placeholder_cita: "Sin asociar a ninguna cita",
        ayuda_cita: "Si lo asocias, el fonoaudiólogo de esa cita lo verá junto a tu motivo de consulta.",
        opcion_cita: "{fecha} — {profesional}",
        opcion_cita_simple: "{fecha}",
        sin_citas_disponibles: "No tienes citas reservadas a las que adjuntar el video.",
        btn_reservar_hora: "Reservar una hora",
        label_video: "Tu video",
        ayuda_video: "Máximo {segundos} segundos y {peso} MB. Formatos: {formatos}.",
        alerta_video_req: "Selecciona un video.",
        alerta_video_formato: "Ese formato no está permitido. Usa {formatos}.",
        alerta_video_peso: "El video pesa {peso} MB y el máximo es {maximo} MB.",
        alerta_video_duracion: "El video dura {duracion} segundos y el máximo son {maximo}.",
        archivo_seleccionado: "Archivo seleccionado:",
        duracion_detectada: "Duración detectada:",
        segundos: "segundos",
        label_descripcion: "¿Qué quieres mostrar? (opcional)",
        placeholder_descripcion: "Ej: Se me entrecorta la voz cuando leo en voz alta.",
        btn_subiendo: "Subiendo video...",
        btn_subir: "Enviar mi video",
        consejos_titulo: "Para que se entienda mejor",
        consejo_1: "Grábate en un lugar silencioso y bien iluminado.",
        consejo_2: "Habla o lee en voz alta para que se escuche tu voz.",
        consejo_3: "Muestra el síntoma que quieres explicar.",
        exito_titulo: "¡Video enviado!",
        exito_desc: "El profesional podrá revisarlo. Se guardará por {dias} días y luego se eliminará automáticamente.",
        btn_subir_otro: "Subir otro video",
        aviso_privacidad: "Tu video es material clínico: solo lo verán profesionales acreditados y se elimina solo a los {dias} días.",
        error_servidor: "No pudimos subir tu video. Revisa tu conexión e inténtalo nuevamente."
    },

    // RESERVA DE UNA CITA (lado del paciente)
    pmc_reservar: {
        titulo: "Reservar una hora",
        subtitulo: "Elige al fonoaudiólogo y el horario que te acomode. Podrás cancelarla o cambiarla después.",
        identificado_como: "Reservando como:",
        paso_profesional: "1. ¿Con quién quieres atenderte?",
        paso_horario: "2. Elige una hora disponible",
        paso_motivo: "3. Motivo de consulta",
        paso_datos: "4. Tus datos",
        cargando_profesionales: "Buscando fonoaudiólogos disponibles...",
        vacio_profesionales_titulo: "Todavía no hay fonoaudiólogos disponibles",
        vacio_profesionales_desc: "Solo aparecen aquí los profesionales con su acreditación aprobada. Vuelve a intentarlo más adelante.",
        label_especialidad: "Filtrar por especialidad",
        opcion_todas_especialidades: "Todas las especialidades",
        ayuda_especialidad: "Opcional. Acota el listado a quienes tratan lo que necesitas.",
        vacio_por_especialidad: "Ningún fonoaudiólogo acreditado declara esa especialidad. Prueba con otra o quita el filtro.",
        contador_profesionales: "{cantidad} de {total} profesionales",
        label_profesional: "Fonoaudiólogo",
        placeholder_profesional: "Selecciona un profesional",
        alerta_profesional: "Elige con quién quieres atenderte.",
        registro_salud: "Registro de salud:",
        sin_especialidades: "Sin especialidades declaradas",
        label_fecha_hora: "Fecha y hora",
        ayuda_fecha_hora: "Debe ser con al menos {horas} horas de anticipación.",
        alerta_fecha_hora_req: "Elige la fecha y la hora.",
        alerta_anticipacion: "Falta muy poco para ese horario. Elige uno con al menos {horas} horas de anticipación.",
        label_duracion: "Duración estimada",
        ayuda_duracion: "Entre {minima} y {maxima} minutos. Por defecto son {defecto}.",
        minutos: "minutos",
        // Horas publicadas por el profesional
        elegir_profesional_primero: "Primero elige un fonoaudiólogo y verás las horas que tiene disponibles.",
        cargando_horas: "Buscando horas disponibles...",
        vacio_horas_titulo: "Este profesional no tiene horas publicadas",
        vacio_horas_desc: "Prueba con otro fonoaudiólogo o vuelve más adelante: las horas se publican con anticipación.",
        error_horas: "No pudimos cargar las horas disponibles. Inténtalo nuevamente.",
        horas_de_dia: "{cantidad} horas disponibles",
        hora_seleccionada: "Hora elegida:",
        btn_cambiar_hora: "Elegir otra hora",
        duracion_de_la_hora: "Dura {minutos} minutos",
        label_motivo: "Motivo de la consulta (opcional)",
        placeholder_motivo: "Ej: Se me entrecorta la voz al final del día.",
        ayuda_motivo: "Ayuda al profesional a preparar la atención.",
        btn_reservando: "Reservando...",
        btn_reservar: "Confirmar mi hora",
        reglas_titulo: "Antes de reservar, ten en cuenta",
        regla_anticipacion: "Se reserva con al menos {horas} horas de anticipación, y ese mismo margen aplica para cancelar o cambiarla.",
        regla_reprogramaciones: "Puedes cambiar la fecha hasta {maximas} veces; después habría que cancelar y reservar de nuevo.",
        regla_video: "Mientras la cita siga reservada, puedes adjuntarle un video de síntomas.",
        // Datos personales de quien reserva sin cuenta
        datos_desc: "No necesitas registrarte para reservar. Completa tus datos y listo.",
        datos_con_sesion: "Usaremos los datos de tu cuenta.",
        aviso_cuenta_existente: "¿Ya tienes cuenta? Inicia sesión y tus datos se completan solos.",
        btn_iniciar_sesion: "Iniciar sesión",
        exito_titulo: "¡Hora reservada!",
        exito_desc: "Te esperamos el {fecha}. La encontrarás en «Mis citas».",
        exito_desc_invitado: "Te esperamos el {fecha}. Te contactaremos al correo que indicaste.",
        exito_invitado_cuenta: "Creamos tu ficha con el RUT que ingresaste. Si te registras con ese mismo RUT podrás ver y gestionar tus horas desde el portal.",
        btn_crear_cuenta: "Crear mi cuenta",
        btn_ver_mis_citas: "Ver mis citas",
        btn_adjuntar_video: "Adjuntar un video de síntomas",
        btn_reservar_otra: "Reservar otra hora",
        error_servidor: "No pudimos reservar la hora. Revisa los datos e inténtalo nuevamente.",
        error_profesionales: "No pudimos cargar el listado de fonoaudiólogos. Inténtalo nuevamente."
    },

    // CITAS DEL PACIENTE
    pmc_mis_citas: {
        titulo: "Mis citas",
        subtitulo: "Aquí ves tus horas agendadas y el historial de las anteriores.",
        cargando: "Cargando tus citas...",
        filtro_proximas: "Próximas",
        filtro_historial: "Historial completo",
        vacio_proximas_titulo: "No tienes horas agendadas",
        vacio_proximas_desc: "Reserva una hora con un fonoaudiólogo acreditado cuando lo necesites.",
        vacio_historial: "Todavía no tienes citas registradas.",
        btn_reservar: "Reservar una hora",
        con_profesional: "Profesional:",
        profesional_numero: "Profesional n.º {id}",
        duracion: "Duración:",
        minutos: "minutos",
        motivo: "Motivo:",
        sin_motivo: "Sin motivo indicado",
        termina_a_las: "Termina cerca de las {hora}",
        estado_reservada: "Reservada",
        estado_realizada: "Realizada",
        estado_cancelada_cliente: "Cancelada por ti",
        estado_cancelada_medico: "Cancelada por el profesional",
        reprogramada_veces: "Reprogramada {veces} de {maximas} veces",
        fecha_original: "Se agendó originalmente para el {fecha}",
        motivo_cancelacion: "Motivo de la cancelación:",
        cambios_cerrados: "Ya no admite cambios: faltan menos de {horas} horas.",
        sin_reprogramaciones: "Alcanzó el máximo de {maximas} cambios de fecha. Si ya no te sirve, cancélala y reserva otra.",
        ya_paso: "Esta hora ya pasó y el profesional aún no la marca como realizada.",
        admite_video: "Puedes adjuntarle un video de síntomas.",
        btn_adjuntar_video: "Adjuntar video",
        btn_posponer: "Cambiar fecha",
        btn_cancelar: "Cancelar hora",
        // Cambio de fecha
        posponer_titulo: "Cambiar la fecha de la cita",
        posponer_actual: "Hoy está agendada para el {fecha}.",
        posponer_restantes: "Te quedan {restantes} cambios de fecha.",
        label_nueva_fecha: "Nueva fecha y hora",
        label_motivo_cambio: "Motivo del cambio (opcional)",
        placeholder_motivo_cambio: "Ej: Me cambiaron el turno en el trabajo.",
        btn_confirmar_posponer: "Guardar la nueva fecha",
        btn_volver: "Volver",
        exito_posponer: "Listo, la cita quedó para el {fecha}.",
        error_posponer: "No pudimos cambiar la fecha. Inténtalo nuevamente.",
        // Cancelación
        cancelar_titulo: "Cancelar la cita",
        cancelar_desc: "Se liberará el horario del profesional. Si después la necesitas, tendrás que reservar de nuevo.",
        label_motivo_cancelacion: "Motivo (opcional)",
        placeholder_motivo_cancelacion: "Ej: Ya no puedo asistir ese día.",
        btn_confirmar_cancelar: "Sí, cancelar la hora",
        btn_no_cancelar: "No, mantenerla",
        exito_cancelar: "Tu cita quedó cancelada.",
        error_cancelar: "No pudimos cancelar la cita. Inténtalo nuevamente.",
        error_servidor: "No pudimos cargar tus citas. Inténtalo nuevamente."
    },

    // AGENDA DEL PROFESIONAL
    pm_agenda: {
        titulo: "Mi agenda",
        subtitulo: "Las horas que tus pacientes han reservado contigo.",
        cargando: "Cargando tu agenda...",
        filtro_proximas: "Próximas",
        filtro_historial: "Historial completo",
        vacio_proximas_titulo: "No tienes horas agendadas",
        vacio_proximas_desc: "Cuando un paciente reserve contigo, la verás aquí con su motivo de consulta.",
        vacio_historial: "Todavía no tienes citas registradas.",
        sin_acreditacion_titulo: "Tu cuenta aún no está acreditada",
        sin_acreditacion_desc: "Los pacientes solo pueden reservar con profesionales cuya acreditación fue aprobada. Completa tus antecedentes para aparecer en el directorio.",
        btn_ir_perfil: "Revisar mi acreditación",
        paciente: "Paciente:",
        paciente_numero: "Paciente n.º {id}",
        duracion: "Duración:",
        minutos: "minutos",
        motivo: "Motivo de consulta:",
        sin_motivo: "El paciente no indicó motivo",
        termina_a_las: "Termina cerca de las {hora}",
        estado_reservada: "Reservada",
        estado_realizada: "Realizada",
        estado_cancelada_cliente: "Cancelada por el paciente",
        estado_cancelada_medico: "Cancelada por ti",
        reprogramada_veces: "Reprogramada {veces} de {maximas} veces",
        fecha_original: "Se agendó originalmente para el {fecha}",
        motivo_cancelacion: "Motivo de la cancelación:",
        cambios_cerrados: "Ya no admite cambios: faltan menos de {horas} horas.",
        sin_reprogramaciones: "Alcanzó el máximo de {maximas} cambios de fecha.",
        pendiente_de_cerrar: "Esta hora ya pasó. Márcala como realizada si atendiste al paciente.",
        // Videos adjuntos a la cita
        videos_titulo: "Videos de síntomas de esta cita",
        videos_cargando: "Buscando videos adjuntos...",
        videos_vacio: "El paciente no adjuntó videos a esta cita.",
        videos_ver: "Ver videos adjuntos",
        videos_ocultar: "Ocultar videos",
        video_duracion: "Duración:",
        video_segundos: "segundos",
        video_vence_en: "Se elimina en {dias} días",
        video_subido_el: "Subido el",
        videos_error: "No pudimos cargar los videos de esta cita.",
        // Acciones
        btn_marcar_realizada: "Marcar como realizada",
        btn_posponer: "Reprogramar",
        btn_cancelar: "Cancelar cita",
        confirmar_realizada: "¿Confirmas que atendiste esta cita?",
        exito_realizada: "La cita quedó marcada como realizada.",
        error_realizada: "No pudimos marcar la cita como realizada. Inténtalo nuevamente.",
        posponer_titulo: "Reprogramar la cita",
        posponer_actual: "Hoy está agendada para el {fecha}.",
        posponer_restantes: "Quedan {restantes} cambios de fecha disponibles.",
        posponer_aviso: "El paciente verá el nuevo horario y el motivo que indiques.",
        label_nueva_fecha: "Nueva fecha y hora",
        label_motivo_cambio: "Motivo del cambio (opcional)",
        placeholder_motivo_cambio: "Ej: Debo reagendar por una urgencia.",
        btn_confirmar_posponer: "Guardar la nueva fecha",
        btn_volver: "Volver",
        exito_posponer: "La cita quedó reprogramada para el {fecha}.",
        error_posponer: "No pudimos reprogramar la cita. Inténtalo nuevamente.",
        cancelar_titulo: "Cancelar la cita",
        cancelar_desc: "El paciente verá que la cancelaste tú, junto con el motivo que indiques.",
        label_motivo_cancelacion: "Motivo (opcional)",
        placeholder_motivo_cancelacion: "Ej: Debo suspender la atención de ese día.",
        btn_confirmar_cancelar: "Sí, cancelar la cita",
        btn_no_cancelar: "No, mantenerla",
        exito_cancelar: "La cita quedó cancelada.",
        error_cancelar: "No pudimos cancelar la cita. Inténtalo nuevamente.",
        error_servidor: "No pudimos cargar tu agenda. Inténtalo nuevamente."
    },

    // HORAS DISPONIBLES QUE PUBLICA EL PROFESIONAL
    pm_disponibilidad: {
        titulo: "Mis horas disponibles",
        subtitulo: "Publica las horas en que puedes atender. Los pacientes solo pueden reservar dentro de ellas.",
        sin_acreditacion_titulo: "Tu cuenta aún no está acreditada",
        sin_acreditacion_desc: "Puedes publicar horas, pero no aparecerás en el buscador de pacientes hasta que se apruebe tu acreditación.",
        btn_ir_perfil: "Revisar mi acreditación",
        // Publicación
        publicar_titulo: "Publicar horas",
        label_fecha: "Día",
        ayuda_fecha: "Solo puedes publicar días de hoy en adelante.",
        alerta_fecha: "Elige el día.",
        label_desde: "Desde",
        label_hasta: "Hasta",
        alerta_rango: "La hora de término debe ser posterior a la de inicio.",
        label_duracion: "Duración de cada hora",
        minutos: "minutos",
        vista_previa: "Se publicarán {cantidad} horas:",
        vista_previa_vacia: "Con ese rango y esa duración no alcanza ninguna hora completa.",
        btn_publicando: "Publicando...",
        btn_publicar: "Publicar estas horas",
        exito_publicar: "Se publicaron {cantidad} horas.",
        parcial_publicar: "Se publicaron {creadas} horas. {rechazadas} no se pudieron publicar:",
        ninguna_publicada: "No se publicó ninguna hora:",
        error_publicar: "No pudimos publicar las horas. Inténtalo nuevamente.",
        // Listado
        listado_titulo: "Horas publicadas",
        cargando: "Cargando tus horas...",
        filtro_proximas: "Próximas",
        filtro_todas: "Incluir pasadas",
        vacio_titulo: "Todavía no has publicado horas",
        vacio_desc: "Mientras no publiques ninguna, los pacientes no podrán reservar contigo.",
        estado_libre: "Libre",
        estado_reservada: "Reservada",
        estado_pasada: "Ya pasó",
        estado_retirada: "Retirada",
        termina_a_las: "hasta las {hora}",
        btn_retirar: "Retirar",
        confirmar_retirar: "¿Retirar esta hora? Dejará de ofrecerse a los pacientes.",
        exito_retirar: "La hora se retiró y ya no se ofrece.",
        error_retirar: "No pudimos retirar la hora.",
        aviso_reservada: "Esta hora ya tiene paciente. Si no puedes atenderla, cancélala desde tu agenda indicando el motivo.",
        btn_ir_agenda: "Ir a mi agenda",
        error_servidor: "No pudimos cargar tus horas. Inténtalo nuevamente."
    },

    // NAVEGACIÓN DEL PACIENTE (se suma al navbar del portal médico)
    pmc_navbar: {
        soy_paciente: "Soy paciente",
        registrarme: "Registrarme",
        iniciar_sesion: "Entrar como paciente",
        mi_video: "Mis videos",
        mis_citas: "Mis citas",
        reservar_hora: "Reservar hora",
        mi_agenda: "Mi agenda",
        mis_horas: "Mis horas",
        cerrar_sesion: "Salir"
    }
};