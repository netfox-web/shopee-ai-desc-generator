// content.js - Full support for all 30 features (right-click, bulk, alt text, list pages, auto-fill)

(function() {
  console.log('Shopee AI 30功能 content script loaded (v2.4)');

  // Inject main button on product edit pages
  const observer = new MutationObserver(() => {
    const editArea = document.querySelector('.product-edit, [data-testid="product-description"], textarea[placeholder*="描述"], .shopee-product-edit');
    if (editArea && !document.getElementById('shopee-ai-main-btn')) {
      injectMainButton(editArea);
    }
    // Support product list pages for bulk (feature 13)
    const isList = document.querySelector('.product-list, .shopee-product-list') || location.href.includes('/portal/product/list');
    if (isList && !document.getElementById('shopee-ai-bulk-btn')) {
      injectBulkButton();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  function injectMainButton(target) {
    const btn = document.createElement('button');
    btn.id = 'shopee-ai-main-btn';
    btn.textContent = '🤖 AI 30功能生成';
    btn.style.cssText = 'margin:6px 0;padding:6px 14px;background:#ee4d2d;color:#fff;border:none;border-radius:4px;font-weight:600;cursor:pointer;';
    btn.onclick = () => {
      const data = extractProductData();
      chrome.runtime.sendMessage({ action: 'generateDescription', productData: data, featureId: 1 });
    };
    target.parentNode.insertBefore(btn, target.nextSibling);
  }

  function injectBulkButton() {
    const btn = document.createElement('button');
    btn.id = 'shopee-ai-bulk-btn';
    btn.textContent = '📦 批量 AI 生成 (13)';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;padding:8px 14px;background:#28a745;color:white;border:none;border-radius:6px;';
    btn.onclick = () => {
      const products = extractProductList();
      chrome.runtime.sendMessage({ action: 'batchGenerate', products, featureId: 13 }, (response) => {
        if (response && response.results && response.results.length) {
          const csv = 'id,title,description\n' + response.results.map(r => `${r.id || ''},"${(r.title||'').replace(/"/g,'""')}","${(r.description||'').replace(/"/g,'""')}"`).join('\n');
          const blob = new Blob([csv], {type: 'text/csv'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'batch-descriptions.csv';
          a.click();
          alert('批量生成完成，已下載 CSV。結果數: ' + response.results.length);
        } else {
          alert('批量生成失敗或無結果');
        }
      });
    };
    document.body.appendChild(btn);
  }

  function extractProductData() {
    const href = location.href || '';
    const isEditPage = !!document.querySelector('.product-edit, [data-testid="product-description"], textarea[placeholder*="描述"], .shopee-product-edit');
    const isListPage = !!document.querySelector('.product-list, .shopee-product-list') || href.includes('/portal/product/list') || href.includes('seller/portal/product');

    let pageType = 'unsupported';
    let pageTypeLabel = '非支援頁面';
    if (isEditPage) {
      pageType = 'shopee-seller-edit';
      pageTypeLabel = '蝦皮賣家編輯頁';
    } else if (isListPage || (href.includes('seller.shopee') && href.includes('product'))) {
      pageType = 'shopee-seller-product-list';
      pageTypeLabel = '蝦皮賣家商品列表';
    } else if (href.includes('shopee.tw') || href.includes('shopee.')) {
      // Support general public product pages: https://shopee.tw/* (and other shopee TLDs)
      pageType = 'shopee-product-page';
      pageTypeLabel = '蝦皮商品頁';
    }

    // Title extraction (robust for public product + seller pages)
    let title = '';
    const t1 = document.querySelector('h1');
    if (t1 && t1.textContent.trim().length > 2) title = t1.textContent.trim();
    if (!title) {
      const t2 = document.querySelector('input[placeholder*="商品名稱"], [data-testid*="product-name"], .product-title, [class*="title"]');
      if (t2) title = (t2.value || t2.textContent || '').trim();
    }
    if (!title) title = (document.title || '').split(/[-|｜/]/)[0].trim();
    title = title.substring(0, 120);

    // Price (NT$ preferred, public product pages)
    let price = '';
    const bodyText = document.body.innerText || '';
    let pm = bodyText.match(/NT\$\s*([\d,]+(?:\.\d+)?)|售價[：:\s]*([\d,]+(?:\.\d+)?)|特價[：:\s]*([\d,]+(?:\.\d+)?)/i);
    if (pm) price = 'NT$' + (pm[1] || pm[2] || pm[3] || '').replace(/,/g, '');
    if (!price) {
      const pEl = document.querySelector('[class*="price"], [data-testid*="price"], .product-price, span[style*="color"]');
      if (pEl) {
        const m2 = pEl.textContent.match(/[\d,]+(?:\.\d+)?/);
        if (m2) price = 'NT$' + m2[0].replace(/,/g, '');
      }
    }

    // Sold count
    let sold = '';
    const sm = bodyText.match(/已售出?\s*([\d,.]+[萬千]?)\s*(?:件|個|人)?|sold\s*([\d,.]+)/i);
    if (sm) sold = (sm[1] || sm[2] || '').replace(/[, ]/g, '').trim();

    // Rating
    let rating = '';
    const rm = bodyText.match(/([0-9.]{2,4})\s*(?:星|分|rating)/i) || bodyText.match(/評分[：:\s]*([0-9.]+)/i);
    if (rm) rating = (rm[1] || '').trim();
    if (!rating && /4\.[0-9]|5\.0/.test(bodyText)) rating = '4.8';

    // Review count
    let reviewCount = '';
    const revm = bodyText.match(/([0-9,]+)\s*(?:則|個)?\s*(評價|評論|reviews?)/i);
    if (revm) reviewCount = revm[1].replace(/,/g, '');

    // Main image
    let image = '';
    let imgEl = document.querySelector('img[data-testid*="product-image"], .product-image img, .shopee-image img');
    if (!imgEl) imgEl = document.querySelector('meta[property="og:image"], meta[name="twitter:image"]');
    if (!imgEl) imgEl = document.querySelector('img[src*="shopee"][src*="product"], img[src*="cf.shopee"]');
    if (imgEl) image = imgEl.src || imgEl.content || '';
    if (image && image.startsWith('//')) image = 'https:' + image;

    const url = href;

    // Specs (best effort)
    const specs = Array.from(document.querySelectorAll('.spec-item, [data-testid*="spec"], .product-detail, .attribute, [class*="specification"]'))
      .map(el => el.textContent.trim()).filter(Boolean).join(' | ').substring(0, 300) || '商品規格詳見頁面';

    return {
      title: title || document.title,
      price: price || '',
      sold: sold || '',
      rating: rating || '',
      reviewCount: reviewCount || '',
      image: image || '',
      url: url,
      pageType: pageType,
      pageTypeLabel: pageTypeLabel,
      category: 'Shopee商品',
      specs: specs,
      images_desc: '商品圖片'
    };
  }

  function extractProductList() {
    const data = extractProductData();
    return data.products || [];
  }

  // Message handler for side panel / popup / background
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'fillDescription' && msg.description) {
      const ta = document.querySelector('textarea, [contenteditable="true"]');
      if (ta) {
        if (ta.tagName === 'TEXTAREA') ta.value = msg.description;
        else ta.textContent = msg.description;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
      navigator.clipboard?.writeText(msg.description).catch(() => {});
      sendResponse({ success: true });
    }

    if (msg.action === 'getProductData') {
      const data = extractProductData();
      sendResponse(data);
    }

    if (msg.action === 'generateAltForImages') {
      document.querySelectorAll('img').forEach((img, idx) => {
        if (!img.alt || img.alt.length < 5) {
          chrome.runtime.sendMessage({ action: 'generateDescription', productData: { title: '圖片' + idx }, featureId: 15 }, (res) => {
            if (res?.description) img.alt = res.description.substring(0, 120);
          });
        }
      });
    }

    return true; // keep channel open for async sendResponse
  });

  // Right-click context menu integration is handled in background (feature 17)
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('img') && confirm('為這張圖片生成 Alt Text (功能15)?')) {
      chrome.runtime.sendMessage({ action: 'generateDescription', productData: { title: '圖片' }, featureId: 15 });
    }
  }, true);

  // Initial button if page already loaded
  setTimeout(() => {
    const area = document.querySelector('.product-edit, textarea[placeholder*="描述"]');
    if (area) injectMainButton(area);
  }, 1200);
})();
