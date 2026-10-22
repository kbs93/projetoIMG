export class Recorder {
  constructor(getCanvasCallback) {
    this.getCanvas = getCanvasCallback;
    this.btnRecord = document.getElementById('btnRecord');
    this.btnDownload = document.getElementById('btnDownload');
    this.timerDisplay = document.getElementById('recordTimer');
    this.mediaRecorder = null;
    this.chunks = [];
    this.timerInterval = null;

    if (this.btnRecord) {
      this.btnRecord.addEventListener('click', () => this.toggleRecord());
    }
  }

  toggleRecord() {
    const canvas = typeof this.getCanvas === 'function' ? this.getCanvas() : null;

    if (!canvas) {
      alert("Aguarde a animação carregar para iniciar a gravação.");
      return;
    }

    try {
      const stream = canvas.captureStream(60);
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      this.chunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        if (this.btnDownload) {
          this.btnDownload.href = url;
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
      console.error("Erro ao iniciar gravação:", err);
      alert("Não foi possível gravar o canvas desta animação.");
    }
  }
}