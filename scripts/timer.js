class PageTimer {
  constructor() {
    this.timerElement = null;
    this.interval = null;
    this.remainingTime = 0;
    this.initialTime = 0;
    this.isRunning = false;
  }

  createTimer() {
    if (this.timerElement) return;

    this.timerElement = document.createElement('div');
    this.timerElement.className = 'page-timer';
    this.timerElement.innerHTML = `
      <div class="timer-display">00:00:00</div>
      <div class="timer-controls">
        <button id="start-timer">開始</button>
        <button id="stop-timer">停止</button>
        <button id="reset-timer">リセット</button>
      </div>
    `;

    document.body.appendChild(this.timerElement);
    this.setupControls();
  }

  setupControls() {
    const startBtn = this.timerElement.querySelector('#start-timer');
    const stopBtn = this.timerElement.querySelector('#stop-timer');
    const resetBtn = this.timerElement.querySelector('#reset-timer');

    startBtn.addEventListener('click', () => this.start());
    stopBtn.addEventListener('click', () => this.stop());
    resetBtn.addEventListener('click', () => this.reset());
  }

  setTime(seconds) {
    this.initialTime = seconds;
    this.remainingTime = seconds;
    this.updateDisplay();
  }

  updateDisplay() {
    if (!this.timerElement) return;
    
    const hours = Math.floor(this.remainingTime / 3600);
    const minutes = Math.floor((this.remainingTime % 3600) / 60);
    const seconds = this.remainingTime % 60;

    const display = this.timerElement.querySelector('.timer-display');
    display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  start() {
    if (this.isRunning || this.remainingTime <= 0) return;
    
    this.isRunning = true;
    this.interval = setInterval(() => {
      this.remainingTime--;
      this.updateDisplay();

      if (this.remainingTime <= 0) {
        this.stop();
        alert('タイマーが終了しました！');
      }
    }, 1000);
  }

  stop() {
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  reset() {
    this.stop();
    this.remainingTime = this.initialTime;
    this.updateDisplay();
  }

  remove() {
    if (this.timerElement) {
      this.stop();
      this.timerElement.remove();
      this.timerElement = null;
    }
  }
}

// グローバルインスタンスを作成
window.pageTimer = new PageTimer(); 