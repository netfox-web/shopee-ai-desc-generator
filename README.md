# Shopee AI 描述生成器 (30功能版)

Chrome / Edge 擴充功能，為 Shopee 賣家提供 30 種智能 AI 產品描述生成功能。

## 功能總覽 (30 功能)

1. 基礎 AI 描述生成
2. SEO 關鍵字優化
3. 情感訴求版
4. 規格強調版
5. 短版精華 (50字內)
6. 詳細故事版
7. 買家痛點解決
8. 多語言翻譯 (中/英/日/泰等)
9. A/B 測試變體
10. 促銷/限時活動版
11. 環保/永續訴求
12. 專業/技術向
13. 生活風格版
14. 比較優勢版
15. 用戶評價引用
16. Q&A 格式
17. 兒童/親子向
18. 時尚潮流版
19. 健康/機能版
20. 預算/性價比版
21. 季節限定版
22. 新手入門版
23. 進階專業版
24. 社群分享版 (IG/FB)
25. 影片腳本版
26. 包裝/禮盒版
27. 客製化/個人化
28. 保固/售後版
29. 組合/套裝版
30. 終極完整版 (綜合所有優勢)

## 開發環境設定

執行以下指令 (Windows PowerShell 適配版)：

```powershell
cd $env:USERPROFILE\Desktop
# (假設你有 shopee-ai-desc-extension.zip)
Expand-Archive -Path .\shopee-ai-desc-extension.zip -DestinationPath .\shopee-ai-dev -Force
cd .\shopee-ai-dev\shopee-ai-desc-extension

git init
git add .
git commit -m "feat: 初始化 30 功能開發專案"

git remote add origin https://github.com/netfox-web/shopee-ai-desc-generator.git
git branch -M main
git push -u origin main
```

## 目前狀態

- 基本 Manifest V3 結構
- Content script 自動偵測 Shopee 編輯頁面並注入按鈕
- Popup 列出 30 種功能 (可擴充)
- Background 提供 AI 生成服務 (目前為 mock，後續可接 Gemini / 自有 API)
- 支援直接在頁面注入描述

## 下一步開發建議

- 完善 30 個功能的真實提示詞 (prompt engineering)
- 整合真實 AI API (建議使用 Gemini 或自建後端)
- 增加設定頁面 (API Key、語言偏好、預設模板)
- 加入 Shopee 賣家後台自動化 (批量生成)
- 加入使用統計與 A/B 測試追蹤

## 貢獻

歡迎提交 PR 擴充功能或改進提示詞。

---

**專案目標**：讓 Shopee 賣家用最少時間產出高轉換率的專業描述。
