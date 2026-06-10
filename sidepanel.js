// sidepanel.js - Advanced full dashboard for all 30 features

const FEATURES = [ /* same list as popup for brevity - in real would import */ 
  {id:1,name:"多模板選擇",cat:"內容生成類"},{id:8,name:"價格監控",cat:"定價與競爭"},
  {id:13,name:"批量生成",cat:"自動化"},{id:18,name:"銷售洞察",cat:"數據分析"},
  {id:29,name:"Pro 功能",cat:"進階與變現"}
];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('all-features');
  FEATURES.forEach(f => {
    const b = document.createElement('button');
    b.textContent = `${f.cat} - ${f.name}`;
    b.style.margin = '3px';
    b.onclick = () => chrome.runtime.sendMessage({action: 'generateDescription', featureId: f.id, productData: {title: 'SidePanel 商品'}});
    container.appendChild(b);
  });

  // Live monitor status
  chrome.storage.local.get(['monitoring'], (d) => {
    if (d.monitoring) document.getElementById('monitor-status').textContent = '監控中 (每小時)';
  });
});