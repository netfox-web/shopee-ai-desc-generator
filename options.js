// options.js - Simple options page for API settings

document.addEventListener('DOMContentLoaded', () => {
  const keyInput = document.getElementById('api-key');
  const saveBtn = document.getElementById('save');

  chrome.storage.sync.get(['apiKey'], (result) => {
    if (result.apiKey) keyInput.value = result.apiKey;
  });

  saveBtn.onclick = () => {
    chrome.storage.sync.set({ apiKey: keyInput.value }, () => {
      alert('設定已儲存！');
    });
  };
});
