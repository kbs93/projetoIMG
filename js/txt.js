// js/txt.js - Responsável EXCLUSIVAMENTE pela edição e modelos de texto
export class TextEditor {
  constructor(containerId = 'textItemsGrid') {
    this.container = document.getElementById(containerId);
    this.currentFont = null;
    this.customText = '';
    this.sampleText = 'Texto teste';

    this.fonts = [
      { id: 'barrio', name: 'Barrio', family: 'Barrio' },
      { id: 'bebas', name: 'Bebas Neue', family: 'BebasNeue' },
      { id: 'bitcount_single_ink', name: 'Bitcount Single Ink', family: 'BitcountSingleInk' },
      { id: 'braah', name: 'Braah One', family: 'BraahOne' },
      { id: 'bungee', name: 'Bungee Shade', family: 'BungeeShade' },
      { id: 'caesar', name: 'Caesar Dressing', family: 'CaesarDressing' },
      { id: 'charm_bold', name: 'Charm Bold', family: 'CharmBold' },
      { id: 'charm_reg', name: 'Charm Regular', family: 'CharmRegular' },
      { id: 'cherry', name: 'Cherry Bomb One', family: 'CherryBombOne' },
      { id: 'cinzel_black', name: 'Cinzel Decorative Black', family: 'CinzelDecoBlack' },
      { id: 'cinzel_bold', name: 'Cinzel Decorative Bold', family: 'CinzelDecoBold' },
      { id: 'cinzel_reg', name: 'Cinzel Decorative Regular', family: 'CinzelDecoRegular' },
      { id: 'cuprum', name: 'Cuprum', family: 'Cuprum' },
      { id: 'cuprum_italic', name: 'Cuprum Italic', family: 'CuprumItalic' },
      { id: 'edu_hand', name: 'Edu AU VIC WA NT Hand', family: 'EduAUVICWANTHand' },
      { id: 'faster', name: 'Faster One', family: 'FasterOne' },
      { id: 'gamaamli', name: 'Ga Maamli', family: 'GaMaamli' },
      { id: 'geostar', name: 'Geostar Fill', family: 'GeostarFill' },
      { id: 'kablammo', name: 'Kablammo', family: 'Kablammo' },
      { id: 'kumar', name: 'Kumar One Outline', family: 'KumarOneOutline' },
      { id: 'libertinus_keyboard', name: 'Libertinus Keyboard', family: 'LibertinusKeyboard' },
      { id: 'limelight', name: 'Limelight', family: 'Limelight' },
      { id: 'manufacturing_consent', name: 'Manufacturing Consent', family: 'ManufacturingConsent' },
      { id: 'matangi', name: 'Matangi', family: 'Matangi' },
      { id: 'matemasie', name: 'Matemasie', family: 'Matemasie' },
      { id: 'meaculpa', name: 'Mea Culpa', family: 'MeaCulpa' },
      { id: 'playwrite_be_vlg', name: 'Playwrite BE VLG', family: 'PlaywriteBEVLG' },
      { id: 'praise', name: 'Praise', family: 'Praise' },
      { id: 'pridi', name: 'Pridi Regular', family: 'Pridi' },
      { id: 'pridi_extralight', name: 'Pridi ExtraLight', family: 'PridiExtraLight' },
      { id: 'pridi_light', name: 'Pridi Light', family: 'PridiLight' },
      { id: 'pridi_medium', name: 'Pridi Medium', family: 'PridiMedium' },
      { id: 'pridi_semibold', name: 'Pridi SemiBold', family: 'PridiSemiBold' },
      { id: 'pridi_bold', name: 'Pridi Bold', family: 'PridiBold' },
      { id: 'rocksalt', name: 'Rock Salt', family: 'RockSalt' },
      { id: 'rubik', name: 'Rubik Vinyl', family: 'RubikVinyl' },
      { id: 'tasa_explorer', name: 'TASA Explorer', family: 'TASAExplorer' },
      { id: 'tangerine_bold', name: 'Tangerine Bold', family: 'TangerineBold' },
      { id: 'tangerine_reg', name: 'Tangerine Regular', family: 'TangerineRegular' },
      { id: 'tilt_prism', name: 'Tilt Prism', family: 'TiltPrism' },
      { id: 'unifraktur', name: 'UnifrakturMaguntia', family: 'UnifrakturMaguntia' },
      { id: 'urbanist', name: 'Urbanist Regular', family: 'Urbanist' },
      { id: 'urbanist_italic', name: 'Urbanist Italic', family: 'UrbanistItalic' }
    ];
    this.renderFonts();
  }

