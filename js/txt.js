// js/txt.js - Responsável EXCLUSIVAMENTE pela edição e modelos de texto
export class TextEditor {
  constructor(containerId = 'textItemsGrid') {
    this.container = document.getElementById(containerId);
    this.currentPreset = null;
    this.customText = '';

    // Modelos oficiais de estilo
    this.presets = [
      { id: 'maquina', name: 'Máquina', styleClass: 'txt-typewriter', preview: 'Máquin|' },
      { id: 'circular', name: 'Circular', styleClass: 'txt-circular', preview: 'Circular' },
      { id: 'groovy', name: 'GROOVY', styleClass: 'txt-groovy', preview: 'GROOVY' },
      { id: 'esfumacado', name: 'Esfumaçado', styleClass: 'txt-smoky', preview: 'Esfumaçado' },
      { id: 'fogos', name: 'Fogos de artifício', styleClass: 'txt-fireworks', preview: 'Fogos de artifício' },
      { id: 'nitido', name: 'Título Nítido', styleClass: 'txt-sharp', preview: 'Título Nítido' },
      { id: 'esmaecer', name: 'Esmaecer', styleClass: 'txt-fade', preview: 'Esmaecer' },
      { id: 'mare', name: 'MARÉ', styleClass: 'txt-tide', preview: 'MARÉ' },
      { id: 'estatico', name: 'Efeito estático', styleClass: 'txt-static', preview: 'Efeito estático' },
      { id: 'empurrar', name: 'EMPURRAR', styleClass: 'txt-push', preview: 'EMPURRAR' },
      { id: 'cabecalho', name: 'Cabeçalho grande', styleClass: 'txt-bigheader', preview: 'Cabeçalho grande' },
      { id: 'espiadinha', name: 'Espiadinha', styleClass: 'txt-peek', preview: 'Espiadinha' },
      { id: 'contorno', name: 'Sombra de contorno', styleClass: 'txt-outline', preview: 'Sombra de contorno' },
      { id: 'estencil', name: 'Estêncil', styleClass: 'txt-stencil', preview: 'Estêncil' },
      { id: 'brilhando', name: 'Deixe tudo brilhando', styleClass: 'txt-glow', preview: 'Deixe tudo brilhando' },
      { id: 'marcante', name: 'Marcante', styleClass: 'txt-bold', preview: 'Marcante' }
    ];

    this.renderPresets();
  }

  renderPresets() {
    if (!this.container) return;
    this.container.innerHTML = '';

    this.presets.forEach(preset => {
      const card = document.createElement('div');
      card.className = `text-preset-card ${preset.styleClass}`;
      card.dataset.id = preset.id;
      card.innerHTML = `<span class="preset-label">${preset.preview}</span>`;

      card.addEventListener('click', () => {
        this.selectPreset(preset);
      });

      this.container.appendChild(card);
    });
  }

  selectPreset(preset) {
    this.currentPreset = preset;

    if (this.container) {
      this.container.querySelectorAll('.text-preset-card').forEach(c => c.classList.remove('selected'));
      const activeCard = this.container.querySelector(`[data-id="${preset.id}"]`);
      if (activeCard) activeCard.classList.add('selected');
    }

    // Dispara para o iframe da animação
    const animFrame = document.getElementById('animFrame');
    if (animFrame && animFrame.contentWindow) {
      animFrame.contentWindow.postMessage({
        tipo: 'APLICAR_TEXTO',
        preset: preset,
        texto: this.customText || preset.name
      }, '*');
    }
  }

  setText(newText) {
    this.customText = newText;
    if (this.currentPreset) {
      this.selectPreset(this.currentPreset);
    }
  }
}