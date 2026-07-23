export const TEXTOS_SITIO = {
    // TEXTOS GLOBALES
    
    globales: {
        marca: "FonoFace",
        boton_guardar: "Guardar Cambios",
        boton_cancelar: "Cancelar",
        boton_volver: "Volver",
        cerrar_sesion: "Cerrar Sesión",
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
        noticias_proximamente: "Noticias Recientes (PROXIMAMENTE)"
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
        nuevo_usuario: "Nuevo Usuario"
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
        label_admin: "Es Administrador",
        desc_admin: "Permite acceder a este panel de control.",
        label_tipo: "Cuenta Tipo 1",
        desc_tipo: "Define el comportamiento especial en la app.",
        label_estado: "Cuenta Activa",
        desc_estado: "Si se desmarca, el usuario no podrá entrar.",
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
        rol_regular: "Usuario Regular"
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
    footer: {
        descripcion: "Sistema integral de administración FonoFace. Simplificando la gestión y el cuidado paso a paso.",
        contacto_email: "contacto@fonoface.cl",
        contacto_telefono: "+56 9 1234 5678",
        derechos: "Todos los derechos reservados.",
        enlaces: [
        { label: "Inicio", path: "/administracion/inicio" },
        { label: "Información", path: "/administracion/informacion" },
        { label: "Cuidados", path: "/administracion/cuidados" },
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
    }
};