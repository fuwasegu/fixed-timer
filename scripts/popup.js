document.addEventListener('DOMContentLoaded', async () => {
  const createTimerBtn = document.getElementById('create-timer');
  const updateTimerBtn = document.getElementById('update-timer');
  const removeTimerBtn = document.getElementById('remove-timer');
  const templateButtons = document.querySelectorAll('.templates button');
  const controlsContainer = document.getElementById('timer-controls');
  const messageContainer = document.getElementById('message-container');

  // タイマーの状態を確認
  async function checkTimerStatus() {
    try {
      // 現在のタブIDを取得
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // chrome:// URLの場合は早期リターン
      if (currentTab.url.startsWith('chrome://')) {
        messageContainer.innerHTML = `
          <p>このページではタイマーを使用できません</p>
        `;
        controlsContainer.style.display = 'none';
        return false;
      }
      
      // storageから全タイマー情報を取得
      const { timers = {} } = await chrome.storage.local.get('timers');
      
      // 現在のタブにタイマーが存在する場合
      if (timers[currentTab.id]) {
        createTimerBtn.style.display = 'none';
        updateTimerBtn.style.display = 'block';
        removeTimerBtn.style.display = 'block';
      } else {
        createTimerBtn.style.display = 'block';
        updateTimerBtn.style.display = 'none';
        removeTimerBtn.style.display = 'none';
      }

      // アクティブなタイマーの数を表示
      const activeTimerCount = Object.keys(timers).length;
      if (activeTimerCount > 0) {
        messageContainer.innerHTML = `
          <p>現在${activeTimerCount}個のタイマーが実行中です</p>
        `;
      }

      return true;
    } catch (error) {
      console.error('Error checking timer status:', error);
      messageContainer.innerHTML = `
        <p>エラーが発生しました</p>
      `;
      controlsContainer.style.display = 'none';
      return false;
    }
  }

  // 初期状態のチェック
  await checkTimerStatus();

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
  createTimerBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url.startsWith('chrome://')) {
      alert('このページではタイマーを使用できません');
      return;
    }

    const totalSeconds = getTimeInSeconds();

    if (totalSeconds <= 0) {
      alert('時間を設定してください');
      return;
    }

    // タイマー情報を保存
    const { timers = {} } = await chrome.storage.local.get('timers');
    timers[tab.id] = {
      timestamp: Date.now(),
      totalSeconds: totalSeconds
    };
    await chrome.storage.local.set({ timers });

    // まずCSSを注入
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['styles/timer.css']
    });

    // 次にJavaScriptを注入
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['scripts/timer.js']
    });

    // 最後にタイマーを初期化
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (seconds) => {
        if (!window.pageTimer) {
          window.pageTimer = new PageTimer();
        }
        window.pageTimer.createTimer();
        window.pageTimer.setTime(seconds);
      },
      args: [totalSeconds]
    });

    window.close();
  });

  // タイマー更新
  updateTimerBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url.startsWith('chrome://')) {
      alert('このページではタイマーを使用できません');
      return;
    }

    const totalSeconds = getTimeInSeconds();

    if (totalSeconds <= 0) {
      alert('時間を設定してください');
      return;
    }

    // タイマー情報を更新
    const { timers = {} } = await chrome.storage.local.get('timers');
    timers[tab.id] = {
      timestamp: Date.now(),
      totalSeconds: totalSeconds
    };
    await chrome.storage.local.set({ timers });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (seconds) => {
        window.pageTimer.stop();
        window.pageTimer.setTime(seconds);
      },
      args: [totalSeconds]
    });

    window.close();
  });

  // タイマー削除
  removeTimerBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url.startsWith('chrome://')) {
      alert('このページではタイマーを使用できません');
      return;
    }

    // タイマー情報を削除
    const { timers = {} } = await chrome.storage.local.get('timers');
    delete timers[tab.id];
    await chrome.storage.local.set({ timers });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.pageTimer.remove()
    });
    
    window.close();
  });
}); 