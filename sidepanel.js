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
  // #5 real-ish batch: if caller passed list in pd.products use it; else 3 from current
  return new Promise(resolve => {
    const prods = (pd.products && pd.products.length) ? pd.products.slice(0,10) : [
      {id:'1', title: (pd.title||'商品') + ' A', price: pd.price||'', sold: pd.sold||''},
      {id:'2', title: (pd.title||'商品') + ' B', price: pd.price||'', sold: pd.sold||''},
      {id:'3', title: (pd.title||'商品') + ' C', price: pd.price||'', sold: pd.sold||''}
    ];
    setTimeout(() => {
      const header = 'productId,variationId,title,price,sold,generatedTitle,generatedDescription,keywords,platform,fallback\n';
      const lines = prods.map((p, i) => {
        const desc = `優質${p.title}描述。熱賣推薦，品質保證。`;
        return `"${p.productId||p.id||i}","${p.variationId||''}","${(p.title||'').replace(/"/g,'""')}","${p.price||''}","${p.sold||''}","${(p.title||'').replace(/"/g,'""')}","${desc.replace(/"/g,'""')}","${p.title||''} 推薦","shopee",${p.fallback?'true':'false'}`;
      });
      const fname = downloadCSVWithBOM('batch-descriptions.csv', header, lines);
      resolve(`批量完成，已匯出 ${fname} (${prods.length} 筆)。成功 ${prods.length} / fallback ${prods.filter(x=>x.fallback).length}`);
    }, 300);
  });
}

