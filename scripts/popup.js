document.addEventListener('DOMContentLoaded', async () => {
  const createTimerBtn = document.getElementById('create-timer');
  const updateTimerBtn = document.getElementById('update-timer');
  const removeTimerBtn = document.getElementById('remove-timer');
  const templateButtons = document.querySelectorAll('.templates button');

  // 初期状態では作成ボタンのみ表示
  createTimerBtn.style.display = 'block';
  updateTimerBtn.style.display = 'none';
  removeTimerBtn.style.display = 'none';

  // タイマーの存在確認
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const [result] = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: () => {
        // windowオブジェクトにpageTimerが存在し、かつtimerElementが存在するか確認
        return typeof window.pageTimer !== 'undefined' && 
               window.pageTimer !== null && 
               window.pageTimer.timerElement !== null;
      }
    });
    
    if (result.result === true) {  // 厳密な比較に変更
      // タイマーが存在する場合
      createTimerBtn.style.display = 'none';
      updateTimerBtn.style.display = 'block';
      removeTimerBtn.style.display = 'block';
    }
  } catch (error) {
    console.error('Error checking timer:', error);
  }

  // テンプレートボタンのイベントリスナー
  templateButtons.forEach(button => {
    button.addEventListener('click', () => {
      const minutes = parseInt(button.dataset.time);
      document.getElementById('hours').value = Math.floor(minutes / 60);
      document.getElementById('minutes').value = minutes % 60;
      document.getElementById('seconds').value = 0;
    });
  });

  function getTimeInSeconds() {
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  // タイマー作成
  createTimerBtn.addEventListener('click', () => {
    const totalSeconds = getTimeInSeconds();

    if (totalSeconds <= 0) {
      alert('時間を設定してください');
      return;
    }

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: (seconds) => {
          // PageTimerが存在しない場合は初期化
          if (!window.pageTimer) {
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
            window.pageTimer = new PageTimer();
          }
          window.pageTimer.createTimer();
          window.pageTimer.setTime(seconds);
        },
        args: [totalSeconds]
      });
    });

    window.close();
  });

  // タイマー更新
  updateTimerBtn.addEventListener('click', () => {
    const totalSeconds = getTimeInSeconds();

    if (totalSeconds <= 0) {
      alert('時間を設定してください');
      return;
    }

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: (seconds) => {
          window.pageTimer.stop();
          window.pageTimer.setTime(seconds);
        },
        args: [totalSeconds]
      });
    });

    window.close();
  });

  // タイマー削除
  removeTimerBtn.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: () => window.pageTimer.remove()
      });
    });
    window.close();
  });
}); 