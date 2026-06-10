// sidepanel.js - Advanced full dashboard for all 30 features (functional version)

const FEATURE_REGISTRY = {
  1: { id:1, cat:"內容生成類", name:"多模板選擇 (描述/廣告/規格/SEO/促銷/評價/利潤)", handler: (pd) => generateWithPrompt(1, pd), requiresEdit: false, plan: 'free' },
  2: { id:2, cat:"內容生成類", name:"廣告文案一鍵生成", handler: (pd) => generateWithPrompt(2, pd), requiresEdit: false, plan: 'free' },
  4: { id:4, cat:"內容生成類", name:"SEO 標題 + 關鍵字優化", handler: (pd) => generateWithPrompt(4, pd), requiresEdit: false, plan: 'free' },
  5: { id:5, cat:"內容生成類", name:"多語言翻譯（中英越泰）", handler: (pd) => translateMock(pd), requiresEdit: false, plan: 'free' },
  6: { id:6, cat:"內容生成類", name:"限時優惠 / 促銷文案", handler: (pd) => generateWithPrompt(6, pd), requiresEdit: false, plan: 'free' },
  7: { id:7, cat:"內容生成類", name:"評價回覆自動生成", handler: (pd) => generateWithPrompt(7, pd), requiresEdit: false, plan: 'free' },
  8: { id:8, cat:"定價與競爭", name:"同類商品價格監控", handler: (pd) => simulatePriceMonitor(pd), requiresEdit: true, plan: 'free' },
  9: { id:9, cat:"定價與競爭", name:"AI 建議售價", handler: (pd) => simulatePriceSuggestion(pd), requiresEdit: false, plan: 'free' },
  10: { id:10, cat:"定價與競爭", name:"降價 / 調價提醒", handler: (pd) => generateWithPrompt(10, pd), requiresEdit: true, plan: 'free' },
  11: { id:11, cat:"定價與競爭", name:"利潤計算器", handler: (pd) => simulateProfitCalc(pd), requiresEdit: false, plan: 'free' },
  12: { id:12, cat:"定價與競爭", name:"競品分析報告", handler: (pd) => simulateCompetitorReport(pd), requiresEdit: false, plan: 'free' },
  13: { id:13, cat:"自動化", name:"批量商品描述生成", handler: (pd) => simulateBatch(pd), requiresEdit: true, plan: 'pro' }, // bulk large export as pro per spec
  14: { id:14, cat:"自動化", name:"一鍵搬家工具（PChome / MOMO / Shopify）", handler: (pd) => simulateMigrateCSV(pd), requiresEdit: false, plan: 'free' },
  // ... other 15-30 can use generateWithPrompt or specific
};

