const app = {
    currentPathology: null,

    init() {
        document.getElementById('btn-enter').addEventListener('click', () => {
            this.showScreen('screen-hall');
            const bgContainer = document.getElementById('background-container');
            bgContainer.classList.remove('bg-entrada');
            bgContainer.classList.add('bg-sala');
        });
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            if (screen.id !== screenId) {
                screen.classList.remove('active');
                setTimeout(() => screen.classList.add('hidden'), 500);
            }
        });

        const target = document.getElementById(screenId);
        target.classList.remove('hidden');
        setTimeout(() => target.classList.add('active'), 50);
    },

    showList(type) {
        document.getElementById('list-title').innerText = `Catálogo de Órganos ${type}`;
        const grid = document.getElementById('pathology-grid');
        grid.innerHTML = ''; 

        const items = pathologiesData.filter(p => p.type === type);

        if (items.length === 0) {
            grid.innerHTML = '<p>No hay patologías registradas en esta categoría aún.</p>';
        } else {
            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card';
                card.onclick = () => this.showDetail(item.id);
                card.innerHTML = `
                    <span class="tag">Modelo ${item.type}</span>
                    <h3>${item.name}</h3>
                    <p style="font-size: 0.9em; opacity: 0.8; margin-top: 10px;">${item.shortDesc}</p>
                `;
                grid.appendChild(card);
            });
        }

        this.showScreen('screen-list');
    },

    showDetail(id) {
        const pathology = pathologiesData.find(p => p.id === id);
        if (!pathology) return;

        this.currentPathology = pathology;

        document.getElementById('detail-title').innerText = pathology.name;
        document.getElementById('detail-definition').innerText = pathology.definition;
        document.getElementById('detail-cause').innerText = pathology.cause;
        document.getElementById('detail-characteristics').innerText = pathology.characteristics;
        
        const btnModel = document.getElementById('btn-view-model');
        btnModel.innerText = `Ver modelo en ${pathology.type}`;
        btnModel.onclick = () => this.showModel();

        this.showScreen('screen-detail');
    },

    showModel() {
        const item = this.currentPathology;
        if (!item) return;

        document.getElementById('model-view-title').innerText = item.name;
        document.getElementById('detail-macro').innerText = item.macro;
        document.getElementById('detail-micro').innerText = item.micro;

        const viewer2D = document.getElementById('viewer-2d');
        const viewer3D = document.getElementById('viewer-3d');
        const modelLink = document.getElementById('model-external-link');
        
        viewer2D.classList.add('hidden');
        viewer3D.classList.add('hidden');

        if (item.type === '2D') {
            viewer2D.classList.remove('hidden');
            const img = document.getElementById('image-2d');
            img.src = item.mediaUrl ? encodeURI(item.mediaUrl) : '';
            modelLink.classList.add('hidden');
            modelLink.removeAttribute('href');
        } else if (item.type === '3D') {
            viewer3D.classList.remove('hidden');
            const iframe = document.getElementById('iframe-3d');
            const embedUrl = this.getPolycamEmbedUrl(item.mediaUrl);
            iframe.src = embedUrl || '';
            if (item.mediaUrl) {
                modelLink.href = item.mediaUrl;
                modelLink.classList.remove('hidden');
            } else {
                modelLink.classList.add('hidden');
                modelLink.removeAttribute('href');
            }
        }

        this.showScreen('screen-model-view');
    },

    getPolycamEmbedUrl(url) {
        if (!url) return '';
        const cleanUrl = url.trim();

        if (cleanUrl.includes('poly.cam') && cleanUrl.includes('/explore/capture/')) {
            const match = cleanUrl.match(/\/explore\/capture\/([a-z0-9-]+)/i);
            if (match && match[1]) {
                return `https://poly.cam/capture/${match[1]}?embed=1`;
            }
        }

        if (cleanUrl.includes('poly.cam') && cleanUrl.includes('/capture/')) {
            const embedSuffix = cleanUrl.includes('?') ? '&embed=1' : '?embed=1';
            return `${cleanUrl}${embedSuffix}`;
        }

        return cleanUrl;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});