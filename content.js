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
    if (document.querySelector('.product-list, .shopee-product-list') && !document.getElementById('shopee-ai-bulk-btn')) {
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
      chrome.runtime.sendMessage({ action: 'batchGenerate', products, featureId: 13 });
    };
    document.body.appendChild(btn);
  }

  function extractProductData() {
    const title = (document.querySelector('input[placeholder*="商品名稱"], .product-title') || {}).value || document.title;
    const specs = Array.from(document.querySelectorAll('.spec-item, [data-testid*="spec"]')).map(el => el.textContent).join(' | ');
    return { title, category: 'Shopee商品', specs, price: '詢問賣場' };
  }

  function extractProductList() {
    // Simple extraction from list pages
    return Array.from(document.querySelectorAll('.product-item, .shopee-product')).slice(0, 10).map((el, i) => ({
      id: 'list-' + i,
      title: el.querySelector('.title, .product-name')?.textContent?.trim() || '商品' + i,
      specs: ''
    }));
  }

  // Auto-fill when receiving from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'fillDescription' && msg.description) {
      const ta = document.querySelector('textarea, [contenteditable="true"]');
      if (ta) {
        if (ta.tagName === 'TEXTAREA') ta.value = msg.description;
        else ta.textContent = msg.description;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
      // Also copy
      navigator.clipboard?.writeText(msg.description).catch(() => {});
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