  renderFonts() {
    if (!this.container) return;
    this.container.innerHTML = '';

    this.fonts.forEach(font => {
      const card = document.createElement('div');
      card.className = 'text-preset-card';
      card.dataset.id = font.id;

      card.innerHTML = `
        <span class="preset-font-meta">${font.name}</span>
        <span class="preset-font-preview" style="font-family: '${font.family}', sans-serif;">
          ${this.sampleText}
        </span>
      `;

      card.addEventListener('click', () => {
        this.selectFont(font);
      });

      this.container.appendChild(card);
    });
  }

  selectFont(font) {
    this.currentFont = font;

    if (this.container) {
      this.container.querySelectorAll('.text-preset-card').forEach(c => c.classList.remove('selected'));
      const activeCard = this.container.querySelector(`[data-id="${font.id}"]`);
      if (activeCard) activeCard.classList.add('selected');
    }

    const animFrame = document.getElementById('animFrame');
    if (animFrame && animFrame.contentWindow) {
      animFrame.contentWindow.postMessage({
        tipo: 'APLICAR_FONTE',
        font: font,
        texto: this.customText || font.name
      }, '*');
    }

    const overlayContainer = document.getElementById('textOverlayContainer');
    if (overlayContainer) {
      document.querySelectorAll('.canva-text-wrapper').forEach(el => el.classList.remove('active'));

      const wrapper = document.createElement('div');
      wrapper.className = 'canva-text-wrapper active';
      wrapper.style.position = 'absolute';
      wrapper.style.left = '50%';
      wrapper.style.top = '50%';
      wrapper.style.transform = 'translate(-50%, -50%)';
      wrapper.style.pointerEvents = 'auto';
      wrapper.style.cursor = 'move';

 const textElement = document.createElement('div');
      textElement.className = 'interactive-text-box';
      textElement.style.fontFamily = `'${font.family}', sans-serif`;
      textElement.style.fontSize = '60px';
      textElement.style.color = '#ffffff';
      textElement.style.textShadow = '2px 2px 0px #000';
      textElement.style.outline = 'none';
      textElement.style.userSelect = 'none';
      textElement.style.whiteSpace = 'pre-wrap';
      textElement.style.wordBreak = 'break-all'; // Mudei para break-all para quebrar números e letras coladas na borda exata
      textElement.style.maxWidth = '100%';
      textElement.contentEditable = 'true';
      textElement.innerText = this.customText || font.name;

      const handleTL = document.createElement('div'); handleTL.className = 'resize-handle tl';
      const handleTR = document.createElement('div'); handleTR.className = 'resize-handle tr';
      const handleBL = document.createElement('div'); handleBL.className = 'resize-handle bl';
      const handleBR = document.createElement('div'); handleBR.className = 'resize-handle br';
      
      const rotateHandle = document.createElement('div');
      rotateHandle.className = 'rotate-handle';
      rotateHandle.innerHTML = '↻';

      wrapper.appendChild(textElement);
      wrapper.appendChild(handleTL);
      wrapper.appendChild(handleTR);
      wrapper.appendChild(handleBL);
      wrapper.appendChild(handleBR);
      wrapper.appendChild(rotateHandle);

      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.canva-text-wrapper').forEach(el => el.classList.remove('active'));
        wrapper.classList.add('active');
        
        const toolbar = document.getElementById('textFloatingToolbar');
        if (toolbar) {
          toolbar.style.display = 'flex';
          window.activeTextElement = textElement;
        }
      });

      overlayContainer.appendChild(wrapper);

      const toolbar = document.getElementById('textFloatingToolbar');
      if (toolbar) {
        toolbar.style.display = 'flex';
        window.activeTextElement = textElement;
      }
    }
  }

  setText(newText) {
    this.customText = newText;
    if (this.currentFont) {
      this.selectFont(this.currentFont);
    }
  }
}document.addEventListener('pointerdown', (e) => {
  const toolbar = document.getElementById('textFloatingToolbar');
  const colorPopup = document.getElementById('colorPopup');
  
  const clickedInsideText = e.target.closest('.canva-text-wrapper');
  const clickedInsideToolbar = toolbar && toolbar.contains(e.target);
  const clickedInsidePopup = colorPopup && colorPopup.contains(e.target);

  // Se clicou fora da caixa de texto, da barra e do popup (qualquer ponto do slide ou fundo)
  if (!clickedInsideText && !clickedInsideToolbar && !clickedInsidePopup) {
    document.querySelectorAll('.canva-text-wrapper').forEach(el => el.classList.remove('active'));
    if (toolbar) toolbar.style.display = 'none';
    if (colorPopup) colorPopup.style.display = 'none';
    window.activeTextElement = null;
  }
});