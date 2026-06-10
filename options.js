// options.js - Full settings for 30 features (Claude + Gemini + Pro) + #7 Gateway (issued key only)

document.addEventListener('DOMContentLoaded', () => {
  const claude = document.getElementById('claude-key');
  const gemini = document.getElementById('gemini-key');
  const entitlementSel = document.getElementById('entitlement');
  const prefer = document.getElementById('prefer');
  const saveBtn = document.getElementById('save');
  const status = document.getElementById('status');

  // #7 gateway elements
  const gwUrl = document.getElementById('gw-url');
  const gwKey = document.getElementById('gw-key');
  const gwTest = document.getElementById('gw-test');

  chrome.storage.sync.get(['claudeKey', 'geminiKey', 'entitlement', 'preferModel'], (res) => {
    if (res.claudeKey) claude.value = res.claudeKey;
    if (res.geminiKey) gemini.value = res.geminiKey;
    if (entitlementSel && res.entitlement) entitlementSel.value = res.entitlement;
    if (res.preferModel) prefer.value = res.preferModel;
  });

  // load gateway from local (safer for tokens)
  chrome.storage.local.get(['gatewayUrl', 'gatewayKey'], (g) => {
    if (gwUrl && g.gatewayUrl) gwUrl.value = g.gatewayUrl;
    if (gwKey && g.gatewayKey) gwKey.value = g.gatewayKey;
  });

  saveBtn.onclick = () => {
    chrome.storage.sync.set({
      claudeKey: claude.value.trim(),
      geminiKey: gemini.value.trim(),
      entitlement: entitlementSel ? entitlementSel.value : 'free',
      preferModel: prefer.value
    }, () => {
      // also save gateway to local
      const gurl = gwUrl ? gwUrl.value.trim() : '';
      const gkey = gwKey ? gwKey.value.trim() : '';
      chrome.storage.local.set({ gatewayUrl: gurl, gatewayKey: gkey }, () => {
        status.textContent = '✅ 所有設定已儲存！Mock Entitlement 已更新，可測試 Pro 鎖定。';
        setTimeout(() => status.textContent = '', 2500);
      });
    });
  };

  if (gwTest) gwTest.onclick = async () => {
    status.textContent = '測試 Gateway...';
    const res = await chrome.runtime.sendMessage({ action: 'testGateway' });
    status.textContent = (res && res.success) ? '✅ Gateway 連線成功' : ('❌ ' + (res && res.error || '失敗'));
    setTimeout(() => status.textContent = '', 3000);
  };
});
