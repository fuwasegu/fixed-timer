const timerContainer = document.createElement('div');
timerContainer.id = 'timer-container';
timerContainer.innerHTML = `
  <div id="timer-display">00:00:00</div>
  <div class="timer-controls">
    <button id="start-timer">開始</button>
    <button id="stop-timer">停止</button>
    <button id="reset-timer">リセット</button>
  </div>
`;

document.body.appendChild(timerContainer);

const timer = new Timer();

document.getElementById('start-timer').addEventListener('click', () => timer.start());
document.getElementById('stop-timer').addEventListener('click', () => timer.stop());
document.getElementById('reset-timer').addEventListener('click', () => timer.reset());

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setTimer') {
    timer.setTime(request.time);
  }
}); 