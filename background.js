// background.js - Service Worker for Shopee AI Desc Generator (30功能版)

chrome.runtime.onInstalled.addListener(() => {
  console.log('Shopee AI 描述生成器 (30功能) 已安裝');
});

// Placeholder for AI generation (can be expanded to call Gemini/OpenAI API)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateDescription') {
    // TODO: Integrate real AI API here (e.g. Gemini)
    const mockDescription = generateMockDescription(request.productData, request.featureId);
    sendResponse({ success: true, description: mockDescription });
  }
  return true; // Keep the message channel open for async
});

function generateMockDescription(productData, featureId) {
  const base = productData.title || '優質商品';
  const features = [
    "高品質材料，耐用舒適",
    "多功能設計，適合日常使用",
    "時尚外觀，百搭風格",
    // ... expand to 30
  ];
  return `${base} - ${features[featureId % features.length]}。立即購買體驗！`;
}
