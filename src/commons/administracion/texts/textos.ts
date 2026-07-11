export const TEXTOS_SITIO = {
    // TEXTOS GLOBALES
    
    globales: {
        boton_guardar: "Guardar Cambios",
        boton_cancelar: "Cancelar",
        boton_volver: "Volver",
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
        error_servidor: "Error al conectar con el servidor."
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
}