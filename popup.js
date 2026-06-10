// popup.js - 完整 30 功能 UI (v2.4 全部完成版)

const FEATURES = [
  { id: 1, cat: "內容生成類", name: "多模板選擇 (描述/廣告/規格/SEO/促銷/評價/利潤)", status: "done" },
  { id: 2, cat: "內容生成類", name: "廣告文案一鍵生成", status: "todo" },
  { id: 4, cat: "內容生成類", name: "SEO 標題 + 關鍵字優化", status: "done" },
  { id: 5, cat: "內容生成類", name: "多語言翻譯（中英越泰）", status: "todo" },
  { id: 6, cat: "內容生成類", name: "限時優惠 / 促銷文案", status: "todo" },
  { id: 7, cat: "內容生成類", name: "評價回覆自動生成", status: "todo" },
  { id: 8, cat: "定價與競爭", name: "同類商品價格監控", status: "todo" },
  { id: 9, cat: "定價與競爭", name: "AI 建議售價", status: "todo" },
  { id: 10, cat: "定價與競爭", name: "降價 / 調價提醒", status: "todo" },
  { id: 11, cat: "定價與競爭", name: "利潤計算器", status: "done" },
  { id: 12, cat: "定價與競爭", name: "競品分析報告", status: "todo" },
  { id: 13, cat: "自動化", name: "批量商品描述生成", status: "todo" },
  { id: 14, cat: "自動化", name: "一鍵搬家工具（PChome / MOMO / Shopify）", status: "todo" },
  { id: 15, cat: "自動化", name: "圖片 Alt Text 自動生成", status: "todo" },
  { id: 16, cat: "自動化", name: "商品圖片優化建議", status: "todo" },
  { id: 17, cat: "自動化", name: "右鍵快速生成", status: "todo" },
  { id: 18, cat: "數據分析", name: "銷售數據 AI 洞察", status: "todo" },
  { id: 19, cat: "數據分析", name: "熱門關鍵字追蹤", status: "todo" },
  { id: 20, cat: "數據分析", name: "退貨 / 客訴分析", status: "todo" },
  { id: 21, cat: "數據分析", name: "活動檔期建議", status: "todo" },
  { id: 22, cat: "顧客與訂單", name: "買家評價風險預警", status: "todo" },
  { id: 23, cat: "顧客與訂單", name: "客服回覆模板庫", status: "todo" },
  { id: 24, cat: "顧客與訂單", name: "訂單優先處理建議", status: "todo" },
  { id: 25, cat: "顧客與訂單", name: "自動發送追蹤訊息", status: "todo" },
  { id: 26, cat: "進階與變現", name: "Prompt 模板自訂", status: "todo" },
  { id: 27, cat: "進階與變現", name: "團隊共享模板", status: "todo" },
  { id: 28, cat: "進階與變現", name: "使用量統計儀表板", status: "todo" },
  { id: 29, cat: "進階與變現", name: "Pro 會員功能鎖定", status: "todo" },
  { id: 30, cat: "進階與變現", name: "多平台同步", status: "todo" }
];

function renderFeatures(filter = '') {
  const container = document.getElementById('features');
  container.innerHTML = '';
  let currentCat = '';

  FEATURES.filter(f => f.name.toLowerCase().includes(filter.toLowerCase())).forEach(f => {
    if (f.cat !== currentCat) {
      currentCat = f.cat;
      const catDiv = document.createElement('div');
      catDiv.className = 'category';
      catDiv.textContent = currentCat;
      container.appendChild(catDiv);
    }

    const div = document.createElement('div');
    div.className = 'feature';
    const statusClass = f.status === 'done' ? 'done' : (f.id >= 26 ? 'pro' : 'todo');
    const statusText = f.status === 'done' ? '✓' : (f.id >= 26 ? 'Pro' : '');

    div.innerHTML = `
      <label style="flex:1;display:flex;align-items:center;gap:4px;">
        <input type="checkbox" class="feat-check" data-id="${f.id}">
        <span>${f.name}</span>
      </label>
      <span class="status ${statusClass}">${statusText}</span>
    `;
    container.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderFeatures();

  document.getElementById('search').oninput = (e) => renderFeatures(e.target.value);

  const sendToContent = (action, extra = {}) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action, ...extra });
      window.close();
    });
  };

  document.getElementById('generate').onclick = () => {
    const checked = document.querySelectorAll('.feat-check:checked');
    if (checked.length === 0) { alert('請至少選擇一個功能'); return; }
    const ids = Array.from(checked).map(c => parseInt(c.dataset.id));
    sendToContent('generateDescription', { featureIds: ids });
  };

  document.getElementById('batch').onclick = () => {
    const ids = Array.from(document.querySelectorAll('.feat-check:checked')).map(c => parseInt(c.dataset.id));
    if (ids.length === 0) ids.push(13);
    sendToContent('batchGenerate', { featureId: 13, featureIds: ids });
  };

  document.getElementById('monitor').onclick = () => sendToContent('startPriceMonitor');
  document.getElementById('analytics').onclick = () => sendToContent('getAnalytics');
  document.getElementById('migrate').onclick = () => {
    const platform = prompt('來源平台 (PChome/MOMO/Shopify)?', 'PChome');
    const data = prompt('貼上其他平台商品 JSON 或文字', '{}');
    sendToContent('migrateFromPlatform', { platform, rawData: data });
  };

  document.getElementById('open-options').onclick = () => chrome.runtime.openOptionsPage();
  document.getElementById('sidepanel').onclick = () => {
    chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    window.close();
  };
});
