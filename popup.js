// popup.js - UI for selecting from 30 AI features

const FEATURES = [
  { id: 0, name: "基礎 AI 描述生成", desc: "根據商品資訊自動產生自然描述" },
  { id: 1, name: "SEO 關鍵字優化", desc: "自動嵌入熱門搜尋關鍵字" },
  { id: 2, name: "情感訴求版", desc: "強調買家情感與生活場景" },
  { id: 3, name: "規格強調版", desc: "重點突出材質、尺寸、功能規格" },
  { id: 4, name: "短版精華 (50字內)", desc: "適合標題或簡介的濃縮版" },
  { id: 5, name: "詳細故事版", desc: "用故事敘述商品背景與優勢" },
  { id: 6, name: "買家痛點解決", desc: "針對常見問題提供解決方案" },
  { id: 7, name: "多語言翻譯", desc: "一鍵轉換英文/日文/泰文等" },
  { id: 8, name: "A/B 測試變體", desc: "產生 2-3 個不同風格版本供比較" },
  { id: 9, name: "促銷/限時活動版", desc: "結合折扣、贈品、限時語氣" },
  // ... 繼續到 30 個 (開發時可擴充)
  { id: 10, name: "環保/永續訴求", desc: "強調綠色材料與永續理念" },
  { id: 11, name: "專業/技術向", desc: "適合 3C、家電等專業商品" },
  { id: 12, name: "生活風格版", desc: "融入生活情境與使用想像" },
  { id: 13, name: "比較優勢版", desc: "與競品比較突出差異" },
  { id: 14, name: "用戶評價引用", desc: "模擬真實買家好評語句" },
  { id: 15, name: "Q&A 格式", desc: "以問答形式呈現商品亮點" },
  { id: 16, name: "兒童/親子向", desc: "適合母嬰、玩具類商品" },
  { id: 17, name: "時尚潮流版", desc: "強調設計感與流行趨勢" },
  { id: 18, name: "健康/機能版", desc: "突出健康、舒適、機能性" },
  { id: 19, name: "預算/性價比版", desc: "強調划算、值得購買" },
  { id: 20, name: "季節限定版", desc: "配合節慶或季節活動" },
  { id: 21, name: "新手入門版", desc: "適合初次使用者，簡單易懂" },
  { id: 22, name: "進階專業版", desc: "針對有經驗用戶的詳細說明" },
  { id: 23, name: "社群分享版", desc: "適合 IG、FB 貼文風格" },
  { id: 24, name: "影片腳本版", desc: "產生短影片或直播腳本" },
  { id: 25, name: "包裝/禮盒版", desc: "適合送禮或精美包裝描述" },
  { id: 26, name: "客製化/個人化", desc: "強調可客製選項" },
  { id: 27, name: "保固/售後版", desc: "突出售後服務與保固" },
  { id: 28, name: "組合/套裝版", desc: "適合組合商品或加購優惠" },
  { id: 29, name: "終極完整版", desc: "綜合所有優勢的最完整描述" }
];

function renderFeatures() {
  const container = document.getElementById('features');
  FEATURES.forEach(f => {
    const div = document.createElement('div');
    div.className = 'feature';
    div.innerHTML = `<strong>${f.name}</strong><br><small>${f.desc}</small>`;
    div.onclick = () => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'generateDescription',
          featureId: f.id
        });
        window.close();
      });
    };
    container.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderFeatures();
  document.getElementById('open-options').onclick = () => {
    chrome.runtime.openOptionsPage();
  };
});
