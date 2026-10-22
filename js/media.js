export class MediaManager {
  constructor(onImagesUpdated) {
    this.images = []; // Blobs / URLs carregadas
    this.onImagesUpdated = onImagesUpdated;
    this.maxImages = 6; // Limite de 6 fotos

    this.fileInput = document.getElementById('fileInput');
    this.mediaGrid = document.getElementById('mediaGrid');
    this.imgCount = document.getElementById('imgCount');
    this.canvasWrapper = document.getElementById('canvasWrapper');

    this.initEvents();
    this.initDragAndDrop();
    this.loadDefaultPlaceholders();
  }

  initEvents() {
    this.fileInput.addEventListener('change', (e) => {
      this.addFiles(Array.from(e.target.files));
      this.fileInput.value = '';
    });
  }

  initDragAndDrop() {
    const dropZones = [this.canvasWrapper, this.mediaGrid].filter(Boolean);

    dropZones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove('drag-over');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove('drag-over');

        // Caso 1: Arquivos soltos do computador
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
          if (files.length > 0) {
            this.addFiles(files);
          }
          return;
        }

        // Caso 2: Foto arrastada da própria galeria lateral
        const draggedUrl = e.dataTransfer.getData('text/plain');
        if (draggedUrl && this.images.includes(draggedUrl)) {
          this.images = this.images.filter(u => u !== draggedUrl);
          this.images.unshift(draggedUrl);
          this.updateUI();
          this.onImagesUpdated(this.images);
        }
      });
    });
  }

  addFiles(files) {
    if (!files.length) return;

    // Se estiver usando os slides padrão gerados, limpa-os na primeira inserção real
    if (this.isDefaultPlaceholder) {
      this.images = [];
      this.isDefaultPlaceholder = false;
    }

    const remainingSlots = this.maxImages - this.images.length;
    const filesToAdd = files.slice(0, Math.max(0, remainingSlots));

    filesToAdd.forEach(file => {
      const url = URL.createObjectURL(file);
      this.images.push(url);
    });

    this.updateUI();
    this.onImagesUpdated(this.images);
  }

  loadDefaultPlaceholders() {
    this.isDefaultPlaceholder = true;
    const colors = [
      ['#ff416c', '#8a2387'],
      ['#00b4db', '#0083b0'],
      ['#11998e', '#38ef7d'],
      ['#f12711', '#f5af19'],
      ['#8e2de2', '#4a00e0'],
      ['#00c6ff', '#0072ff'] // 6º slide padrão
    ];

    colors.forEach(([c1, c2], idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 90px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Slide ${idx + 1}`, 540, 960);

      this.images.push(canvas.toDataURL('image/png'));
    });

    this.updateUI();
    this.onImagesUpdated(this.images);
  }

  removeImage(index) {
    if (this.images.length <= 2) {
      alert('Mantenha pelo menos 2 imagens para haver transição.');
      return;
    }
    this.images.splice(index, 1);
    this.updateUI();
    this.onImagesUpdated(this.images);
  }

  updateUI() {
    this.imgCount.innerText = this.images.length;
    this.mediaGrid.innerHTML = '';

    // 1. Renderiza as miniaturas das fotos
    this.images.forEach((url, idx) => {
      const card = document.createElement('div');
      card.className = 'media-card';
      card.innerHTML = `
        <img src="${url}" alt="Foto ${idx + 1}" draggable="true">
        <button class="btn-remove" data-index="${idx}" title="Remover foto">×</button>
      `;

      const img = card.querySelector('img');
      img.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', url);
        e.dataTransfer.effectAllowed = 'copy';
      });

      this.mediaGrid.appendChild(card);
    });

    // 2. Se houver menos de 6 fotos, adiciona o card quadrado com "+" grande
    if (this.images.length < this.maxImages) {
      const addCard = document.createElement('label');
      addCard.htmlFor = 'fileInput';
      addCard.className = 'btn-add-card';
      addCard.title = 'Adicionar fotos';
      addCard.innerHTML = `
        <span class="plus-icon">+</span>
        <span class="btn-add-text">Adicionar</span>
      `;
      this.mediaGrid.appendChild(addCard);
    }

    // Configura os eventos de remover
    this.mediaGrid.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        this.removeImage(idx);
      });
    });
  }
}