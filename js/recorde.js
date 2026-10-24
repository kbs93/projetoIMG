export class Recorder {
  constructor(getCanvasCallback) {
    this.getCanvas = getCanvasCallback;
    this.btnRecord = document.getElementById('btnRecord');
    this.btnDownload = document.getElementById('btnDownload');
    this.timerDisplay = document.getElementById('recordTimer');
    this.mediaRecorder = null;
    this.chunks = [];
    this.timerInterval = null;
    this.animLoopId = null;

    if (this.btnRecord) {
      this.btnRecord.addEventListener('click', () => this.toggleRecord());
    }
  }

  toggleRecord() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      return;
    }

    const animCanvas = typeof this.getCanvas === 'function' ? this.getCanvas() : null;
    if (!animCanvas) {
      alert("Aguarde a animação carregar para iniciar a gravação.");
      return;
    }

    try {
      const wrapper = document.getElementById('canvasWrapper');
      const textContainer = document.getElementById('textOverlayContainer');
      const overlayFrame = document.getElementById('overlayFrame');

      // Canvas final de saída (resolução nativa do slide, ex: 1080x1920)
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = animCanvas.width || 1080;
      exportCanvas.height = animCanvas.height || 1920;
      const ctx = exportCanvas.getContext('2d', { alpha: false });

      // Loop de renderização dos frames durante a gravação
      let isRecording = true;
      const processFrame = () => {
        if (!isRecording) return;

        // 1. Desenha o fundo da Animação
        if (animCanvas.width > 0 && animCanvas.height > 0) {
          ctx.drawImage(animCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
        }

        // 2. Se houver Efeito ativo por cima, desenha
        if (overlayFrame && overlayFrame.style.display !== 'none' && overlayFrame.contentWindow) {
          try {
            const overlayDoc = overlayFrame.contentDocument || overlayFrame.contentWindow.document;
            const oCanvas = overlayDoc ? overlayDoc.querySelector('canvas') : null;
            if (oCanvas && oCanvas.width > 0) {
              ctx.drawImage(oCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
            }
          } catch (e) {}
        }

        // 3. Estampa os Textos da tela exatamente na posição, rotação e escala
        if (textContainer && wrapper) {
          const scaleX = exportCanvas.width / wrapper.clientWidth;
          const scaleY = exportCanvas.height / wrapper.clientHeight;
          const textWrappers = textContainer.querySelectorAll('.canva-text-wrapper');

          textWrappers.forEach(tw => {
            const textBox = tw.querySelector('.interactive-text-box');
            if (!textBox) return;

            const computed = window.getComputedStyle(textBox);
            const wrapRect = tw.getBoundingClientRect();
            const parentRect = wrapper.getBoundingClientRect();

            // Posição central do texto para suportar rotação perfeita
            const centerX = ((wrapRect.left + wrapRect.width / 2) - parentRect.left) * scaleX;
            const centerY = ((wrapRect.top + wrapRect.height / 2) - parentRect.top) * scaleY;

            let rotation = 0;
            const transform = tw.style.transform || '';
            const rotMatch = transform.match(/rotate\(([-0-9.]+)deg\)/);
            if (rotMatch) rotation = parseFloat(rotMatch[1]);

            const fontSize = (parseFloat(computed.fontSize) || 60) * scaleY;
            const fontFamily = computed.fontFamily || 'sans-serif';
            const fontWeight = computed.fontWeight || 'bold';
            const fontStyle = computed.fontStyle || 'normal';
            const color = computed.color || '#ffffff';

            ctx.save();
            ctx.translate(centerX, centerY);
            if (rotation) {
              ctx.rotate((rotation * Math.PI) / 180);
            }

            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Sombra do texto igual à da tela
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowOffsetX = 3 * scaleX;
            ctx.shadowOffsetY = 3 * scaleY;
            ctx.shadowBlur = 4;

            const lines = (textBox.innerText || '').split('\n');
            const lineHeight = fontSize * 1.2;
            const startY = -((lines.length - 1) * lineHeight) / 2;

            lines.forEach((line, idx) => {
              ctx.fillText(line, 0, startY + (idx * lineHeight));
            });

            ctx.restore();
          });
        }

        this.animLoopId = requestAnimationFrame(processFrame);
      };

      // Inicia a gravação a 60 FPS direto do exportCanvas composto
      const stream = exportCanvas.captureStream(60);

      let options = { mimeType: 'video/webm' };
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          options = { mimeType: 'video/webm;codecs=vp9' };
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          options = { mimeType: 'video/webm' };
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          options = { mimeType: 'video/mp4' };
        } else {
          options = {};
        }
      }

      this.mediaRecorder = new MediaRecorder(stream, options);
      this.chunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) this.chunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        isRecording = false;
        cancelAnimationFrame(this.animLoopId);
        clearInterval(this.timerInterval);

        const finalType = this.mediaRecorder.mimeType || 'video/webm';
        const blob = new Blob(this.chunks, { type: finalType });
        const url = URL.createObjectURL(blob);

        if (this.btnDownload) {
          this.btnDownload.href = url;
          this.btnDownload.download = finalType.includes('mp4') ? 'animacao.mp4' : 'animacao.webm';
          this.btnDownload.style.display = 'inline-flex';
        }

        if (this.btnRecord) {
          this.btnRecord.classList.remove('recording');
        }

        if (this.timerDisplay) {
          this.timerDisplay.innerText = "00:00 / 00:10";
        }
      };

      this.mediaRecorder.start();
      this.animLoopId = requestAnimationFrame(processFrame);

      if (this.btnRecord) {
        this.btnRecord.classList.add('recording');
      }

      let seconds = 0;
      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        seconds++;
        if (this.timerDisplay) {
          this.timerDisplay.innerText = `00:${String(seconds).padStart(2, '0')} / 00:10`;
        }
        if (seconds >= 10) {
          clearInterval(this.timerInterval);
          if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
          }
        }
      }, 1000);

    } catch (err) {
      console.error("Erro na gravação:", err);
      alert("Não foi possível iniciar a gravação.");
    }
  }
}