// content.js - Injects into Shopee product pages for AI description generation

(function() {
  console.log('Shopee AI Desc Generator content script loaded');

  // Wait for page to be ready (Shopee uses dynamic content)
  const observer = new MutationObserver(() => {
    if (document.querySelector('.product-edit') || document.querySelector('[data-testid="product-description"]')) {
      injectAIButton();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function injectAIButton() {
    const target = document.querySelector('.product-description') || document.querySelector('textarea[placeholder*="描述"]');
    if (!target || document.getElementById('shopee-ai-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'shopee-ai-btn';
    btn.textContent = '🤖 AI 生成描述 (30功能)';
    btn.style.cssText = 'margin: 8px 0; padding: 8px 16px; background: #ee4d2d; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;';

    btn.onclick = () => {
      const productData = extractProductData();
      showFeatureSelector(productData);
    };

    target.parentNode.insertBefore(btn, target);
  }

  function extractProductData() {
    // Extract title, category, specs from Shopee page (customize as needed)
    const titleEl = document.querySelector('input[placeholder*="商品名稱"]') || document.querySelector('h1');
    return {
      title: titleEl ? titleEl.value || titleEl.textContent : '未命名商品',
      category: '一般類別',
      specs: '基本規格'
    };
  }

  function showFeatureSelector(productData) {
    // Create a modal with 30 features
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background:white;padding:20px;border-radius:8px;max-width:600px;width:90%;max-height:80vh;overflow:auto;';
    
    content.innerHTML = `
      <h2>選擇 AI 描述功能 (30種)</h2>
      <div id="features-list"></div>
      <button id="generate-btn" style="margin-top:15px;padding:10px 20px;background:#ee4d2d;color:white;border:none;border-radius:4px;">生成描述</button>
      <button id="close-btn" style="margin-left:10px;padding:10px 20px;">關閉</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    const featuresList = content.querySelector('#features-list');
    // TODO: Load 30 features dynamically
    const features = Array.from({length: 30}, (_, i) => ({
      id: i,
      name: `功能 ${i+1}: ${['SEO優化', '情感訴求', '規格強調', '多語言', 'A/B測試變體', '短版描述', '詳細故事版', '買家痛點', '限時促銷', '環保訴求'][i % 10]}`
    }));

    features.forEach(f => {
      const div = document.createElement('div');
      div.innerHTML = `<label><input type="radio" name="feature" value="${f.id}"> ${f.name}</label>`;
      featuresList.appendChild(div);
    });

    content.querySelector('#close-btn').onclick = () => modal.remove();
    content.querySelector('#generate-btn').onclick = () => {
      const selected = content.querySelector('input[name="feature"]:checked');
      if (!selected) { alert('請選擇一個功能'); return; }
      
      chrome.runtime.sendMessage({
        action: 'generateDescription',
        productData,
        featureId: parseInt(selected.value)
      }, (response) => {
        if (response.success) {
          // Inject into the description field
          const descField = document.querySelector('textarea');
          if (descField) descField.value = response.description;
          modal.remove();
          alert('描述已生成！請檢查並調整。');
        }
      });
    };
  }
})();
