// sidepanel.js - Advanced full dashboard for all 30 features (functional version)

const FEATURE_REGISTRY = {
  1: { id:1, cat:"內容生成類", name:"多模板選擇 (描述/廣告/規格/SEO/促銷/評價/利潤)", handler: (pd) => generateWithPrompt(1, pd), requiresEdit: false },
  2: { id:2, cat:"內容生成類", name:"廣告文案一鍵生成", handler: (pd) => generateWithPrompt(2, pd), requiresEdit: false },
  4: { id:4, cat:"內容生成類", name:"SEO 標題 + 關鍵字優化", handler: (pd) => generateWithPrompt(4, pd), requiresEdit: false },
  5: { id:5, cat:"內容生成類", name:"多語言翻譯（中英越泰）", handler: (pd) => translateMock(pd), requiresEdit: false },
  6: { id:6, cat:"內容生成類", name:"限時優惠 / 促銷文案", handler: (pd) => generateWithPrompt(6, pd), requiresEdit: false },
  7: { id:7, cat:"內容生成類", name:"評價回覆自動生成", handler: (pd) => generateWithPrompt(7, pd), requiresEdit: false },
  8: { id:8, cat:"定價與競爭", name:"同類商品價格監控", handler: (pd) => simulatePriceMonitor(pd), requiresEdit: true },
  9: { id:9, cat:"定價與競爭", name:"AI 建議售價", handler: (pd) => simulatePriceSuggestion(pd), requiresEdit: false },
  10: { id:10, cat:"定價與競爭", name:"降價 / 調價提醒", handler: (pd) => generateWithPrompt(10, pd), requiresEdit: true },
  11: { id:11, cat:"定價與競爭", name:"利潤計算器", handler: (pd) => simulateProfitCalc(pd), requiresEdit: false },
  12: { id:12, cat:"定價與競爭", name:"競品分析報告", handler: (pd) => simulateCompetitorReport(pd), requiresEdit: false },
  13: { id:13, cat:"自動化", name:"批量商品描述生成", handler: (pd) => simulateBatch(pd), requiresEdit: true },
  14: { id:14, cat:"自動化", name:"一鍵搬家工具（PChome / MOMO / Shopify）", handler: (pd) => simulateMigrateCSV(pd), requiresEdit: false },
  // ... other 15-30 can use generateWithPrompt or specific
};

function generateWithPrompt(fid, pd) {
  // Use background for consistency, but post-process for MVP "real" feel
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ action: 'generateDescription', productData: pd, featureId: fid }, (res) => {
      resolve(res && res.description ? res.description : 'Mock: ' + (pd.title || '商品') );
    });
  });
}

function simulatePriceMonitor(pd) {
  return new Promise(resolve => {
    const prices = [299, 349, 279];
    const suggestion = `建議: 降價至 ${Math.min(...prices)-10} 以競爭。`;
    chrome.storage.local.set({ lastPrices: prices, lastMonitor: Date.now() });
    resolve(`價格監控報告 for ${pd.title}:\n競品價格: ${prices.join(', ')}\n${suggestion}`);
  });
}

function simulatePriceSuggestion(pd) {
  const basePrice = parseInt((pd.price || '300').replace(/\D/g, '')) || 300;
  const s1 = basePrice;
  const s2 = Math.round(basePrice * 1.15);
  const s3 = Math.round(basePrice * 1.35);
  const title = (pd.title || '此商品').substring(0, 30);
  return `AI 建議售價\n\n建議售價 1（保守）：NT$${s1}（低風險，適合新品測試）\n建議售價 2（平衡）：NT$${s2}（市場主流，利潤與量兼顧）\n建議售價 3（激進）：NT$${s3}（高端定位，強調獨特性）\n\n關鍵字：定價 利潤 競爭\n\n使用建議：參考競品後選擇平衡方案，監控銷量 3 天再微調。`;
}

function simulateProfitCalc(pd) {
  const sell = parseInt((pd.price || '300').replace(/\D/g, '')) || 300;
  const cost = 180, ship = 30, fee = Math.round(sell * 0.06);
  const profit = sell - cost - ship - fee;
  const roi = cost > 0 ? ((profit / cost) * 100).toFixed(0) : '0';
  const title = (pd.title || '此商品').substring(0, 30);
  const suggest = Math.round(sell * 1.25);
  return `利潤計算器\n\n商品：${title}\n售價：NT$${sell}\n成本：NT$${cost}（預估）\n運費：NT$${ship}\n平台手續費：約 NT$${fee}\n預估利潤：NT$${profit}\nROI：約 ${roi}%\n\n建議：若想達到 50% ROI，可將售價調整至 NT$${suggest} 或降低包材成本。\n\n使用建議：實際成本請填入真實數字，運費依宅配或超商調整。`;
}

