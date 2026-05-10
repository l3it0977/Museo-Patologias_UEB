const visor3d = (() => {
    let THREE = null;
    let OrbitControls = null;
    let GLTFLoader = null;
    let DRACOLoader = null;
    let cargandoDependencias = null;
    let contenedor3d = null;
    let escena = null;
    let camara = null;
    let renderizador = null;
    let controlesOrbitales = null;
    let cargadorGltf = null;
    let cargadorDraco = null;
    let modeloActual = null;
    let renderActivo = false;

    // Carga las dependencias locales de Three.js bajo demanda.
    function cargarDependencias() {
        if (THREE && OrbitControls && GLTFLoader && DRACOLoader) return Promise.resolve();
        if (cargandoDependencias) return cargandoDependencias;

        cargandoDependencias = Promise.all([
            import('./three/three.module.js'),
            import('./three/OrbitControls.js'),
            import('./three/GLTFLoader.js'),
            import('./three/DRACOLoader.js')
        ]).then(([threeMod, orbitMod, gltfMod, dracoMod]) => {
            THREE = threeMod;
            OrbitControls = orbitMod.OrbitControls;
            GLTFLoader = gltfMod.GLTFLoader;
            DRACOLoader = dracoMod.DRACOLoader;
        }).finally(() => {
            cargandoDependencias = null;
        });

        return cargandoDependencias;
    }

    // Inicializa el visor 3D local y sus dependencias.
    function iniciar(idContenedor) {
        if (renderizador) return;
        contenedor3d = document.getElementById(idContenedor);
        if (!contenedor3d || !THREE) return;

        escena = new THREE.Scene();

        camara = new THREE.PerspectiveCamera(
            45,
            contenedor3d.clientWidth / contenedor3d.clientHeight,
            0.1,
            1000
        );
        camara.position.set(0, 0.8, 2.2);

        renderizador = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderizador.setSize(contenedor3d.clientWidth, contenedor3d.clientHeight);
        renderizador.outputColorSpace = THREE.SRGBColorSpace;
        renderizador.setClearColor(0x000000, 0);

        contenedor3d.innerHTML = '';
        contenedor3d.appendChild(renderizador.domElement);

        controlesOrbitales = new OrbitControls(camara, renderizador.domElement);
        controlesOrbitales.enableDamping = true;
        controlesOrbitales.dampingFactor = 0.06;
        controlesOrbitales.minDistance = 0.6;

        const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.9);
        const luzDireccional = new THREE.DirectionalLight(0xffffff, 0.8);
        luzDireccional.position.set(3, 4, 2);
        escena.add(luzAmbiente, luzDireccional);

        // Habilita soporte para modelos GLTF/GLB comprimidos con Draco.
        cargadorDraco = new DRACOLoader();
        cargadorDraco.setDecoderPath('./js/draco/');
        cargadorDraco.setDecoderConfig({ type: 'js' });
        cargadorGltf = new GLTFLoader();
        cargadorGltf.setDRACOLoader(cargadorDraco);

        window.addEventListener('resize', ajustarTamano);
        iniciarRender();
    }

    // Ajusta el renderizado al tamano del contenedor.
    function ajustarTamano() {
        if (!contenedor3d || !renderizador || !camara) return;
        const ancho = contenedor3d.clientWidth;
        const alto = contenedor3d.clientHeight;
        renderizador.setSize(ancho, alto);
        camara.aspect = ancho / alto;
        camara.updateProjectionMatrix();
    }

    // Centra y encuadra el modelo para una vista inicial limpia.
    function encuadrarModelo(objeto) {
        const caja = new THREE.Box3().setFromObject(objeto);
        const centro = new THREE.Vector3();
        const tamano = new THREE.Vector3();

        caja.getCenter(centro);
        caja.getSize(tamano);
        objeto.position.sub(centro);

        const maximo = Math.max(tamano.x, tamano.y, tamano.z) || 1;
        const distancia = maximo / (2 * Math.tan(THREE.MathUtils.degToRad(camara.fov * 0.5)));

        camara.position.set(0, Math.max(0.4, maximo * 0.35), distancia * 1.4);
        camara.near = Math.max(0.01, distancia / 100);
        camara.far = Math.max(50, distancia * 100);
        camara.updateProjectionMatrix();

        controlesOrbitales.target.set(0, 0, 0);
        controlesOrbitales.update();
    }

    // Libera recursos del modelo anterior para evitar fugas de memoria.
    function limpiarModelo() {
        if (!modeloActual || !escena) return;
        escena.remove(modeloActual);

        modeloActual.traverse((nodo) => {
            if (nodo.geometry) nodo.geometry.dispose();
            if (nodo.material) {
                if (Array.isArray(nodo.material)) {
                    nodo.material.forEach((material) => material.dispose());
                } else {
                    nodo.material.dispose();
                }
            }
        });

        modeloActual = null;
    }

    // Mantiene el renderizado activo con un bucle ligero.
    function iniciarRender() {
        if (renderActivo) return;
        renderActivo = true;

        const renderizar = () => {
            if (!renderizador || !escena || !camara) return;
            controlesOrbitales.update();
            renderizador.render(escena, camara);
            requestAnimationFrame(renderizar);
        };

        requestAnimationFrame(renderizar);
    }

    // Carga un modelo GLTF/GLB local y resuelve cuando termina.
    async function cargarModelo(urlModelo) {
        if (!urlModelo) throw new Error('Modelo 3D no definido.');

        await cargarDependencias();
        iniciar('visor-3d-local');
        if (!cargadorGltf) throw new Error('Visor 3D no disponible.');

        limpiarModelo();

        return new Promise((resolve, reject) => {
            cargadorGltf.load(
                encodeURI(urlModelo),
                (gltf) => {
                    modeloActual = gltf.scene;
                    escena.add(modeloActual);
                    encuadrarModelo(modeloActual);
                    resolve();
                },
                undefined,
                (error) => reject(error)
            );
        });
    }

    return {
        iniciar,
        cargarModelo,
        limpiarModelo
    };
})();