function generateWithPrompt(fid, pd, template) {
  // Use background for consistency, but post-process for MVP "real" feel
  return new Promise(resolve => {
    const msg = { action: 'generateDescription', productData: pd, featureId: fid };
    if (template) msg.template = template;
    chrome.runtime.sendMessage(msg, (res) => {
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
let currentEntitlement = 'free';

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

function loadEntitlement() {
  chrome.storage.local.get(['entitlement'], (d) => {
    currentEntitlement = d.entitlement || 'free';
    console.log('[SidePanel] Entitlement loaded:', currentEntitlement);
    // optionally update a status display
  });
}

function isProAllowed() {
  return ['pro-trial', 'pro-active', 'admin'].includes(currentEntitlement);
}

// Phase 12 Template Library
let currentTemplates = [];

const DEFAULT_TEMPLATES = [
  { templateId: 'def-1', name: '標準商品描述', category: '商品描述', featureId: 1, language: '繁中', tone: '專業', promptBody: '你是 Shopee 頂級文案專家。根據以下商品資訊，生成吸引人的產品描述，強調賣點、情感連結和購買 urgency。使用繁體中文，約150-250字。商品資訊: {title} {category} {specs} {price}', outputFormat: '純文字 150-250字', variables: ['title','category','specs','price'], isDefault: true, isPro: false, updatedAt: Date.now() },
  { templateId: 'def-2', name: '強力廣告文案', category: '廣告文案', featureId: 2, language: '繁中', tone: '激勵', promptBody: '生成一段強力廣告文案，用於 Shopee 首頁或 FB 廣告。強調獨特賣點、限時優惠、社會證明。激勵立即購買。繁體中文，100-180字。商品: {title} {category} {specs}', outputFormat: '純文字 100-180字', variables: ['title','category','specs'], isDefault: true, isPro: false, updatedAt: Date.now() },
  { templateId: 'def-4', name: 'SEO 標題優化', category: 'SEO 標題', featureId: 4, language: '繁中', tone: '搜尋友好', promptBody: '優化 SEO 標題和描述。提供 5 個不同長度的 SEO 標題 (主標題 + 副標題)，融入高搜尋量關鍵字。然後生成 200字 SEO 優化描述。目標關鍵字: {keywords} 商品: {title} {category}', outputFormat: '標題列表 + 描述', variables: ['title','category','keywords'], isDefault: true, isPro: false, updatedAt: Date.now() },
  { templateId: 'def-6', name: '限時促銷文案', category: '促銷文案', featureId: 6, language: '繁中', tone: ' urgency', promptBody: '為限時促銷活動撰寫文案。強調折扣百分比、贈品、倒數計時 urgency。適合 Shopee 活動頁。繁體中文，120-200字。商品: {title} {original_price} {discount} {end_date}', outputFormat: '純文字 120-200字', variables: ['title','original_price','discount','end_date'], isDefault: true, isPro: false, updatedAt: Date.now() },
  { templateId: 'def-7', name: '評價回覆模板', category: '評價回覆', featureId: 7, language: '繁中', tone: '親切', promptBody: '根據買家評價，自動生成 5 種不同風格的賣家回覆 (感謝、解決問題、邀請再購)。使用繁體中文，自然親切。評價: {review_text} 商品: {title}', outputFormat: '5 種回覆', variables: ['title','review_text'], isDefault: true, isPro: false, updatedAt: Date.now() },
  { templateId: 'def-5', name: '多語言翻譯', category: '多語翻譯', featureId: 5, language: '多語', tone: '自然', promptBody: '將以下商品描述翻譯成英文、越南文、泰文。保持自然銷售語氣和文化適應。原文: {description} 商品: {title}', outputFormat: '多語對照', variables: ['title','description'], isDefault: true, isPro: false, updatedAt: Date.now() },
  { templateId: 'def-12', name: '競品分析', category: '競品分析', featureId: 12, language: '繁中', tone: '分析', promptBody: '生成競品分析報告。比較我的商品與 3 個主要競品在價格、規格、評價、賣點上的差異。提供優勢/劣勢和改進建議。商品: {title} {specs} 競品: {competitors_data}', outputFormat: '報告格式', variables: ['title','specs','competitors_data'], isDefault: true, isPro: false, updatedAt: Date.now() },
  { templateId: 'def-14', name: '搬家 CSV 轉換', category: '搬家 CSV', featureId: 14, language: '繁中', tone: '結構化', promptBody: '一鍵搬家工具。將 PChome/MOMO/Shopey 商品資料轉換為 Shopee 格式描述 + 標題 + 規格。來源平台: {source_platform} 原始資料: {raw_data}', outputFormat: '結構化文字', variables: ['source_platform','raw_data'], isDefault: true, isPro: false, updatedAt: Date.now() }
];

async function loadTemplates() {
  const data = await new Promise(r => chrome.storage.local.get(['customTemplates'], d => r(d || {})));
  let tpls = data.customTemplates || [];
  if (tpls.length === 0) {
    tpls = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES)); // deep copy
    await saveTemplates(tpls);
  }
  currentTemplates = tpls;
  return tpls;
}

async function saveTemplates(tpls) {
  await new Promise(r => chrome.storage.local.set({customTemplates: tpls}, r));
  currentTemplates = tpls;
}

function renderTemplateSelect() {
  const sel = document.getElementById('template-select');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- 使用預設 Prompt --</option>';
  currentTemplates.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.templateId;
    opt.textContent = `${t.name} (F${t.featureId})`;
    sel.appendChild(opt);
  });
}

function getSelectedTemplate() {
  const sel = document.getElementById('template-select');
  if (!sel || !sel.value) return null;
  return currentTemplates.find(t => t.templateId === sel.value) || null;
}

async function addNewTemplate() {
  const name = prompt('模板名稱:');
  if (!name) return;
  const category = prompt('分類 (e.g. 商品描述):', '自訂');
  const fidStr = prompt('對應 featureId (數字):', '1');
  const featureId = parseInt(fidStr) || 1;
  const promptBody = prompt('Prompt 本文 (可用 {title} {price} 等變數):', '根據商品 {title} 產生描述...');
  if (!promptBody) return;
  const newT = {
    templateId: 'tpl-' + Date.now(),
    name, category, featureId,
    language: '繁中', tone: '自訂',
    promptBody,
    outputFormat: '文字',
    variables: ['title'],
    isDefault: false,
    isPro: false,
    updatedAt: Date.now()
  };
  currentTemplates.push(newT);
  await saveTemplates(currentTemplates);
  renderTemplateSelect();
  alert('新增成功');
}

async function editTemplate() {
  const t = getSelectedTemplate();
  if (!t || t.isDefault) { alert('請選擇自訂模板或不可編輯預設'); return; }
  const newName = prompt('新名稱:', t.name);
  if (newName) t.name = newName;
  const newBody = prompt('新 PromptBody:', t.promptBody);
  if (newBody) t.promptBody = newBody;
  t.updatedAt = Date.now();
  await saveTemplates(currentTemplates);
  renderTemplateSelect();
  alert('編輯成功');
}

async function deleteTemplate() {
  const t = getSelectedTemplate();
  if (!t || t.isDefault) { alert('請選擇自訂模板'); return; }
  if (!confirm('刪除 ' + t.name + '?')) return;
  currentTemplates = currentTemplates.filter(x => x.templateId !== t.templateId);
  await saveTemplates(currentTemplates);
  renderTemplateSelect();
  alert('已刪除');
}

async function importTemplates() {
  const jsonStr = prompt('貼上 templates.json 內容:');
  if (!jsonStr) return;
  try {
    const imported = JSON.parse(jsonStr);
    if (!Array.isArray(imported)) throw new Error('必須是陣列');
    for (const t of imported) {
      if (!t.templateId || !t.name || !t.promptBody) throw new Error('缺少必要欄位 templateId/name/promptBody');
      if (t.promptBody.includes('sk-ant-') || t.promptBody.includes('AIza')) throw new Error('不可包含 raw provider key');
    }
    // merge, avoid duplicate id
    const existingIds = new Set(currentTemplates.map(x=>x.templateId));
    const toAdd = imported.filter(x => !existingIds.has(x.templateId));
    currentTemplates.push(...toAdd);
    await saveTemplates(currentTemplates);
    renderTemplateSelect();
    alert('匯入成功，新增 ' + toAdd.length + ' 個');
  } catch(e) {
    alert('匯入失敗: ' + e.message);
  }
}

async function exportTemplates() {
  const dataStr = JSON.stringify(currentTemplates, null, 2);
  await navigator.clipboard.writeText(dataStr);
  alert('已複製到剪貼簿 (templates.json 格式)。可手動存檔。');
  // also trigger download
  const blob = new Blob([dataStr], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'templates.json'; a.click();
}

async function resetTemplates() {
  if (!confirm('還原所有預設模板？自訂將清除。')) return;
  currentTemplates = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));
  await saveTemplates(currentTemplates);
  renderTemplateSelect();
  alert('已還原預設');
}

