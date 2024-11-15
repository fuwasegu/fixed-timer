chrome.tabs.onRemoved.addListener(async (tabId) => {
  const { timers = {} } = await chrome.storage.local.get('timers');
  if (timers[tabId]) {
    delete timers[tabId];
    await chrome.storage.local.set({ timers });
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    const { timers = {} } = await chrome.storage.local.get('timers');
    if (timers[tabId]) {
      delete timers[tabId];
      await chrome.storage.local.set({ timers });
    }
  }
});

// メッセージハンドラを追加
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCurrentTabId') {
    sendResponse({ tabId: sender.tab.id });
  }
  return true;
}); 