/**
 * Lógica principal del Museo de Patologías
 * Control de navegación SPA (Single Page Application)
 */

let currentPathology = null; // Almacena el objeto de la patología seleccionada

// ===== FUNCIONES DE NAVEGACIÓN Y TRANSICIONES =====

/**
 * Cambia la clase para gestionar las pantallas del museo
 * @param {string} hideId - ID de la sección a ocultar
 * @param {string} showId - ID de la sección a mostrar
 */
function switchScreen(hideId, showId) {
    const hideElement = document.getElementById(hideId);
    const showElement = document.getElementById(showId);

    // Ocultar actual (transición css fade out)
    hideElement.classList.remove('active');
    setTimeout(() => {
        hideElement.classList.add('hidden');
        // Mostrar nueva
        showElement.classList.remove('hidden');
        // Pequeño timeout para asegurar que el display:none se quite antes de añadir opacidad
        setTimeout(() => {
            showElement.classList.add('active');
        }, 50);
    }, 500); // Coincide con la duración de --transition-speed en CSS
}

/**
 * Ir a una pantalla anterior general
 */
function volver(toId) {
    // Determinar de dónde veníamos chequeando qué panel está activo
    const currentActive = document.querySelector('.screen.active').id;
    if (toId === 'sala-principal') {
        switchScreen(currentActive, 'sala-principal');
    } else if (toId === 'listado-patologias') {
        switchScreen(currentActive, 'listado-patologias');
    } else if (toId === 'detalle-patologia') {
        switchScreen(currentActive, 'detalle-patologia');
    }
}

/**
 * Cambia el background layer global
 */
function setBackground(claseFondo) {
    const bgLayer = document.getElementById('background-layer');
    bgLayer.className = ''; // Limpiar clases
    if (claseFondo) {
        bgLayer.classList.add(claseFondo);
    }
}

// ===== EVENTOS DE LOS BOTONES =====

function entrarMuseo() {
    switchScreen('pantalla-inicial', 'sala-principal');
    setBackground('bg-sala');
}

/**
 * Carga el listado de patologías según la categoría (2D o 3D)
 */
function irListado(tipo) {
    const tituloListado = document.getElementById('titulo-listado');
    const contenedorTarjetas = document.getElementById('contenedor-tarjetas');
    
    // Cambiar Título
    tituloListado.textContent = `Sección de Órganos ${tipo}`;
    
    // Limpiar listado anterior
    contenedorTarjetas.innerHTML = '';

    // Filtrar objetos desde la base de datos simulada (data.js)
    const patologiasFiltradas = databasePathologies.filter(item => item.type === tipo);

    // Generar las tarjetas
    patologiasFiltradas.forEach(p => {
        const divCard = document.createElement('div');
        divCard.className = 'card';
        divCard.innerHTML = `
            <h3>${p.name}</h3>
            <p>${p.shortDesc}</p>
            <button onclick="abrirDetalle('${p.id}')">Explorar</button>
        `;
        contenedorTarjetas.appendChild(divCard);
    });

    switchScreen('sala-principal', 'listado-patologias');
}

/**
 * Muestra la información detallada de una patología en particular
 */
function abrirDetalle(id) {
    // Buscar la patología en la BD
    currentPathology = databasePathologies.find(item => item.id === id);
    if (!currentPathology) return;

    // Rellenar la vista de detalle
    document.getElementById('detalle-nombre').textContent = currentPathology.name;
    document.getElementById('detalle-definicion').textContent = currentPathology.definition;
    document.getElementById('detalle-causa').textContent = currentPathology.cause;
    document.getElementById('detalle-caracteristicas').textContent = currentPathology.characteristics;

    // Configurar texto del botón de modelo
    const btnModelo = document.getElementById('btn-ver-modelo');
    if (currentPathology.type === '2D') {
        btnModelo.textContent = "Ver modelo 2D";
    } else {
        btnModelo.textContent = "Ver modelo 3D";
    }

    switchScreen('listado-patologias', 'detalle-patologia');
}

/**
 * Abre el visor final (imagen o modelo 3D) con información macro/micro
 */
function verModelo() {
    if (!currentPathology) return;

    // Rellenar títulos e info
    document.getElementById('visor-nombre').textContent = `Visualizador: ${currentPathology.name}`;
    document.getElementById('visor-macro').textContent = currentPathology.macroscopic;
    document.getElementById('visor-micro').textContent = currentPathology.microscopic;

    // Cargar la Media
    const mediaContainer = document.getElementById('media-container');
    mediaContainer.innerHTML = ''; // Limpiar anterior

    if (currentPathology.type === '2D') {
        const img = document.createElement('img');
        // Se asume que en las propiedades viene la ruta de la imagen
        img.src = currentPathology.mediaUrl;
        img.alt = currentPathology.name;
        mediaContainer.appendChild(img);
    } else {
        // Asumiendo que es un visor 3D, usamos un iframe embebido
        // Si el enlace de mediaUrl no es embedible (ej. link directo a Sketchfab), debe ajustarse por un iframe válido.
        const iframe = document.createElement('iframe');
        iframe.src = currentPathology.mediaUrl;
        iframe.allowFullscreen = true;
        // Atributos útiles para visores 3D (como sketchfab interactivo)
        iframe.setAttribute('allow', 'autoplay; fullscreen; xr-spatial-tracking');
        iframe.setAttribute('execution-while-out-of-viewport', '');
        iframe.setAttribute('execution-while-not-rendered', '');
        iframe.setAttribute('web-share', '');
        mediaContainer.appendChild(iframe);
    }

    switchScreen('detalle-patologia', 'visor-modelo');
}

// Inicialización
window.onload = () => {
    // Asegurarse de que el fondo empiece con el de la entrada
    setBackground('bg-entrada');
};