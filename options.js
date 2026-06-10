// options.js - Full settings for 30 features (Claude + Gemini + Pro)

document.addEventListener('DOMContentLoaded', () => {
  const claude = document.getElementById('claude-key');
  const gemini = document.getElementById('gemini-key');
  const pro = document.getElementById('pro');
  const prefer = document.getElementById('prefer');
  const saveBtn = document.getElementById('save');
  const status = document.getElementById('status');

  chrome.storage.sync.get(['claudeKey', 'geminiKey', 'proEnabled', 'preferModel'], (res) => {
    if (res.claudeKey) claude.value = res.claudeKey;
    if (res.geminiKey) gemini.value = res.geminiKey;
    pro.checked = !!res.proEnabled;
    if (res.preferModel) prefer.value = res.preferModel;
  });

  saveBtn.onclick = () => {
    chrome.storage.sync.set({
      claudeKey: claude.value.trim(),
      geminiKey: gemini.value.trim(),
      proEnabled: pro.checked,
      preferModel: prefer.value
    }, () => {
      status.textContent = '✅ 所有設定已儲存！可立即使用全部 30 功能';
      setTimeout(() => status.textContent = '', 2500);
    });
  };
});