async function initTemplates() {
  await loadTemplates();
  renderTemplateSelect();
  // wire buttons
  const sel = document.getElementById('template-select');
  const btnNew = document.getElementById('btn-template-new');
  const btnEdit = document.getElementById('btn-template-edit');
  const btnDel = document.getElementById('btn-template-del');
  const btnImp = document.getElementById('btn-template-import');
  const btnExp = document.getElementById('btn-template-export');
  const btnReset = document.getElementById('btn-template-reset');
  if (btnNew) btnNew.onclick = addNewTemplate;
  if (btnEdit) btnEdit.onclick = editTemplate;
  if (btnDel) btnDel.onclick = deleteTemplate;
  if (btnImp) btnImp.onclick = importTemplates;
  if (btnExp) btnExp.onclick = exportTemplates;
  if (btnReset) btnReset.onclick = resetTemplates;
  if (sel) sel.onchange = () => console.log('[Template] selected', getSelectedTemplate());
}

const BUILTIN_WORKFLOWS = [
  {
    workflowId: 'wf-single-optimize',
    name: '單品快速優化',
    description: '抓商品資料 → SEO 標題 → 廣告文案 → 促銷文案',
    steps: [
      {type: 'action', name: 'getProductData'},
      {type: 'feature', id: 4},
      {type: 'feature', id: 2},
      {type: 'feature', id: 6}
    ],
    targetPageType: 'shopee-product-page',
    isDefault: true,
    isPro: false,
    updatedAt: Date.now()
  },
  {
    workflowId: 'wf-batch-prep',
    name: '批量上架準備',
    description: '抓列表商品 → 批量描述 → CSV 匯出',
    steps: [
      {type: 'action', name: 'getProductList'},
      {type: 'feature', id: 13},
      {type: 'action', name: 'exportCSV'}
    ],
    targetPageType: 'shopee-seller-product-list',
    isDefault: true,
    isPro: false,
    updatedAt: Date.now()
  },
  {
    workflowId: 'wf-competitor',
    name: '競品分析',
    description: '抓商品資料 → 競品分析 → AI 建議售價',
    steps: [
      {type: 'action', name: 'getProductData'},
      {type: 'feature', id: 12},
      {type: 'feature', id: 9}
    ],
    targetPageType: 'shopee-product-page',
    isDefault: true,
    isPro: false,
    updatedAt: Date.now()
  },
  {
    workflowId: 'wf-review-reply',
    name: '客服回覆',
    description: '抓評價 → 評價回覆 → 複製結果',
    steps: [
      {type: 'action', name: 'getReviews'},
      {type: 'feature', id: 7},
      {type: 'action', name: 'copyResult'}
    ],
    targetPageType: 'shopee-product-page',
    isDefault: true,
    isPro: false,
    updatedAt: Date.now()
  }
];

