class Timer {
  constructor() {
    this.timeLeft = 0;
    this.timerId = null;
    this.isRunning = false;
  }

  setTime(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    this.timeLeft = (hours * 3600 + minutes * 60 + seconds) * 1000;
    this.updateDisplay();
  }

  start() {
    if (!this.isRunning && this.timeLeft > 0) {
      this.isRunning = true;
      this.timerId = setInterval(() => {
        this.timeLeft -= 1000;
        this.updateDisplay();
        
        if (this.timeLeft <= 0) {
          this.stop();
          alert('タイマーが終了しました！');
        }
      }, 1000);
    }
  }

  stop() {
    this.isRunning = false;
    clearInterval(this.timerId);
  }

  reset() {
    this.stop();
    this.timeLeft = 0;
    this.updateDisplay();
  }

  updateDisplay() {
    const hours = Math.floor(this.timeLeft / 3600000);
    const minutes = Math.floor((this.timeLeft % 3600000) / 60000);
    const seconds = Math.floor((this.timeLeft % 60000) / 1000);
    
    const display = document.getElementById('timer-display');
    if (display) {
      display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }
} 