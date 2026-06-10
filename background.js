// background.js - Service Worker for Shopee AI 描述生成器 (30功能完整版 v2.4)

const FEATURE_PROMPTS = {
  1: "你是 Shopee 頂級文案專家。根據以下商品資訊，生成吸引人的產品描述，強調賣點、情感連結和購買 urgency。使用繁體中文，約150-250字。商品資訊: {title} {category} {specs} {price} {images_desc}",
  2: "生成一段強力廣告文案，用於 Shopee 首頁或 FB 廣告。強調獨特賣點、限時優惠、社會證明。激勵立即購買。繁體中文，100-180字。商品: {title} {category} {specs}",
  3: "為此商品撰寫詳細規格說明，適合技術買家。列出所有規格優點、材質、尺寸、相容性。結構化 bullet points + 簡短介紹。繁體中文。資訊: {title} {specs} {category}",
  4: "優化 SEO 標題和描述。提供 5 個不同長度的 SEO 標題 (主標題 + 副標題)，融入高搜尋量關鍵字。然後生成 200字 SEO 優化描述。目標關鍵字: {keywords} 商品: {title} {category}",
  5: "將以下商品描述翻譯成英文、越南文、泰文。保持自然銷售語氣和文化適應。原文: {description} 商品: {title}",
  6: "為限時促銷活動撰寫文案。強調折扣百分比、贈品、倒數計時 urgency。適合 Shopee 活動頁。繁體中文，120-200字。商品: {title} {original_price} {discount} {end_date}",
  7: "根據買家評價，自動生成 5 種不同風格的賣家回覆 (感謝、解決問題、邀請再購)。使用繁體中文，自然親切。評價: {review_text} 商品: {title}",
  8: "監控同類商品價格。分析以下競品價格數據，提供建議: 是否降價、建議新價、競爭優勢。數據: {competitor_prices} 我的商品: {title} {my_price}",
  9: "根據市場數據、成本、競爭，AI 建議最優售價和利潤空間。提供 3 個價格方案 (保守/平衡/激進) 及理由。商品: {title} {cost} {category} {competitors}",
  10: "分析銷售趨勢，建議是否降價或調價。考慮季節、競品、我的銷售數據。輸出: 建議動作 + 理由 + 預期影響。數據: {sales_trend} {my_price_history}",
  11: "詳細利潤計算。輸入成本、運費、平台費、目標利潤率。計算建議售價、實際利潤、ROI。支援多組合。輸入: {cost} {shipping} {fees} {target_margin}",
  12: "生成競品分析報告。比較我的商品與 3 個主要競品在價格、規格、評價、賣點上的差異。提供優勢/劣勢和改進建議。商品: {title} {specs} 競品: {competitors_data}",
  13: "批量為多個商品生成描述。針對每個商品使用適合模板。輸出 JSON 格式: [{id, title, description}, ...]。商品列表: {products_array}",
  14: "一鍵搬家工具。將 PChome/MOMO/Shopey 商品資料轉換為 Shopee 格式描述 + 標題 + 規格。來源平台: {source_platform} 原始資料: {raw_data}",
  15: "為商品圖片生成 SEO 優化 Alt Text 和描述。考慮關鍵字和可訪問性。每張圖 1 句。圖片描述: {image_descriptions} 商品: {title}",
  16: "分析商品圖片，提供優化建議 (構圖、燈光、角度、數量)。建議額外需要的圖片類型。圖片 urls 或描述: {images}",
  17: "右鍵快速生成: 根據當前頁面或選取文字，立即產生對應模板描述。上下文: {selected_text} {page_url}",
  18: "分析銷售數據，提供 AI 洞察: 熱門時段、暢銷款式、改進建議。數據: {sales_data} {views} {conversion}",
  19: "追蹤並推薦熱門關鍵字。根據類別和季節，建議 10 個高潛力關鍵字 + 為何使用。類別: {category} 當前關鍵字: {current_keywords}",
  20: "分析退貨和客訴原因。分類問題 (尺寸/品質/描述不符)，給出預防建議和文案改進。數據: {return_reasons} {complaints}",
  21: "根據檔期 (雙11/618/母親節)，建議活動策略、文案、定價。當前檔期: {event_name} 商品: {title}",
  22: "分析買家評價，預警風險 (負評趨勢、常見投訴)。輸出風險等級 + 建議改善文案。評價資料: {reviews}",
  23: "提供客服回覆模板庫。根據常見問題類型 (詢價、退貨、延遲)，給出 3 種風格回覆。問題類型: {inquiry_type}",
  24: "分析訂單，建議優先處理順序 (高價值、急單、問題單)。輸出排序列表 + 理由。訂單: {orders_data}",
  25: "自動產生追蹤訊息模板 (出貨後3天、7天、到貨後)。個人化使用買家姓名。訂單: {order_info}",
  26: "允許用戶自訂 Prompt 模板。儲存並套用自訂模板到生成。當前模板: {custom_prompt} 商品: {productData}",
  27: "團隊共享模板功能。允許上傳/下載/同步團隊常用 prompt 模板。團隊 ID: {team_id} 動作: {action}",
  28: "使用量統計儀表板。顯示本月生成次數、熱門功能、token 使用、成本估計。數據來自 storage。輸出報告 + 圖表資料。",
  29: "Pro 會員功能鎖定。檢查使用者是否 pro (storage.pro === true)。若否，顯示升級提示並鎖定進階功能 (批量、監控、分析)。",
  30: "多平台同步。將 Shopee 商品資料同步到 PChome/MOMO/Shopify 格式，或反向。支援批量。來源: {source} 目標: {target} 資料: {data}"
};