function simulateCompetitorReport(pd) {
  return `競品報告 for ${pd.title}: 你的價格有優勢，但規格較弱。建議強調...`;
}

function simulateBatch(pd) {
  return new Promise(resolve => {
    // Simulate batch for 3 items
    const items = [
      {id:1, title: pd.title + ' A', description: 'Mock desc A'},
      {id:2, title: pd.title + ' B', description: 'Mock desc B'},
      {id:3, title: pd.title + ' C', description: 'Mock desc C'}
    ];
    // Trigger CSV export
    setTimeout(() => {
      const csv = 'id,title,description\n' + items.map(i => `${i.id},"${i.title}","${i.description}"`).join('\n');
      const blob = new Blob([csv], {type:'text/csv'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'batch-descriptions.csv';
      a.click();
      resolve('批量完成，已匯出 CSV (3 筆 mock)。檢查下載資料夾。');
    }, 300);
  });
}

function simulateMigrateCSV(pd) {
  return new Promise(resolve => {
    const csv = `title,description\n"${pd.title}","Migrated mock desc from other platform"`;
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'migrated.csv'; a.click();
    resolve('一鍵搬家 CSV 已匯出。');
  });
}

function translateMock(pd) {
  const base = (pd.title || '此商品').substring(0, 30);
  return `多語言翻譯\n\n繁體中文：${base} 高品質熱銷商品\nEnglish: ${base} Premium Quality Best Seller\nTiếng Việt: ${base} Hàng Chính Hãng Bán Chạy\nไทย: ${base} สินค้าขายดี คุณภาพเยี่ยม\n\n關鍵字：多語言 國際 翻譯\n\n使用建議：用於跨境或外籍買家，建議人工再校對品牌名與專業術語。`;
}

function updateStatus(updates) {
  const pageTypeEl = document.getElementById('status-page-type');
  const dataEl = document.getElementById('status-product-data');
  const nameEl = document.getElementById('status-product-name');
  const priceEl = document.getElementById('status-product-price');
  const soldEl = document.getElementById('status-product-sold');
  const modeEl = document.getElementById('status-mode');
  const taskEl = document.getElementById('status-task');
  const lastEl = document.getElementById('status-last-result');
  const errEl = document.getElementById('status-error');

  if (updates.pageType && pageTypeEl) pageTypeEl.textContent = updates.pageType;
  if (updates.productData && dataEl) dataEl.textContent = updates.productData;
  if (updates.productName !== undefined && nameEl) nameEl.textContent = updates.productName || '-';
  if (updates.productPrice !== undefined && priceEl) priceEl.textContent = updates.productPrice || '-';
  if (updates.productSold !== undefined && soldEl) soldEl.textContent = updates.productSold || '-';
  if (updates.mode && modeEl) modeEl.textContent = updates.mode;
  if (updates.task && taskEl) taskEl.textContent = updates.task;
  if (updates.lastResult && lastEl) lastEl.textContent = updates.lastResult;
  if (updates.error !== undefined && errEl) errEl.textContent = updates.error || '無';
  if (updates.loading) {
    if (taskEl) taskEl.textContent += ' (載入中...)';
  }
}

function renderFeatures() {
  const container = document.getElementById('all-features');
  if (!container) {
    console.error('[SidePanel] #all-features not found!');
    return;
  }
  container.innerHTML = '';
  let currentCat = '';

  // full list to ensure 30 buttons render (minimal to fix no buttons)
  const fullFeatures = [
    { id: 1, cat: "內容生成類", name: "多模板選擇 (描述/廣告/規格/SEO/促銷/評價/利潤)" },
    { id: 2, cat: "內容生成類", name: "廣告文案一鍵生成" },
    { id: 4, cat: "內容生成類", name: "SEO 標題 + 關鍵字優化" },
    { id: 5, cat: "內容生成類", name: "多語言翻譯（中英越泰）" },
    { id: 6, cat: "內容生成類", name: "限時優惠 / 促銷文案" },
    { id: 7, cat: "內容生成類", name: "評價回覆自動生成" },
    { id: 8, cat: "定價與競爭", name: "同類商品價格監控" },
    { id: 9, cat: "定價與競爭", name: "AI 建議售價" },
    { id: 10, cat: "定價與競爭", name: "降價 / 調價提醒" },
    { id: 11, cat: "定價與競爭", name: "利潤計算器" },
    { id: 12, cat: "定價與競爭", name: "競品分析報告" },
    { id: 13, cat: "自動化", name: "批量商品描述生成" },
    { id: 14, cat: "自動化", name: "一鍵搬家工具（PChome / MOMO / Shopify）" },
    { id: 15, cat: "自動化", name: "圖片 Alt Text 自動生成" },
    { id: 16, cat: "自動化", name: "商品圖片優化建議" },
    { id: 17, cat: "自動化", name: "右鍵快速生成" },
    { id: 18, cat: "數據分析", name: "銷售數據 AI 洞察" },
    { id: 19, cat: "數據分析", name: "熱門關鍵字追蹤" },
    { id: 20, cat: "數據分析", name: "退貨 / 客訴分析" },
    { id: 21, cat: "數據分析", name: "活動檔期建議" },
    { id: 22, cat: "顧客與訂單", name: "買家評價風險預警" },
    { id: 23, cat: "顧客與訂單", name: "客服回覆模板庫" },
    { id: 24, cat: "顧客與訂單", name: "訂單優先處理建議" },
    { id: 25, cat: "顧客與訂單", name: "自動發送追蹤訊息" },
    { id: 26, cat: "進階與變現", name: "Prompt 模板自訂" },
    { id: 27, cat: "進階與變現", name: "團隊共享模板" },
    { id: 28, cat: "進階與變現", name: "使用量統計儀表板" },
    { id: 29, cat: "進階與變現", name: "Pro 會員功能鎖定" },
    { id: 30, cat: "進階與變現", name: "多平台同步" }
  ];

  fullFeatures.forEach(f => {
    if (f.cat !== currentCat) {
      currentCat = f.cat;
      const catDiv = document.createElement('div');
      catDiv.style.fontWeight = 'bold';
      catDiv.style.marginTop = '8px';
      catDiv.textContent = f.cat;
      container.appendChild(catDiv);
    }

    const btn = document.createElement('button');
    btn.textContent = f.name;
    btn.style.margin = '2px';
    btn.style.fontSize = '11px';
    btn.onclick = async () => {
      console.log('[SidePanel] Clicked feature button:', f.id, f.name);
      updateStatus({ task: `執行中: ${f.name}`, loading: true });
      btn.disabled = true;
      btn.textContent = '執行中...';

      const reg = FEATURE_REGISTRY[f.id];
      let resultText = '';
      try {
        let productData = { title: '側邊欄測試商品', category: 'Shopee商品', specs: '', price: 'NT$299' };
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab) {
            const dataFromPage = await chrome.tabs.sendMessage(tab.id, { action: 'getProductData' });
            if (dataFromPage) {
              productData = { ...productData, ...dataFromPage };
              const count = dataFromPage.productCount || 1;
              let pt = dataFromPage.pageTypeLabel || dataFromPage.pageType || 'shopee';
              if (dataFromPage.pageType === 'shopee-product-page') pt = '蝦皮商品頁';
              else if (dataFromPage.pageType === 'shopee-seller-product-list') pt = '蝦皮賣家商品列表';
              else if (dataFromPage.pageType === 'shopee-seller-edit') pt = '蝦皮賣家編輯頁';
              let pdataStatus = (dataFromPage.title || dataFromPage.price) ? '已抓取' : '未抓取，使用頁面文字 fallback';
              updateStatus({ pageType: pt, productData: pdataStatus });
              if (dataFromPage.pageType === 'shopee-product-page' || dataFromPage.title) {
                updateStatus({
                  productName: (dataFromPage.title || '').substring(0, 30),
                  productPrice: dataFromPage.price || '-',
                  productSold: dataFromPage.sold || '-'
                });
              }
            }
          }
        } catch (e) {
          updateStatus({ productData: '未抓取，使用頁面文字 fallback' });
        }

        if (reg && reg.handler) {
          resultText = await reg.handler(productData);
        } else {
          const response = await chrome.runtime.sendMessage({ action: 'generateDescription', productData, featureId: f.id });
          resultText = response && response.description ? response.description : 'Mock 生成';
        }

        showResult(resultText);
        updateStatus({ task: `完成: ${f.name}`, lastResult: resultText.substring(0,80)+'...', loading: false, error: '' });
        await navigator.clipboard.writeText(resultText).catch(() => {});
      } catch (err) {
        console.error(err);
        const errMsg = err.message || '未知錯誤';
        showResult('❌ 失敗: ' + errMsg);
        updateStatus({ task: '錯誤', error: errMsg, loading: false });
      }

      btn.disabled = false;
      btn.textContent = f.name;
    };

    container.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[SidePanel] DOMContentLoaded, starting render...');
  renderFeatures();

  // Initial status from current tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const data = await chrome.tabs.sendMessage(tab.id, { action: 'getProductData' }).catch(() => null);
      if (data) {
        const count = data.productCount || 1;
        let pt = data.pageTypeLabel || data.pageType || 'shopee';
        if (data.pageType === 'shopee-product-page') pt = '蝦皮商品頁';
        else if (data.pageType === 'shopee-seller-product-list') pt = '蝦皮賣家商品列表';
        else if (data.pageType === 'shopee-seller-edit') pt = '蝦皮賣家編輯頁';
        let pdataStatus = (data.title || data.price) ? '已抓取' : '未抓取，使用頁面文字 fallback';
        updateStatus({ pageType: pt, productData: pdataStatus });
        if (data.pageType === 'shopee-product-page' || data.title) {
          updateStatus({
            productName: (data.title || '').substring(0, 30),
            productPrice: data.price || '-',
            productSold: data.sold || '-'
          });
        }
      } else {
        updateStatus({ pageType: '非支援頁面 (請切換到蝦皮賣家商品編輯頁)', productData: '未抓取，使用頁面文字 fallback' });
      }
    }
  } catch (e) {
    updateStatus({ pageType: '無法取得 (檢查 content script)', productData: '未抓取，使用頁面文字 fallback' });
  }

  // Quick action buttons - with debug
  const monitorBtn = document.getElementById('btn-monitor');
  if (monitorBtn) {
    monitorBtn.addEventListener('click', async () => {
      console.log('[SidePanel] Clicked 啟動價格監控');
      updateStatus({ task: '啟動價格監控', loading: true });
      try {
        const response = await chrome.runtime.sendMessage({ action: 'startPriceMonitor' });
        console.log('[SidePanel] startPriceMonitor response:', response);
        const statusEl = document.getElementById('monitor-status');
        if (statusEl) statusEl.textContent = '監控中 (每小時) - 請查看通知';
        updateStatus({ task: '價格監控已啟動', lastResult: '模擬: 每小時檢查', loading: false });
        showResult('價格監控已啟動！（mock 模式下會每小時自動檢查並跳通知）');
      } catch (err) {
        console.error('[SidePanel] startPriceMonitor error:', err);
        updateStatus({ task: '錯誤', error: err.message, loading: false });
        showResult('啟動失敗：' + err.message);
      }
    });
  }

  const analyticsBtn = document.getElementById('btn-analytics');
  if (analyticsBtn) {
    analyticsBtn.addEventListener('click', async () => {
      console.log('[SidePanel] Clicked 載入分析');
      updateStatus({ task: '載入分析', loading: true });
      try {
        const res = await chrome.runtime.sendMessage({ action: 'getAnalytics' });
        console.log('[SidePanel] getAnalytics response:', res);
        updateStatus({ task: '分析完成', lastResult: '見結果區', loading: false });
        showResult('分析結果：\n' + JSON.stringify(res, null, 2));
      } catch (err) {
        console.error('[SidePanel] getAnalytics error:', err);
        updateStatus({ task: '錯誤', error: err.message, loading: false });
        showResult('載入失敗：' + err.message);
      }
    });
  }

  // Live monitor status
  chrome.storage.local.get(['monitoring'], (d) => {
    if (d.monitoring) document.getElementById('monitor-status').textContent = '監控中 (每小時)';
  });

  // Result area handlers
  const resultSection = document.getElementById('result-section');
  const resultText = document.getElementById('result-text');
  const copyBtn = document.getElementById('copy-result');
  const tryFillBtn = document.getElementById('try-fill');

  let lastResult = '';

  window.showResult = function(text) {
    lastResult = text;
    if (resultSection) resultSection.style.display = 'block';
    if (resultText) resultText.value = text;
  };

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (lastResult) {
        await navigator.clipboard.writeText(lastResult);
        copyBtn.textContent = '已複製！';
        setTimeout(() => copyBtn.textContent = '複製結果', 1500);
      }
    });
  }

  if (tryFillBtn) {
    tryFillBtn.addEventListener('click', async () => {
      if (!lastResult) return;
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.tabs.sendMessage(tab.id, { action: 'fillDescription', description: lastResult });
        tryFillBtn.textContent = '已嘗試填入！';
        setTimeout(() => tryFillBtn.textContent = '嘗試填入當前頁面', 1500);
      } catch (e) {
        alert('無法填入當前頁面（可能不在編輯頁或 content script 未注入）');
      }
    });
  }

  // Initial status
  updateStatus({ mode: 'Mock (未接真實 AI)', task: '閒置', lastResult: '無', error: '' });
  console.log('[SidePanel] All listeners attached. Ready for clicks.');
});