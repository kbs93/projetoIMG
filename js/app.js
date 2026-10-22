import { MediaManager } from './media.js';
import { Recorder } from './recorde.js';
import { OverlaysManager } from './efeito.js';

// Inicializa os botões dinâmicos e o iframe transparente
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