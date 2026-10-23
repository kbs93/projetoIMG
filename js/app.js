import { MediaManager } from './media.js';
import { Recorder } from './recorde.js';
import { OverlaysManager } from './efeito.js';
import { TextEditor } from './txt.js';

// 1. Inicializa os módulos específicos de funcionalidade
const textEditor = new TextEditor();
const overlays = new OverlaysManager();


window.addEventListener('DOMContentLoaded', () => {
  const animFrame = document.getElementById('animFrame');
  const effectsTrack = document.getElementById('effectsTrack');
  const canvasWrapper = document.getElementById('canvasWrapper');
  let fotosAtuais = [];

  // Caminho base seguro apontando para a pasta onde estão os arquivos
  const getAnimPath = (num) => {
    const file = num === 1 ? 'imgAnimacao.html' : `imgAnimacao${num}.html`;
    return `./animacao/${file}`;
  };

  // Injeta as imagens subidas diretamente no documento do iframe
  const injetarFotosNoIframe = () => {
    if (!fotosAtuais.length || !animFrame) return;

    try {
      // 1. Envia via postMessage para o script da animação capturar na hora
      if (animFrame.contentWindow) {
        animFrame.contentWindow.postMessage({
          tipo: 'CARREGAR_FOTOS',
          fotos: fotosAtuais
        }, '*');
      }

      // 2. Atualiza a lista no DOM do iframe como fallback
      const doc = animFrame.contentDocument || (animFrame.contentWindow && animFrame.contentWindow.document);
      if (doc) {
        const sourceList = doc.getElementById('image-source-list');
        if (sourceList) {
          sourceList.innerHTML = '';
          fotosAtuais.forEach(url => {
            const img = doc.createElement('img');
            img.src = url;
            sourceList.appendChild(img);
          });
        }
      }

      // 3. Executa a função nativa se o arquivo tiver definido window.atualizarTexturas
      if (animFrame.contentWindow && typeof animFrame.contentWindow.atualizarTexturas === 'function') {
        animFrame.contentWindow.atualizarTexturas(fotosAtuais);
      }
    } catch (e) {
      console.warn("Aguardando carregamento da janela da animação...", e);
    }
  };

  // Garante o carregamento inicial correto sem duplicações
  if (animFrame) {
    animFrame.src = getAnimPath(1);
    animFrame.onload = () => {
      injetarFotosNoIframe();
    };
  }

  // Escuta se o iframe avisar que acabou de inicializar
  window.addEventListener('message', (event) => {
    if (event.data && event.data.tipo === 'IFRAME_PRONTO') {
      injetarFotosNoIframe();
    }
  });

  // 1. Inicializa o gerenciador de mídia com Drag & Drop
  const mediaManager = new MediaManager((images) => {
    fotosAtuais = images;
    injetarFotosNoIframe();
  });

  // 2. Gravador nativo conectado ao canvas do iframe ativo
  const recorder = new Recorder(() => {
    if (!animFrame) return null;
    try {
      const doc = animFrame.contentDocument || animFrame.contentWindow.document;
      return doc ? doc.querySelector('canvas') : null;
    } catch (e) {
      return null;
    }
  });

  // 3. Montagem dos 24 botões na barra inferior
  // aqui tambem adiciona as novas animacao  so colocar o "Nome da Sua Nova Animação"
  const effectNames = [
    "Ondas 2D", "Partículas", "Vidro Voronoi", "Simplex Morph", "Lente Esférica",
    "Persianas", "Twist Hiper", "Laser Cyber", "Page Curl", "Monolito 3D",
    "Cortina Cinética", "Cubo Viewport", "Mosaico Cartões", "Fly-Through", "Leque Íris",
    "Colmeia Hex", "Blocos Queda", "Isométrico Concreto", "Vórtice Partículas", "Topográfico Z",
    "Voronoi 3D", "Carrossel Ring", "Túnel Estelar", "Caleidoscópio 3D"
  ];
//nao esquecer de mudar aquitambem o 24
  for (let i = 1; i <= 24; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn-effect ${i === 1 ? 'active' : ''}`;
    btn.innerHTML = `
      <span class="effect-num">${String(i).padStart(2, '0')}</span>
      <span>${effectNames[i - 1] || 'Efeito ' + i}</span>
    `;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-effect').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      animFrame.src = getAnimPath(i);
      animFrame.onload = () => {
        injetarFotosNoIframe();
      };
    });

    effectsTrack.appendChild(btn);
  }

  // 4. Drawer Lateral Mobile
  const btnHamburger = document.getElementById('btnHamburger');
  const btnCloseDrawer = document.getElementById('btnCloseDrawer');
  const navDrawer = document.getElementById('navDrawer');
  const navOverlay = document.getElementById('navOverlay');

  const openDrawer = () => {
    if (navDrawer && navOverlay) {
      navDrawer.classList.add('open');
      navOverlay.classList.add('active');
    }
  };

  const closeDrawer = () => {
    if (navDrawer && navOverlay) {
      navDrawer.classList.remove('open');
      navOverlay.classList.remove('active');
    }
  };

  if (btnHamburger) btnHamburger.addEventListener('click', openDrawer);
  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeDrawer);
  if (navOverlay) navOverlay.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-item').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // 5. Seletor de Proporções (Aspect Ratio) com delimitação visual garantida
  const btnRatioSelect = document.getElementById('btnRatioSelect');
  const ratioMenu = document.getElementById('ratioMenu');
  const currentRatioLabel = document.getElementById('currentRatioLabel');

  if (btnRatioSelect && ratioMenu && canvasWrapper) {
    btnRatioSelect.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = ratioMenu.classList.toggle('show');
      btnRatioSelect.classList.toggle('active', isOpen);
      btnRatioSelect.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', () => {
      ratioMenu.classList.remove('show');
      btnRatioSelect.classList.remove('active');
      btnRatioSelect.setAttribute('aria-expanded', 'false');
    });

    ratioMenu.querySelectorAll('.ratio-option').forEach(option => {
      option.addEventListener('click', () => {
        const selectedRatio = option.dataset.ratio;
        const selectedLabel = option.dataset.label;

        ratioMenu.querySelectorAll('.ratio-option').forEach(b => b.classList.remove('active'));
        option.classList.add('active');

        if (currentRatioLabel) {
          currentRatioLabel.innerText = selectedLabel;
        }

        canvasWrapper.style.aspectRatio = selectedRatio;

        ratioMenu.classList.remove('show');
        btnRatioSelect.classList.remove('active');
        btnRatioSelect.setAttribute('aria-expanded', 'false');
      });
    });
  }


// GERENCIAMENTO DE PAINÉIS, GAVETA MOBILE E ACCORDION
  const sidebarMedia = document.getElementById('sidebarMedia');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const btnCloseSidebar = document.getElementById('btnCloseSidebar');
  const sidebarMobileTitle = document.getElementById('sidebarMobileTitle');
  const sectionImages = document.getElementById('sectionImages');


  
  const btnToggleText = document.getElementById('btnToggleText');
  const textAccordion = document.getElementById('textAccordion');

  const btnMobileAddImg = document.getElementById('btnMobileAddImg');
  const btnMobileAddTxt = document.getElementById('btnMobileAddTxt');

  // Accordion no Desktop
  if (btnToggleText && textAccordion) {
    btnToggleText.addEventListener('click', () => {
      const isOpen = textAccordion.classList.toggle('open');
      btnToggleText.classList.toggle('active', isOpen);
    });
  }

  // Abertura Mobile da Esquerda para a Direita
  const openMobilePanel = (mode) => {
    if (!sidebarMedia || !sidebarOverlay) return;

    if (mode === 'imagens') {
      if (sidebarMobileTitle) sidebarMobileTitle.innerText = 'Imagens';
      if (sectionImages) sectionImages.style.display = 'block';
      if (btnToggleText) btnToggleText.style.display = 'none';
      if (textAccordion) textAccordion.classList.remove('open');
    } else if (mode === 'texto') {
      if (sidebarMobileTitle) sidebarMobileTitle.innerText = 'Modelos de Texto';
      if (sectionImages) sectionImages.style.display = 'none';
      if (btnToggleText) btnToggleText.style.display = 'none';
      if (textAccordion) {
        textAccordion.classList.add('open');
        textAccordion.style.maxHeight = 'none';
      }
    }

    sidebarMedia.classList.add('open-drawer');
    sidebarOverlay.classList.add('active');
  };

  const closeMobilePanel = () => {
    if (!sidebarMedia || !sidebarOverlay) return;
    sidebarMedia.classList.remove('open-drawer');
    sidebarOverlay.classList.remove('active');

    // Restaura layout padrão do desktop
    if (sectionImages) sectionImages.style.display = 'block';
    if (btnToggleText) btnToggleText.style.display = 'flex';
    if (textAccordion) {
      textAccordion.classList.remove('open');
      textAccordion.style.maxHeight = '';
    }
  };

  if (btnMobileAddImg) {
    btnMobileAddImg.addEventListener('click', () => openMobilePanel('imagens'));
  }

  if (btnMobileAddTxt) {
    btnMobileAddTxt.addEventListener('click', () => openMobilePanel('texto'));
  }

  if (btnCloseSidebar) {
    btnCloseSidebar.addEventListener('click', closeMobilePanel);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeMobilePanel);
  }





});



// CONTROLE DE BOTÕES DOS EFEITOS POR CIMA (OVERLAYS)
const overlayFrame = document.getElementById('overlayFrame');
const overlayButtons = document.querySelectorAll('.btn-overlay');

overlayButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // 1. Marca visualmente o botão clicado como ativo
    overlayButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const efeitoSrc = btn.dataset.src;

    if (!efeitoSrc || efeitoSrc === '') {
      // Opção "Nenhum": esconde o iframe e limpa o src
      overlayFrame.style.display = 'none';
      overlayFrame.src = '';
    } else {
      // Carrega o efeito escolhido com fundo transparente sobre a animação
      overlayFrame.src = efeitoSrc;
      overlayFrame.style.display = 'block';
    }
  });
});



// CONTROLE DOS PAINÉIS INDIVIDUAIS
  const panelImages = document.getElementById('panelImages');
  const panelTexts = document.getElementById('panelTexts');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  const btnMobileAddImg = document.getElementById('btnMobileAddImg');
  const btnMobileAddTxt = document.getElementById('btnMobileAddTxt');
  const btnOpenTextDesktop = document.getElementById('btnOpenTextDesktop');
  const closeButtons = document.querySelectorAll('.btn-close-panel');

  const openSidePanel = (target) => {
    if (panelImages) panelImages.classList.remove('open');
    if (panelTexts) panelTexts.classList.remove('open');

    if (target) {
      target.classList.add('open');
      if (sidebarOverlay) sidebarOverlay.classList.add('active');
    }
  };

  const closeSidePanels = () => {
    if (panelImages) panelImages.classList.remove('open');
    if (panelTexts) {
      panelTexts.classList.remove('open');
      panelTexts.classList.remove('desktop-show');
    }
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
  };

  if (btnMobileAddImg) {
    btnMobileAddImg.addEventListener('click', () => openSidePanel(panelImages));
  }

  if (btnMobileAddTxt) {
    btnMobileAddTxt.addEventListener('click', () => openSidePanel(panelTexts));
  }

  if (btnOpenTextDesktop && panelTexts) {
    btnOpenTextDesktop.addEventListener('click', () => {
      panelTexts.classList.toggle('desktop-show');
    });
  }

  closeButtons.forEach(btn => btn.addEventListener('click', closeSidePanels));
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidePanels);



  // Controle interativo da Barra Flutuante de Textos
document.addEventListener('DOMContentLoaded', () => {
  const toolbarBold = document.getElementById('toolbarBold');
  const toolbarItalic = document.getElementById('toolbarItalic');
  const toolbarUnderline = document.getElementById('toolbarUnderline');
  const toolbarFontSize = document.getElementById('toolbarFontSize');
  const toolbarDelete = document.getElementById('toolbarDelete');
  const toolbarColorBtn = document.getElementById('toolbarColorBtn');
  const colorPopup = document.getElementById('colorPopup');

  if (toolbarBold) {
    toolbarBold.addEventListener('click', () => {
      if (window.activeTextElement) {
        const isBold = window.activeTextElement.style.fontWeight === 'bold';
        window.activeTextElement.style.fontWeight = isBold ? 'normal' : 'bold';
        toolbarBold.classList.toggle('active', !isBold);
      }
    });
  }

  if (toolbarItalic) {
    toolbarItalic.addEventListener('click', () => {
      if (window.activeTextElement) {
        const isItalic = window.activeTextElement.style.fontStyle === 'italic';
        window.activeTextElement.style.fontStyle = isItalic ? 'normal' : 'italic';
        toolbarItalic.classList.toggle('active', !isItalic);
      }
    });
  }

  if (toolbarUnderline) {
    toolbarUnderline.addEventListener('click', () => {
      if (window.activeTextElement) {
        const hasUnderline = window.activeTextElement.style.textDecoration.includes('underline');
        window.activeTextElement.style.textDecoration = hasUnderline ? 'none' : 'underline';
        toolbarUnderline.classList.toggle('active', !hasUnderline);
      }
    });
  }

  if (toolbarFontSize) {
    toolbarFontSize.addEventListener('change', (e) => {
      if (window.activeTextElement) {
        window.activeTextElement.style.fontSize = e.target.value + 'px';
      }
    });
  }

  if (toolbarDelete) {
    toolbarDelete.addEventListener('click', () => {
      if (window.activeTextElement) {
        const wrapper = window.activeTextElement.closest('.canva-text-wrapper');
        if (wrapper) wrapper.remove();
        const toolbar = document.getElementById('textFloatingToolbar');
        if (toolbar) toolbar.style.display = 'none';
        window.activeTextElement = null;
      }
    });
  }

  if (toolbarColorBtn && colorPopup) {
    toolbarColorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      colorPopup.style.display = colorPopup.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
      colorPopup.style.display = 'none';
    });

    colorPopup.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Seleção de cor na paleta
    colorPopup.querySelectorAll('.color-circle').forEach(circle => {
      circle.addEventListener('click', () => {
        const color = circle.dataset.color;
        if (window.activeTextElement) {
          window.activeTextElement.style.color = color;
          const fill = document.getElementById('toolbarColorFill');
          if (fill) fill.style.backgroundColor = color;
        }
        colorPopup.style.display = 'none';
      });
    });
  }
});

// Sistema Definitivo de Arraste e Rotação do Texto
document.addEventListener('DOMContentLoaded', () => {
  let isDragging = false;
  let isRotating = false;
  let currentWrapper = null;
  let startX = 0, startY = 0;
  let initialX = 0, initialY = 0;
  let currentRotation = 0;

  document.addEventListener('mousedown', (e) => {
    // 1. Clicar nas alças de rotação
    if (e.target.classList.contains('rotate-handle')) {
      e.stopPropagation();
      currentWrapper = e.target.closest('.canva-text-wrapper');
      isRotating = true;
      const rect = currentWrapper.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
      return;
    }

    // 2. Clicar na caixa de texto para arrastar
    const wrapper = e.target.closest('.canva-text-wrapper');
    if (wrapper && !e.target.classList.contains('resize-handle')) {
      currentWrapper = wrapper;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      // Posição atual da caixa em pixels
      const rect = currentWrapper.getBoundingClientRect();
      const parentRect = currentWrapper.parentElement.getBoundingClientRect();
      
      initialX = rect.left - parentRect.left;
      initialY = rect.top - parentRect.top;

      currentWrapper.style.transform = `translate(${initialX}px, ${initialY}px) rotate(${currentRotation}deg)`;
      currentWrapper.style.left = '0px';
      currentWrapper.style.top = '0px';
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!currentWrapper) return;

    if (isDragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const posX = initialX + dx;
      const posY = initialY + dy;
      currentWrapper.style.transform = `translate(${posX}px, ${posY}px) rotate(${currentRotation}deg)`;
    }

    if (isRotating) {
      const rect = currentWrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      currentRotation = radians * (180 / Math.PI) + 90;
      
      // Mantém a translação atual e aplica a nova rotação
      const transformMatch = currentWrapper.style.transform.match(/translate\([^)]+\)/);
      const translatePart = transformMatch ? transformMatch[0] : 'translate(0px, 0px)';
      currentWrapper.style.transform = `${translatePart} rotate(${currentRotation}deg)`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    isRotating = false;
  });
});









// Sistema Profissional e Preciso de Arraste e Redimensionamento (Mouse e Touch)
document.addEventListener('DOMContentLoaded', () => {
  let isDragging = false;
  let isResizing = false;
  let currentWrapper = null;
  let startX = 0, startY = 0;
  let initialX = 0, initialY = 0;
  let startWidth = 0;
  let isResizeWidth = false;

  document.addEventListener('pointerdown', (e) => {
    // 1. Inicia o Redimensionamento apenas se clicar exatamente na alça
    if (e.target.classList.contains('resize-handle')) {
      e.stopPropagation();
      isResizing = true;
      currentWrapper = e.target.closest('.canva-text-wrapper');
      startX = e.clientX;
      startWidth = currentWrapper.offsetWidth;
      isResizeWidth = e.target.classList.contains('left') || e.target.classList.contains('right');
      
      if (e.target.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId);
      }
      return;
    }

    // 2. Inicia o Arraste da Caixa
    const wrapper = e.target.closest('.canva-text-wrapper');
    if (wrapper && !e.target.classList.contains('rotate-handle')) {
      currentWrapper = wrapper;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = currentWrapper.getBoundingClientRect();
      const parentRect = currentWrapper.parentElement.getBoundingClientRect();
      
      initialX = rect.left - parentRect.left;
      initialY = rect.top - parentRect.top;

      currentWrapper.style.transform = `translate(${initialX}px, ${initialY}px)`;
      currentWrapper.style.left = '0px';
      currentWrapper.style.top = '0px';
    }
  });

  document.addEventListener('pointermove', (e) => {
    if (!currentWrapper) return;

    // Se estiver arrastando a caixa
    if (isDragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const posX = initialX + dx;
      const posY = initialY + dy;
      currentWrapper.style.transform = `translate(${posX}px, ${posY}px)`;
    }

    // Se estiver redimensionando pelas alças
    if (isResizing) {
      const dx = e.clientX - startX;
      const parentWidth = currentWrapper.parentElement.clientWidth;
      
      if (isResizeWidth) {
        // Redimensiona a largura de forma fluida e controlada pelo movimento real
        const newWidth = Math.min(parentWidth - 10, Math.max(80, startWidth + dx));
        currentWrapper.style.width = newWidth + 'px';
      } else {
        // Redimensiona a fonte pelos cantos
        const textEl = currentWrapper.querySelector('.interactive-text-box');
        if (textEl) {
          let currentSize = parseInt(window.getComputedStyle(textEl).fontSize);
          const newSize = Math.max(16, currentSize + (e.movementX * 0.4 || dx * 0.1)); 
          textEl.style.fontSize = newSize + 'px';
        }
      }
    }
  });

  // Para o evento imediatamente ao soltar o dedo ou o mouse
  const stopInteraction = () => {
    isDragging = false;
    isResizing = false;
    currentWrapper = null;
  };

  document.addEventListener('pointerup', stopInteraction);
  document.addEventListener('pointercancel', stopInteraction);
});






document.addEventListener('DOMContentLoaded', () => {
  let isDragging = false;
  let isResizing = false;
  let currentWrapper = null;
  let startX = 0, startY = 0;
  let initialX = 0, initialY = 0;
  let startWidth = 0;
  let startFontSize = 60;
  let resizeHandleType = null;

  document.addEventListener('pointerdown', (e) => {
    // 1. Redimensionamento pelas alças
    if (e.target.classList.contains('resize-handle')) {
      e.stopPropagation();
      isResizing = true;
      currentWrapper = e.target.closest('.canva-text-wrapper');
      startX = e.clientX;
      startWidth = currentWrapper.offsetWidth;
      
      const textEl = currentWrapper.querySelector('.interactive-text-box');
      if (textEl) {
        startFontSize = parseInt(window.getComputedStyle(textEl).fontSize, 10);
      }
      
      resizeHandleType = e.target.classList.contains('tl') || e.target.classList.contains('bl') ? 'left' : 'right';
      
      if (e.target.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId);
      }
      return;
    }

    // 2. Arraste da caixa de texto
    const wrapper = e.target.closest('.canva-text-wrapper');
    if (wrapper && !e.target.classList.contains('rotate-handle') && !e.target.isContentEditable) {
      currentWrapper = wrapper;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = currentWrapper.getBoundingClientRect();
      const parentRect = currentWrapper.parentElement.getBoundingClientRect();
      
      initialX = rect.left - parentRect.left;
      initialY = rect.top - parentRect.top;

      currentWrapper.style.transform = `translate(${initialX}px, ${initialY}px)`;
      currentWrapper.style.left = '0px';
      currentWrapper.style.top = '0px';
    }
  });

  document.addEventListener('pointermove', (e) => {
    if (!currentWrapper) return;

    if (isDragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      requestAnimationFrame(() => {
        currentWrapper.style.transform = `translate(${initialX + dx}px, ${initialY + dy}px)`;
      });
    }

    if (isResizing) {
      const dx = e.clientX - startX;
      // Inverte o delta se puxar pela esquerda para crescer proporcionalmente
      const multiplier = resizeHandleType === 'left' ? -1 : 1;
      const newWidth = Math.max(80, startWidth + (dx * multiplier));
      
      requestAnimationFrame(() => {
        currentWrapper.style.width = newWidth + 'px';
        
        // Redimensiona a fonte de forma proporcional e suave junto com a largura
        const textEl = currentWrapper.querySelector('.interactive-text-box');
        if (textEl) {
          const scaleFactor = newWidth / startWidth;
          const newSize = Math.max(16, Math.min(150, Math.round(startFontSize * scaleFactor)));
          textEl.style.fontSize = newSize + 'px';
          
          const toolbarFontSize = document.getElementById('toolbarFontSize');
          if (toolbarFontSize) toolbarFontSize.value = newSize;
        }
      });
    }
  });

  const stopInteraction = () => {
    isDragging = false;
    isResizing = false;
    currentWrapper = null;
  };

  document.addEventListener('pointerup', stopInteraction);
  document.addEventListener('pointercancel', stopInteraction);
});