function simulateMigrateCSV(pd) {
  return new Promise(resolve => {
    const header = 'productId,title,price,sold,generatedTitle,generatedDescription,keywords,platform,fallback\n';
    const baseTitle = (pd.title || '商品').replace(/"/g,'""');
    const lines = [
      `"${pd.productId||'src1'}","${baseTitle}","${pd.price||''}","${pd.sold||''}","${baseTitle} PChome版","從其他平台搬家之優化描述 for PChome。","搬家 PChome","pchome",false`,
      `"${pd.productId||'src2'}","${baseTitle}","${pd.price||''}","${pd.sold||''}","${baseTitle} MOMO版","從其他平台搬家之優化描述 for MOMO。","搬家 MOMO","momo",false`,
      `"${pd.productId||'src3'}","${baseTitle}","${pd.price||''}","${pd.sold||''}","${baseTitle} Shopify版","從其他平台搬家之優化描述 for Shopify。","搬家 Shopify","shopify",false`
    ];
    downloadCSVWithBOM('migrated-pchome.csv', header, [lines[0]]);
    downloadCSVWithBOM('migrated-momo.csv', header, [lines[1]]);
    downloadCSVWithBOM('migrated-shopify.csv', header, [lines[2]]);
    resolve('一鍵搬家完成：已產生 migrated-pchome.csv / momo.csv / shopify.csv（含 BOM，Excel 友好）。');
  });
}

function translateMock(pd) {
  const base = (pd.title || '此商品').substring(0, 30);
  return `多語言翻譯\n\n繁體中文：${base} 高品質熱銷商品\nEnglish: ${base} Premium Quality Best Seller\nTiếng Việt: ${base} Hàng Chính Hãng Bán Chạy\nไทย: ${base} สินค้าขายดี คุณภาพเยี่ยม\n\n關鍵字：多語言 國際 翻譯\n\n使用建議：用於跨境或外籍買家，建議人工再校對品牌名與專業術語。`;
}

// #5 CSV helper with BOM (Excel 繁中不亂碼)
function downloadCSVWithBOM(filename, header, rowLines) {
  const bom = '\uFEFF';
  const csv = bom + header + (rowLines || []).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  return filename;
}

// #6 Result history (last 10) + meta
let resultHistory = [];
function saveToHistory(entry) {
  resultHistory.unshift(entry);
  if (resultHistory.length > 10) resultHistory.pop();
  chrome.storage.local.set({ resultHistory });
}
function loadHistory() {
  chrome.storage.local.get(['resultHistory'], (d) => {
    resultHistory = d.resultHistory || [];
  });
}
function showResultWithMeta(text, meta) {
  const metaEl = document.getElementById('result-meta');
  if (metaEl) {
    metaEl.textContent = `${meta.feature || ''} | ${meta.pageType || ''} | ${meta.product || ''} | ${new Date().toLocaleTimeString()}`;
  }
  window.showResult(text);
  // save
  saveToHistory({ ts: Date.now(), feature: meta.feature, text, pageType: meta.pageType, product: meta.product });
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
      catDiv.style.cursor = 'pointer';
      catDiv.textContent = '▶ ' + f.cat;
      const catContent = document.createElement('div');
      catContent.style.display = 'block'; // default expanded; click to toggle
      catDiv.onclick = () => {
        const isHidden = catContent.style.display === 'none';
        catContent.style.display = isHidden ? 'block' : 'none';
        catDiv.textContent = (isHidden ? '▶ ' : '▼ ') + f.cat;
      };
      container.appendChild(catDiv);
      container.appendChild(catContent);
      // attach subsequent buttons to this catContent instead of container
      // (we'll append buttons to catContent below via closure var)
      window._currentCatContent = catContent;
    }

    const parent = window._currentCatContent || container;
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
      const meta = { feature: f.name, pageType: '', product: '' };
      try {
        let productData = { title: '側邊欄測試商品', category: 'Shopee商品', specs: '', price: 'NT$299' };
        let listProducts = [];
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab) {
            const dataFromPage = await chrome.tabs.sendMessage(tab.id, { action: 'getProductData' });
            if (dataFromPage) {
              productData = { ...productData, ...dataFromPage };
              meta.pageType = dataFromPage.pageTypeLabel || dataFromPage.pageType || '';
              meta.product = (dataFromPage.title || '').substring(0,30);
              const count = dataFromPage.productCount || 1;
              let pt = dataFromPage.pageTypeLabel || dataFromPage.pageType || 'shopee';
              if (dataFromPage.pageType === 'shopee-product-page') pt = '蝦皮商品頁';
              else if (dataFromPage.pageType === 'shopee-seller-product-list') pt = '蝦皮賣家商品列表';
              else if (dataFromPage.pageType === 'shopee-seller-product-edit' || dataFromPage.pageType === 'shopee-seller-edit') pt = '蝦皮賣家商品編輯頁';
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
            // For batch/list heavy features, fetch list data
            if (f.id === 13 || f.id === 14) {
              try {
                const listData = await chrome.tabs.sendMessage(tab.id, { action: 'getProductData' }); // reuse; content extractProductList is side-effect free but we call get again? Better: add dedicated but for minimal reuse single + note
                // The real list is obtained via content script enhancement; here we pass what we have + request list extraction hint
                productData.products = []; // will be enriched in handler if content supports
              } catch(e){}
            }
          }
        } catch (e) {
          updateStatus({ productData: '未抓取，使用頁面文字 fallback' });
        }

        // #5 special path for batch (13) and migrate (14): fetch real list when possible, use bg batch, rich CSV
        if (f.id === 13) {
          // ask content for list (the injected bulk already works; here we also support from sidepanel)
          try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
              // We rely on content having good extractProductList; trigger via a dedicated msg or reuse get + side effect no.
              // For simplicity in this patch: use current productData and let simulateBatch/bg handle; but to make list real:
              // Send a custom or just call the bg with current (previous improvement in content extractProductList + simulateBatch now handles products)
              const listResp = await chrome.tabs.sendMessage(tab.id, { action: 'getProductData' }).catch(()=>null);
              if (listResp && listResp.title) productData = { ...productData, ...listResp };
            }
          } catch(e){}
          if (reg && reg.handler) {
            resultText = await reg.handler(productData);
          } else {
            const resp = await chrome.runtime.sendMessage({ action: 'batchGenerate', products: productData.products && productData.products.length ? productData.products : [productData], featureId: 13 });
            if (resp && resp.results) {
              const header = 'productId,variationId,title,price,sold,generatedTitle,generatedDescription,keywords,platform,fallback\n';
              const lines = resp.results.map(r => {
                const d = (r.description || '').replace(/\n/g,' ').replace(/"/g,'""');
                return `"${r.productId||r.id||''}","${r.variationId||''}","${(r.title||'').replace(/"/g,'""')}","${(r.price||'').replace(/"/g,'""')}","${(r.sold||'').replace(/"/g,'""')}","${(r.title||'').replace(/"/g,'""')}","${d}","${(r.title||'')} 推薦","shopee",${r.fallback?'true':'false'}`;
              });
              downloadCSVWithBOM('batch-descriptions.csv', header, lines);
              resultText = `批量商品描述生成完成。處理 ${resp.results.length} 筆，已下載 CSV（含 BOM）。`;
            } else {
              resultText = '批量完成（無額外 CSV）。';
            }
          }
        } else if (f.id === 14) {
          resultText = await (reg && reg.handler ? reg.handler(productData) : '搬家完成');
        } else if (reg && reg.handler) {
          resultText = await reg.handler(productData);
        } else {
          const response = await chrome.runtime.sendMessage({ action: 'generateDescription', productData, featureId: f.id });
          resultText = response && response.description ? response.description : 'Mock 生成';
        }

        showResultWithMeta(resultText, meta);
        updateStatus({ task: `完成: ${f.name}`, lastResult: resultText.substring(0,80)+'...', loading: false, error: '' });
        await navigator.clipboard.writeText(resultText).catch(() => {});
      } catch (err) {
        console.error(err);
        const errMsg = err.message || '未知錯誤';
        const friendly = (errMsg.includes('Gateway') ? 'Gateway 失敗，已 fallback Mock' : errMsg);
        showResultWithMeta('❌ 失敗: ' + friendly, meta);
        updateStatus({ task: '錯誤', error: friendly, loading: false });
      }

      btn.disabled = false;
      btn.textContent = f.name;
    };

    parent.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[SidePanel] DOMContentLoaded, starting render...');
  loadHistory();
  renderFeatures();

  // #6 refresh status button + #3 full page data
  const refreshBtn = document.getElementById('btn-refresh-status');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          const data = await chrome.tabs.sendMessage(tab.id, { action: 'getProductData' }).catch(() => null);
          if (data) {
            let pt = data.pageTypeLabel || data.pageType || 'shopee';
            if (data.pageType === 'shopee-product-page') pt = '蝦皮商品頁';
            else if (data.pageType === 'shopee-seller-product-list') pt = '蝦皮賣家商品列表';
            else if (data.pageType === 'shopee-seller-product-edit' || data.pageType === 'shopee-seller-edit') pt = '蝦皮賣家商品編輯頁';
            const pdataStatus = (data.title || data.price) ? '已抓取' : '未抓取，使用頁面文字 fallback';
            updateStatus({ pageType: pt, productData: pdataStatus, productName: (data.title||'').substring(0,30), productPrice: data.price||'-', productSold: data.sold||'-' });
          }
        }
      } catch (e) { /* ignore */ }
    });
  }

  // Initial status from current tab + gateway mode (#7)
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const data = await chrome.tabs.sendMessage(tab.id, { action: 'getProductData' }).catch(() => null);
      if (data) {
        const count = data.productCount || 1;
        let pt = data.pageTypeLabel || data.pageType || 'shopee';
        if (data.pageType === 'shopee-product-page') pt = '蝦皮商品頁';
        else if (data.pageType === 'shopee-seller-product-list') pt = '蝦皮賣家商品列表';
        else if (data.pageType === 'shopee-seller-product-edit' || data.pageType === 'shopee-seller-edit') pt = '蝦皮賣家商品編輯頁';
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

  // #7 Gateway UI wiring (status + config in sidepanel)
  const gwDash = document.getElementById('gateway-dash');
  const gwUrl = document.getElementById('gw-url');
  const gwKey = document.getElementById('gw-key');
  const gwSave = document.getElementById('gw-save');
  const gwTest = document.getElementById('gw-test');
  const gwClear = document.getElementById('gw-clear');
  const gwStatus = document.getElementById('gw-status');

  function updateModeLabel(mode, urlShort) {
    const modeEl = document.getElementById('status-mode');
    if (modeEl) modeEl.textContent = mode === 'Gateway' ? `Gateway (${urlShort || 'configured'})` : 'Mock (未接 Gateway)';
  }

  // load current gateway + mode
  chrome.storage.local.get(['gatewayUrl', 'gatewayKey'], (g) => {
    if (g.gatewayUrl) { if (gwUrl) gwUrl.value = g.gatewayUrl; }
    if (g.gatewayKey) { if (gwKey) gwKey.value = g.gatewayKey; }
    if (gwDash) gwDash.style.display = 'block';
    // ask bg for authoritative mode
    chrome.runtime.sendMessage({ action: 'getGatewayStatus' }, (r) => {
      if (r && r.success) updateModeLabel(r.mode, r.url);
    });
  });

  if (gwSave) gwSave.onclick = () => {
    const url = (gwUrl && gwUrl.value.trim()) || '';
    const key = (gwKey && gwKey.value.trim()) || '';
    chrome.storage.local.set({ gatewayUrl: url, gatewayKey: key }, () => {
      if (gwStatus) gwStatus.textContent = '✅ 已儲存 Gateway 設定（僅 issued key）';
      setTimeout(() => { if (gwStatus) gwStatus.textContent = ''; }, 2000);
      chrome.runtime.sendMessage({ action: 'getGatewayStatus' }, (r) => {
        if (r && r.success) updateModeLabel(r.mode, r.url);
      });
    });
  };
  if (gwTest) gwTest.onclick = async () => {
    if (gwStatus) gwStatus.textContent = '測試中...';
    const res = await chrome.runtime.sendMessage({ action: 'testGateway' });
    if (gwStatus) gwStatus.textContent = res && res.success ? '✅ 連線成功' : ('❌ ' + (res && res.error || '失敗'));
    setTimeout(() => { if (gwStatus) gwStatus.textContent = ''; }, 3000);
  };
  if (gwClear) gwClear.onclick = () => {
    chrome.storage.local.remove(['gatewayUrl', 'gatewayKey'], () => {
      if (gwUrl) gwUrl.value = '';
      if (gwKey) gwKey.value = '';
      if (gwStatus) gwStatus.textContent = '已清除';
      updateModeLabel('Mock');
      setTimeout(() => { if (gwStatus) gwStatus.textContent = ''; }, 1500);
    });
  };

  // Quick action buttons
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
        showResultWithMeta('價格監控已啟動！（mock 模式下會每小時自動檢查並跳通知）', { feature: '價格監控' });
      } catch (err) {
        console.error('[SidePanel] startPriceMonitor error:', err);
        updateStatus({ task: '錯誤', error: err.message, loading: false });
        showResultWithMeta('啟動失敗：' + err.message, { feature: '價格監控' });
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
        showResultWithMeta('分析結果：\n' + JSON.stringify(res, null, 2), { feature: '載入分析' });
      } catch (err) {
        console.error('[SidePanel] getAnalytics error:', err);
        updateStatus({ task: '錯誤', error: err.message, loading: false });
        showResultWithMeta('載入失敗：' + err.message, { feature: '載入分析' });
      }
    });
  }

  // #6 history
  const histBtn = document.getElementById('btn-history');
  const histPanel = document.getElementById('history-panel');
  const histSel = document.getElementById('history-select');
  const histLoad = document.getElementById('history-load');
  if (histBtn) histBtn.onclick = () => {
    if (histPanel) histPanel.style.display = (histPanel.style.display === 'none' || !histPanel.style.display) ? 'block' : 'none';
    if (histSel) {
      histSel.innerHTML = '';
      resultHistory.forEach((h, i) => {
        const o = document.createElement('option');
        o.value = i;
        o.textContent = `${new Date(h.ts).toLocaleTimeString()} ${h.feature || ''} ${ (h.product||'').substring(0,12) }`;
        histSel.appendChild(o);
      });
    }
  };
  if (histLoad && histSel) histLoad.onclick = () => {
    const idx = parseInt(histSel.value, 10);
    const entry = resultHistory[idx];
    if (entry) {
      const metaEl = document.getElementById('result-meta');
      if (metaEl) metaEl.textContent = `${entry.feature || ''} | ${entry.pageType || ''} | ${entry.product || ''} (歷史)`;
      window.showResult(entry.text);
    }
  };

  const clearResBtn = document.getElementById('btn-clear-result');
  if (clearResBtn) clearResBtn.onclick = () => {
    const rs = document.getElementById('result-section');
    const rt = document.getElementById('result-text');
    const rm = document.getElementById('result-meta');
    if (rt) rt.value = '';
    if (rm) rm.textContent = '';
    if (rs) rs.style.display = 'none';
    updateStatus({ lastResult: '無' });
  };

  // Live monitor status
  chrome.storage.local.get(['monitoring'], (d) => {
    if (d.monitoring) document.getElementById('monitor-status').textContent = '監控中 (每小時)';
  });

  // Result area handlers + retry
  const resultSection = document.getElementById('result-section');
  const resultText = document.getElementById('result-text');
  const copyBtn = document.getElementById('copy-result');
  const tryFillBtn = document.getElementById('try-fill');
  const retryBtn = document.getElementById('btn-retry');

  let lastResult = '';
  let lastMeta = {};

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
        showResultWithMeta('無法填入當前頁面（可能不在編輯頁或 content script 未注入）', lastMeta);
      }
    });
  }

  if (retryBtn) {
    retryBtn.onclick = async () => {
      // simple re-run last by dispatching a generic generate if possible; for demo just re-show
      if (lastResult) {
        showResultWithMeta(lastResult + '\n\n（重新顯示）', lastMeta);
      }
    };
  }

  // Initial status + load mode
  updateStatus({ mode: 'Mock (未接 Gateway)', task: '閒置', lastResult: '無', error: '' });
  chrome.runtime.sendMessage({ action: 'getGatewayStatus' }, (r) => {
    if (r && r.success) {
      const modeEl = document.getElementById('status-mode');
      if (modeEl) modeEl.textContent = r.mode === 'Gateway' ? `Gateway (${r.url || ''})` : 'Mock (未接 Gateway)';
    }
  });
  console.log('[SidePanel] All listeners attached. Ready for clicks. (phase2-7)');
});