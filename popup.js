// popup.js - 30功能選擇器 (根據完整規格)

const FEATURES = [
  // 內容生成類 (已實作部分)
  { id: 1, cat: "內容生成類", name: "多模板選擇 (描述/廣告/規格/SEO/促銷/評價/利潤)", status: "done" },
  { id: 2, cat: "內容生成類", name: "廣告文案一鍵生成", status: "todo" },
  { id: 4, cat: "內容生成類", name: "SEO 標題 + 關鍵字優化", status: "done" },
  { id: 5, cat: "內容生成類", name: "多語言翻譯（中英越泰）", status: "todo" },
  { id: 6, cat: "內容生成類", name: "限時優惠 / 促銷文案", status: "todo" },
  { id: 7, cat: "內容生成類", name: "評價回覆自動生成", status: "todo" },

  // 定價與競爭
  { id: 8, cat: "定價與競爭", name: "同類商品價格監控", status: "todo" },
  { id: 9, cat: "定價與競爭", name: "AI 建議售價", status: "todo" },
  { id: 10, cat: "定價與競爭", name: "降價 / 調價提醒", status: "todo" },
  { id: 11, cat: "定價與競爭", name: "利潤計算器", status: "done" },
  { id: 12, cat: "定價與競爭", name: "競品分析報告", status: "todo" },

  // 自動化
  { id: 13, cat: "自動化", name: "批量商品描述生成", status: "todo" },
  { id: 14, cat: "自動化", name: "一鍵搬家工具（PChome / MOMO / Shopify）", status: "todo" },
  { id: 15, cat: "自動化", name: "圖片 Alt Text 自動生成", status: "todo" },
  { id: 16, cat: "自動化", name: "商品圖片優化建議", status: "todo" },
  { id: 17, cat: "自動化", name: "右鍵快速生成", status: "todo" },

  // 數據分析
  { id: 18, cat: "數據分析", name: "銷售數據 AI 洞察", status: "todo" },
  { id: 19, cat: "數據分析", name: "熱門關鍵字追蹤", status: "todo" },
  { id: 20, cat: "數據分析", name: "退貨 / 客訴分析", status: "todo" },
  { id: 21, cat: "數據分析", name: "活動檔期建議", status: "todo" },

  // 顧客與訂單
  { id: 22, cat: "顧客與訂單", name: "買家評價風險預警", status: "todo" },
  { id: 23, cat: "顧客與訂單", name: "客服回覆模板庫", status: "todo" },
  { id: 24, cat: "顧客與訂單", name: "訂單優先處理建議", status: "todo" },
  { id: 25, cat: "顧客與訂單", name: "自動發送追蹤訊息", status: "todo" },

  // 進階與變現
  { id: 26, cat: "進階與變現", name: "Prompt 模板自訂", status: "todo" },
  { id: 27, cat: "進階與變現", name: "團隊共享模板", status: "todo" },
  { id: 28, cat: "進階與變現", name: "使用量統計儀表板", status: "todo" },
  { id: 29, cat: "進階與變現", name: "Pro 會員功能鎖定", status: "todo" },
  { id: 30, cat: "進階與變現", name: "多平台同步", status: "todo" }
];

function renderFeatures() {
  const container = document.getElementById('features');
  let currentCat = '';

  FEATURES.forEach(f => {
    if (f.cat !== currentCat) {
      currentCat = f.cat;
      const catDiv = document.createElement('div');
      catDiv.className = 'category';
      catDiv.textContent = currentCat;
      container.appendChild(catDiv);
    }

    const div = document.createElement('div');
    div.className = 'feature';
    
    const statusClass = f.status === 'done' ? 'done' : 'todo';
    const statusText = f.status === 'done' ? '✓ 已實作' : '待開發';

    div.innerHTML = `
      <label style="flex:1; display:flex; align-items:center; gap:6px;">
        <input type="radio" name="feature" value="${f.id}">
        <span>${f.name}</span>
      </label>
      <span class="status ${statusClass}">${statusText}</span>
    `;
    container.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderFeatures();

  document.getElementById('generate').onclick = () => {
    const selected = document.querySelector('input[name="feature"]:checked');
    if (!selected) {
      alert('請選擇一個功能');
      return;
    }
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'generateDescription',
          featureId: parseInt(selected.value)
        });
      }
      window.close();
    });
  };

  document.getElementById('open-options').onclick = () => {
    chrome.runtime.openOptionsPage();
  };
});