let currentQueue = [];
let isRunning = false;
let cancelRequested = false;

function renderWorkflowSelect() {
  const sel = document.getElementById('workflow-select');
  if (!sel) return;
  sel.innerHTML = '';
  BUILTIN_WORKFLOWS.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w.workflowId;
    opt.textContent = w.name;
    sel.appendChild(opt);
  });
}

function updateQueueUI() {
  const div = document.getElementById('workflow-queue');
  if (!div) return;
  div.innerHTML = '<strong>任務佇列:</strong><br>';
  if (currentQueue.length === 0) {
    div.innerHTML += '無佇列<br>';
    return;
  }
  currentQueue.forEach((step, i) => {
    let status = step.status || '待執行';
    div.innerHTML += `${i+1}. ${step.name || step.type} [${status}] `;
    if (status === '失敗') {
      const retryBtn = document.createElement('button');
      retryBtn.textContent = '重試';
      retryBtn.style.fontSize = '9px';
      retryBtn.onclick = () => retryStep(i);
      div.appendChild(retryBtn);
    }
    div.innerHTML += '<br>';
  });
}

async function executeWorkflow(workflowId) {
  if (isRunning) return;
  isRunning = true;
  cancelRequested = false;
  const wf = BUILTIN_WORKFLOWS.find(w => w.workflowId === workflowId);
  if (!wf) { isRunning = false; return; }
  currentQueue = wf.steps.map(s => ({...s, status: '待執行', result: null, name: s.type + (s.id ? '-'+s.id : '') }));
  updateQueueUI();
  updateStatus({ task: `執行工作流: ${wf.name}`, loading: true });
  let successCount = 0, failCount = 0;
  let outputs = [];
  const startTime = Date.now();
  let productData = { title: '側邊欄測試商品', category: 'Shopee商品', specs: '', price: 'NT$299' };
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const data = await chrome.tabs.sendMessage(tab.id, { action: 'getProductData' }).catch(() => null);
      if (data) productData = { ...productData, ...data };
    }
  } catch (e) {}
  for (let i = 0; i < currentQueue.length; i++) {
    if (cancelRequested) {
      currentQueue[i].status = '跳過';
      break;
    }
    const step = currentQueue[i];
    step.status = '執行中';
    updateQueueUI();
    updateStatus({ task: `步驟 ${i+1}: ${step.type}`, loading: true });
    try {
      let res = '';
      if (step.type === 'feature') {
        const reg = FEATURE_REGISTRY[step.id];
        if (reg && reg.handler) {
          res = await reg.handler(productData);
        } else {
          const resp = await chrome.runtime.sendMessage({ action: 'generateDescription', productData, featureId: step.id });
          res = resp && resp.description ? resp.description : '';
        }
      } else if (step.type === 'action') {
        if (step.name === 'getProductData') {
          res = '已抓取商品資料: ' + (productData.title || '');
        } else if (step.name === 'getProductList') {
          res = '已抓取列表 (模擬)';
        } else if (step.name === 'exportCSV') {
          const csv = 'id,title\n1,"test"';
          const blob = new Blob([csv], {type:'text/csv'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'workflow-export.csv'; a.click();
          res = '已匯出 workflow-export.csv';
        } else if (step.name === 'copyResult') {
          const last = document.getElementById('result-text') ? document.getElementById('result-text').value : '';
          if (last) await navigator.clipboard.writeText(last);
          res = '已複製結果';
        } else if (step.name === 'getReviews') {
          res = '已抓取評價 (模擬)';
        }
      }
      step.status = '成功';
      step.result = res;
      outputs.push(res);
      successCount++;
      showResultWithMeta( (document.getElementById('result-text') ? document.getElementById('result-text').value : '') + '\n\n[工作流步驟 ' + (i+1) + ' 完成]\n' + res , {feature: '工作流'} );
    } catch (err) {
      step.status = '失敗';
      step.result = err.message || '錯誤';
      failCount++;
      showResultWithMeta( (document.getElementById('result-text') ? document.getElementById('result-text').value : '') + '\n\n[工作流步驟 ' + (i+1) + ' 失敗]\n' + (err.message || err) , {feature: '工作流'} );
    }
    updateQueueUI();
    updateStatus({ task: `步驟 ${i+1} 完成`, loading: false });
    if (cancelRequested) break;
  }
  const endTime = Date.now();
  const summary = `工作流 ${wf.name} 完成\n成功: ${successCount} 失敗: ${failCount}\n耗時: ${endTime - startTime}ms\n\n輸出:\n` + outputs.join('\n---\n');
  showResultWithMeta(summary, {feature: wf.name});
  chrome.storage.local.set({ lastWorkflow: { id: wf.workflowId, summary, time: endTime } });
  isRunning = false;
  updateStatus({ task: '工作流完成' });
}

function retryStep(idx) {
  if (!currentQueue[idx] || currentQueue[idx].status !== '失敗') return;
  currentQueue[idx].status = '待執行';
  updateQueueUI();
  alert('已標記重試，請重新執行整個工作流 (MVP 簡化處理)');
}

async function initWorkflows() {
  renderWorkflowSelect();
  currentQueue = [];
  updateQueueUI();
  const sel = document.getElementById('workflow-select');
  const runBtn = document.getElementById('btn-workflow-run');
  const cancelBtn = document.getElementById('btn-workflow-cancel');
  if (runBtn) runBtn.onclick = async () => {
    if (!sel || !sel.value) return;
    await executeWorkflow(sel.value);
  };
  if (cancelBtn) cancelBtn.onclick = () => {
    cancelRequested = true;
    updateStatus({ task: '取消請求' });
  };
  chrome.storage.local.get(['lastWorkflow'], (d) => {
    if (d.lastWorkflow) {
      // can show in console or status
    }
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
  // Added plan for Phase 11 Pro entitlement (free / pro)
  const fullFeatures = [
    { id: 1, cat: "內容生成類", name: "多模板選擇 (描述/廣告/規格/SEO/促銷/評價/利潤)", plan: 'free' },
    { id: 2, cat: "內容生成類", name: "廣告文案一鍵生成", plan: 'free' },
    { id: 4, cat: "內容生成類", name: "SEO 標題 + 關鍵字優化", plan: 'free' },
    { id: 5, cat: "內容生成類", name: "多語言翻譯（中英越泰）", plan: 'free' },
    { id: 6, cat: "內容生成類", name: "限時優惠 / 促銷文案", plan: 'free' },
    { id: 7, cat: "內容生成類", name: "評價回覆自動生成", plan: 'free' },
    { id: 8, cat: "定價與競爭", name: "同類商品價格監控", plan: 'free' },
    { id: 9, cat: "定價與競爭", name: "AI 建議售價", plan: 'free' },
    { id: 10, cat: "定價與競爭", name: "降價 / 調價提醒", plan: 'free' },
    { id: 11, cat: "定價與競爭", name: "利潤計算器", plan: 'free' },
    { id: 12, cat: "定價與競爭", name: "競品分析報告", plan: 'free' },
    { id: 13, cat: "自動化", name: "批量商品描述生成", plan: 'pro' }, // bulk large as pro
    { id: 14, cat: "自動化", name: "一鍵搬家工具（PChome / MOMO / Shopify）", plan: 'free' },
    { id: 15, cat: "自動化", name: "圖片 Alt Text 自動生成", plan: 'free' },
    { id: 16, cat: "自動化", name: "商品圖片優化建議", plan: 'free' },
    { id: 17, cat: "自動化", name: "右鍵快速生成", plan: 'free' },
    { id: 18, cat: "數據分析", name: "銷售數據 AI 洞察", plan: 'free' },
    { id: 19, cat: "數據分析", name: "熱門關鍵字追蹤", plan: 'free' },
    { id: 20, cat: "數據分析", name: "退貨 / 客訴分析", plan: 'free' },
    { id: 21, cat: "數據分析", name: "活動檔期建議", plan: 'free' },
    { id: 22, cat: "顧客與訂單", name: "買家評價風險預警", plan: 'free' },
    { id: 23, cat: "顧客與訂單", name: "客服回覆模板庫", plan: 'free' },
    { id: 24, cat: "顧客與訂單", name: "訂單優先處理建議", plan: 'free' },
    { id: 25, cat: "顧客與訂單", name: "自動發送追蹤訊息", plan: 'free' },
    { id: 26, cat: "進階與變現", name: "Prompt 模板自訂", plan: 'pro' },
    { id: 27, cat: "進階與變現", name: "團隊共享模板", plan: 'pro' },
    { id: 28, cat: "進階與變現", name: "使用量統計儀表板", plan: 'pro' },
    { id: 29, cat: "進階與變現", name: "Pro 會員功能鎖定", plan: 'pro' },
    { id: 30, cat: "進階與變現", name: "多平台同步", plan: 'pro' }
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

    const isProFeature = f.plan === 'pro';
    const entitled = isProAllowed();

    if (isProFeature && !entitled) {
      btn.textContent = '🔒 ' + f.name;
      btn.style.opacity = '0.6';
      btn.onclick = () => {
        showResultWithMeta('此為 Pro 功能（Mock Entitlement 鎖定）。請至 Options 切換為 Pro Active / Trial 測試。\n\n支援狀態：Free / Pro Trial / Pro Active / Expired / Admin Override', { feature: f.name });
        updateStatus({ task: `Pro 功能鎖定: ${f.name}` });
      };
    } else {
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
            resultText = useTmpl ? await generateWithPrompt(f.id, productData, useTmpl) : await reg.handler(productData);
          } else {
            const msg = { action: 'generateDescription', productData, featureId: f.id };
            if (useTmpl) msg.template = useTmpl;
            const response = await chrome.runtime.sendMessage(msg);
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
    }

    parent.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[SidePanel] DOMContentLoaded, starting render...');
  loadHistory();
  loadEntitlement();
  renderFeatures();
  initTemplates();
  initWorkflows();

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

        const c = res.computed || {};
        let text = '=== 使用量統計儀表板 (Phase 10) ===\n';
        text += `今日執行: ${c.today || 0}\n`;
        text += `本月執行: ${c.month || 0}\n`;
        text += `總計: ${c.total || 0}\n`;
        text += `Mock / Gateway: ${c.modeRatio ? c.modeRatio.Mock : 0} / ${c.modeRatio ? c.modeRatio.Gateway : 0}\n`;
        text += `失敗率: ${c.failureRate || '0%'}\n\n`;
        text += '熱門功能排行:\n';
        (c.topFeatures || []).forEach((f,i) => text += `  ${i+1}. Feature ${f.featureId}: ${f.count}\n`);
        text += '\n最近事件 (最多20):\n';
        (c.recentEvents || []).slice(0,5).forEach(e => {
          text += `  [${new Date(e.startedAt).toLocaleTimeString()}] F${e.featureId} ${e.status} ${e.durationMs}ms\n`;
        });

        updateStatus({ task: '分析完成', lastResult: '見結果區', loading: false });
        showResultWithMeta(text, { feature: '使用量統計儀表板' });

        // Add export button dynamically if not present
        const resultSection = document.getElementById('result-section');
        if (resultSection && !document.getElementById('export-analytics')) {
          const exportBtn = document.createElement('button');
          exportBtn.id = 'export-analytics';
          exportBtn.textContent = '匯出 usage-events.csv (BOM)';
          exportBtn.style.marginTop = '4px';
          exportBtn.onclick = () => {
            const events = res.events || [];
            if (!events.length) {
              alert('無事件可匯出');
              return;
            }
            const header = 'eventId,featureId,featureName,category,pageType,productId,mode,status,startedAt,endedAt,durationMs,outputLength\n';
            const lines = events.map(e => 
              `"${e.eventId}",${e.featureId},"${e.featureName}","${e.category}","${e.pageType}","${e.productId || ''}","${e.mode}","${e.status}",${e.startedAt},${e.endedAt},${e.durationMs},${e.outputLength || 0}`
            );
            const bom = '\uFEFF';
            const csv = bom + header + lines.join('\n');
            const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'usage-events.csv';
            a.click();
            updateStatus({ lastResult: '已匯出 usage-events.csv' });
          };
          resultSection.appendChild(exportBtn);
        }
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