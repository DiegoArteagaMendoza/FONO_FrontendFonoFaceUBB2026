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
    }
}