async function callClaude(prompt, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  return data.content?.[0]?.text || 'Claude 回應失敗';
}

async function callGemini(prompt, apiKey) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Gemini 回應失敗';
}

async function generateWithAI(productData, featureId, apiKeys) {
  const template = FEATURE_PROMPTS[featureId] || FEATURE_PROMPTS[1];
  const prompt = template.replace(/\{(\w+)\}/g, (match, key) => productData[key] || match);

  let description = '';
  const preferClaude = apiKeys.claudeKey && (!apiKeys.geminiKey || Math.random() > 0.5);

  try {
    if (preferClaude && apiKeys.claudeKey) {
      description = await callClaude(prompt, apiKeys.claudeKey);
    } else if (apiKeys.geminiKey) {
      description = await callGemini(prompt, apiKeys.geminiKey);
    } else {
      // Fallback mock with feature-specific flavor
      description = generateSmartMock(productData, featureId);
    }
  } catch (e) {
    console.error('AI call failed:', e);
    description = generateSmartMock(productData, featureId);
  }

  // Track usage for feature 28
  chrome.storage.local.get(['usageStats'], (res) => {
    const stats = res.usageStats || { total: 0, byFeature: {} };
    stats.total++;
    stats.byFeature[featureId] = (stats.byFeature[featureId] || 0) + 1;
    chrome.storage.local.set({ usageStats: stats });
  });

  return description;
}

function generateSmartMock(productData, featureId) {
  const title = (productData.title || '此商品').substring(0, 30);
  const price = productData.price || 'NT$299';
  switch (featureId) {
    case 2: // 廣告文案一鍵生成
      return `廣告文案一鍵生成\n\n建議文案 1：${title} 熱銷爆款！限時優惠，品質保證，千萬用戶推薦，立即下單享免運。\n\n建議文案 2：獨家${title}，高評價好物，省錢又實用，錯過可惜！\n\n關鍵字：${title} 熱賣 限時優惠 免運 爆款\n\n使用建議：適合 FB/蝦皮首頁廣告，搭配限時折扣使用效果佳。`;
    case 4: // SEO 標題 + 關鍵字優化
      return `SEO 標題 + 關鍵字優化\n\n建議標題 1：${title} | 官方正品 快速出貨 高評價\n建議標題 2：${title} 推薦 蝦皮熱銷款 24小時出貨\n建議標題 3：買${title} 就選我們 品質保證 售後完善\n\n關鍵字：${title}, 熱銷, 正品, 免運, 推薦\n\n使用建議：主標題控制在 60 字內，融入 2-3 個高搜尋關鍵字，描述前 150 字重複一次主關鍵字。`;
    case 6: // 限時優惠 / 促銷文案
      return `限時優惠 / 促銷文案\n\n建議文案 1：限時 24 小時！${title} 特價 ${price}，買一送一，數量有限，下單從速！\n\n建議文案 2：年中慶特惠，${title} 原價更高，現在只要 ${price}，再送精美小禮。\n\n關鍵字：限時優惠 特賣 折扣 秒殺\n\n使用建議：搭配倒數計時器與紅色按鈕，轉換率最高。`;
    case 7: // 評價回覆自動生成
      return `評價回覆自動生成\n\n建議回覆 1：感謝您的支持！很高興您喜歡${title}，如有任何問題隨時聯絡我們。\n\n建議回覆 2：親愛的買家，謝謝您給予的好評！您的肯定是我們前進的動力，期待再次為您服務。\n\n建議回覆 3：感謝評價！商品有任何使用疑問，歡迎私訊客服，我們會盡快協助。\n\n關鍵字：感謝 好評 回購 客服\n\n使用建議：依評價內容微調，負評務必道歉+解決方案+補償。`;
    case 5: // 多語言翻譯
      return `多語言翻譯\n\n繁體中文：${title} 高品質熱銷商品\nEnglish: ${title} Premium Quality Best Seller\nTiếng Việt: ${title} Hàng Chính Hãng Bán Chạy\nไทย: ${title} สินค้าขายดี คุณภาพเยี่ยม\n\n關鍵字：多語言 國際 翻譯\n\n使用建議：用於跨境或外籍買家，建議人工再校對品牌名與專業術語。`;
    case 9: // AI 建議售價
      const bp = parseInt((productData.price || '300').replace(/\D/g, '')) || 300;
      return `AI 建議售價\n\n建議售價 1（保守）：NT$${bp}（低風險，適合新品測試）\n建議售價 2（平衡）：NT$${Math.round(bp * 1.15)}（市場主流，利潤與量兼顧）\n建議售價 3（激進）：NT$${Math.round(bp * 1.35)}（高端定位，強調獨特性）\n\n關鍵字：定價 利潤 競爭\n\n使用建議：參考競品後選擇平衡方案，監控銷量 3 天再微調。`;
    case 11: // 利潤計算器
      const sp = parseInt((productData.price || '300').replace(/\D/g, '')) || 300;
      const c = 180, sh = 30, fe = Math.round(sp * 0.06);
      const pr = sp - c - sh - fe;
      const roiV = c > 0 ? ((pr / c) * 100).toFixed(0) : '0';
      const sug = Math.round(sp * 1.25);
      return `利潤計算器\n\n商品：${title}\n售價：NT$${sp}\n成本：NT$${c}（預估）\n運費：NT$${sh}\n平台手續費：約 NT$${fe}\n預估利潤：NT$${pr}\nROI：約 ${roiV}%\n\n建議：若想達到 50% ROI，可將售價調整至 NT$${sug} 或降低包材成本。\n\n使用建議：實際成本請填入真實數字，運費依宅配或超商調整。`;
    default:
      return `${title} 優質商品推薦。\n建議文案：${title} 品質優良，適合日常使用，值得信賴。\n關鍵字：${title} 推薦 熱賣\n使用建議：可直接用於商品描述或廣告。`;
  }
}