const museo = {
    patologiaActual: null,

    // Inicializa eventos y la transicion inicial del museo.
    iniciar() {
        document.getElementById('btn-enter').addEventListener('click', () => {
            this.mostrarPantalla('screen-hall');
            const contenedorFondo = document.getElementById('background-container');
            contenedorFondo.classList.remove('bg-entrada');
            contenedorFondo.classList.add('bg-sala');
        });
    },

    // Cambia la pantalla activa con transicion suave.
    mostrarPantalla(idPantalla) {
        document.querySelectorAll('.screen').forEach((pantalla) => {
            if (pantalla.id !== idPantalla) {
                pantalla.classList.remove('active');
                setTimeout(() => pantalla.classList.add('hidden'), 500);
            }
        });

        const destino = document.getElementById(idPantalla);
        destino.classList.remove('hidden');
        setTimeout(() => destino.classList.add('active'), 50);
    },

    // Genera el listado de patologias segun el tipo seleccionado.
    mostrarListado(tipo) {
        document.getElementById('list-title').innerText = `Catálogo de Órganos ${tipo}`;
        const grilla = document.getElementById('pathology-grid');
        grilla.innerHTML = '';

        const items = (window.datosPatologias || []).filter((patologia) => patologia.tipo === tipo);

        if (items.length === 0) {
            grilla.innerHTML = '<p>No hay patologías registradas en esta categoría aún.</p>';
        } else {
            items.forEach((patologia) => {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'card';
                tarjeta.onclick = () => this.mostrarDetalle(patologia.identificador);
                tarjeta.innerHTML = `
                    <span class="tag">Modelo ${patologia.tipo}</span>
                    <h3>${patologia.nombre}</h3>
                    <p style="font-size: 0.9em; opacity: 0.8; margin-top: 10px;">${patologia.descripcionCorta}</p>
                `;
                grilla.appendChild(tarjeta);
            });
        }

        this.mostrarPantalla('screen-list');
    },

    // Muestra la ficha detallada de una patologia.
    mostrarDetalle(identificador) {
        const patologia = (window.datosPatologias || []).find((item) => item.identificador === identificador);
        if (!patologia) return;

        this.patologiaActual = patologia;

        document.getElementById('detail-title').innerText = patologia.nombre;
        document.getElementById('detail-definition').innerText = patologia.definicion;
        document.getElementById('detail-cause').innerText = patologia.causa;
        document.getElementById('detail-characteristics').innerText = patologia.caracteristicas;

        const botonModelo = document.getElementById('btn-view-model');
        botonModelo.innerText = `Ver modelo en ${patologia.tipo}`;
        botonModelo.onclick = () => this.mostrarModelo();

        this.mostrarPantalla('screen-detail');
    },

    // Muestra el modelo 2D o 3D segun la patologia seleccionada.
    mostrarModelo() {
        const patologia = this.patologiaActual;
        if (!patologia) return;

        document.getElementById('model-view-title').innerText = patologia.nombre;
        document.getElementById('detail-macro').innerText = patologia.macro;
        document.getElementById('detail-micro').innerText = patologia.micro;

        const visor2d = document.getElementById('viewer-2d');
        const contenedor3d = document.getElementById('viewer-3d');
        const enlaceModelo = document.getElementById('model-external-link');
        const iframe3d = document.getElementById('iframe-3d');
        const visorLocal3d = document.getElementById('visor-3d-local');

        visor2d.classList.add('hidden');
        contenedor3d.classList.add('hidden');
        visorLocal3d.classList.add('hidden');
        iframe3d.classList.add('hidden');
        iframe3d.src = '';

        if (patologia.tipo === '2D') {
            visor2d.classList.remove('hidden');
            const imagen = document.getElementById('image-2d');
            imagen.src = patologia.imagen2d ? encodeURI(patologia.imagen2d) : '';
            enlaceModelo.classList.add('hidden');
            enlaceModelo.removeAttribute('href');
        } else if (patologia.tipo === '3D') {
            contenedor3d.classList.remove('hidden');

            enlaceModelo.classList.add('hidden');
            enlaceModelo.removeAttribute('href');

            const urlLocal = patologia.modeloLocal;

            if (urlLocal) {
                visorLocal3d.classList.remove('hidden');
                requestAnimationFrame(() => {
                    visor3d.cargarModelo(urlLocal)
                        .then(() => {
                            visorLocal3d.classList.remove('hidden');
                            iframe3d.classList.add('hidden');
                        })
                        .catch((error) => {
                            visorLocal3d.classList.add('hidden');
                            console.error('No se pudo cargar el modelo 3D local:', error);
                        });
                });
            }
        }

        this.mostrarPantalla('screen-model-view');
    },

    // Convierte URLs de Polycam a formato embebible cuando aplica.
    obtenerUrlEmbedPolycam(url) {
        if (!url) return '';
        const urlLimpia = url.trim();

        if (urlLimpia.includes('poly.cam') && urlLimpia.includes('/explore/capture/')) {
            const coincidencia = urlLimpia.match(/\/explore\/capture\/([a-z0-9-]+)/i);
            if (coincidencia && coincidencia[1]) {
                return `https://poly.cam/capture/${coincidencia[1]}?embed=1`;
            }
        }

        if (urlLimpia.includes('poly.cam') && urlLimpia.includes('/capture/')) {
            const sufijoEmbed = urlLimpia.includes('?') ? '&embed=1' : '?embed=1';
            return `${urlLimpia}${sufijoEmbed}`;
        }

        return urlLimpia;
    }
};

window.museo = museo;

// Inicia la aplicacion cuando el DOM esta listo.
document.addEventListener('DOMContentLoaded', () => {
    museo.iniciar();
});