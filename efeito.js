export class OverlaysManager {
  constructor(options = {}) {
    this.trackContainer = document.getElementById(options.trackId || 'overlaysTrack');
    this.canvasWrapper = document.getElementById(options.wrapperId || 'canvasWrapper');
    this.overlayFrame = document.getElementById(options.frameId || 'overlayFrame');
    
    // Lista oficial dos efeitos de sobreposição (Overlays)
 this.effects = [
      { id: 'none', name: 'Nenhum', src: '' },
      { id: 'efeito2', name: 'Túnel Neon', src: 'efeito/efeito2.html' },
      { id: 'efeito3', name: 'Meteoro', src: 'efeito/efeito3.html' },
      { id: 'efeito4', name: 'Estrelas 3D', src: 'efeito/efeito4.html' },
      { id: 'efeito5', name: 'Bokeh 3D', src: 'efeito/efeito5.html' }
    ];

    this.currentEffectId = 'none';

    this.ensureOverlayFrame();
    this.renderButtons();
  }

  // 1. Garante que o iframe transparente exista no DOM sem precisar digitar HTML manual
  ensureOverlayFrame() {
    if (!this.overlayFrame) {
      this.overlayFrame = document.getElementById('overlayFrame');
    }

    if (!this.overlayFrame && this.canvasWrapper) {
      this.overlayFrame = document.createElement('iframe');
      this.overlayFrame.id = 'overlayFrame';
      this.overlayFrame.style.position = 'absolute';
      this.overlayFrame.style.top = '0';
      this.overlayFrame.style.left = '0';
      this.overlayFrame.style.width = '100%';
      this.overlayFrame.style.height = '100%';
      this.overlayFrame.style.border = 'none';
      this.overlayFrame.style.pointerEvents = 'none';
      this.overlayFrame.style.background = 'transparent';
      this.overlayFrame.style.zIndex = '10';
      this.overlayFrame.style.display = 'none';
      this.canvasWrapper.appendChild(this.overlayFrame);
    }
  }

  // 2. Cria os botões dinamicamente no track, exatamente igual aos slides
  renderButtons() {
    if (!this.trackContainer) {
      this.trackContainer = document.getElementById('overlaysTrack');
      if (!this.trackContainer) return;
    }

    this.trackContainer.innerHTML = '';

    this.effects.forEach((effect) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn-overlay ${effect.id === this.currentEffectId ? 'active' : ''}`;
      btn.dataset.src = effect.src;
      btn.dataset.id = effect.id;
      btn.innerText = effect.name;

      btn.addEventListener('click', () => {
        this.selectEffect(effect.id);
      });

      this.trackContainer.appendChild(btn);
    });
  }

  // 3. Aplica o efeito selecionado no iframe sobreposto
  selectEffect(effectId) {
    const selected = this.effects.find(e => e.id === effectId) || this.effects[0];
    this.currentEffectId = selected.id;

    // Atualiza estado visual dos botões
    if (this.trackContainer) {
      const buttons = this.trackContainer.querySelectorAll('.btn-overlay');
      buttons.forEach(btn => {
        if (btn.dataset.id === selected.id) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Garante referência ao iframe
    this.ensureOverlayFrame();
    if (!this.overlayFrame) return;

    if (!selected.src || selected.src === '') {
      this.overlayFrame.style.display = 'none';
      this.overlayFrame.src = '';
    } else {
      this.overlayFrame.src = selected.src;
      this.overlayFrame.style.display = 'block';
    }
  }
}