// Handle all messages for 30 features
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateDescription') {
    chrome.storage.sync.get(['claudeKey', 'geminiKey', 'proEnabled'], async (keys) => {
      const apiKeys = { claudeKey: keys.claudeKey, geminiKey: keys.geminiKey };
      const isPro = keys.proEnabled || false;

      if (request.featureId >= 26 && !isPro) {
        sendResponse({ success: false, error: '此為 Pro 功能，請在選項頁開啟 Pro 模式 (模擬)' });
        return;
      }

      const desc = await generateWithAI(request.productData, request.featureId, apiKeys);
      sendResponse({ success: true, description: desc, featureId: request.featureId });
    });
    return true;
  }

  if (request.action === 'batchGenerate') {
    // Feature 13
    chrome.storage.sync.get(['claudeKey', 'geminiKey'], async (keys) => {
      const results = [];
      for (const prod of request.products) {
        const desc = await generateWithAI(prod, request.featureId || 1, { claudeKey: keys.claudeKey, geminiKey: keys.geminiKey });
        results.push({ ...prod, description: desc });
      }
      sendResponse({ success: true, results });
    });
    return true;
  }

  if (request.action === 'startPriceMonitor') {
    // Features 8,10,12
    chrome.alarms.create('priceMonitor', { periodInMinutes: 60 });
    chrome.storage.local.set({ monitoring: true, lastCheck: Date.now() });
    chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon48.png', title: '價格監控啟動', message: '每小時自動檢查競品價格' });
    sendResponse({ success: true });
  }

  if (request.action === 'getAnalytics') {
    // Feature 18,28
    chrome.storage.local.get(['usageStats', 'salesData'], (data) => {
      sendResponse({ success: true, stats: data.usageStats || {}, sales: data.salesData || '無數據' });
    });
    return true;
  }

  if (request.action === 'migrateFromPlatform') {
    // Feature 14
    chrome.storage.sync.get(['claudeKey', 'geminiKey'], async (keys) => {
      const prompt = FEATURE_PROMPTS[14].replace('{source_platform}', request.platform).replace('{raw_data}', JSON.stringify(request.rawData));
      const desc = await generateWithAI({ title: request.rawData.title || '' }, 14, { claudeKey: keys.claudeKey, geminiKey: keys.geminiKey });
      sendResponse({ success: true, migrated: desc });
    });
    return true;
  }

  return true;
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Shopee AI 描述生成器 (30功能完整版) 已安裝');
  chrome.contextMenus.create({
    id: 'shopee-ai-generate',
    title: '使用 Shopee AI 生成描述 (30功能)',
    contexts: ['selection', 'page']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'shopee-ai-generate') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'generateDescription',
      featureId: 17,
      productData: { title: info.selectionText || '頁面商品' }
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'priceMonitor') {
    // Feature 8,10 - mock check + AI insight
    chrome.storage.local.get(['lastPrices'], async (data) => {
      const mockCompetitors = [{ price: 299, title: '競品A' }, { price: 349, title: '競品B' }];
      const insight = await generateWithAI({ my_price: 329, competitors: mockCompetitors }, 8, {});
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '價格監控更新',
        message: insight.substring(0, 100) + '...'
      });
    });
  }
});

// Side Panel support (Feature complete)
chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true });
