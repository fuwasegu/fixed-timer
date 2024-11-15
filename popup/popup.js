document.getElementById('setTimer').addEventListener('click', async () => {
  const timeInput = document.getElementById('timerInput').value;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, {
    action: 'setTimer',
    time: timeInput
  });
}); 