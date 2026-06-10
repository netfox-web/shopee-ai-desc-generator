# Shopee AI 描述生成器 (30功能版)

Chrome Extension 為蝦皮賣家打造的最強 AI 工具，目標實作完整 30 個實用功能。

## 專案狀態
- **目前版本**：v2.3 (Phase 2+ 推進中)
- **已實作**：多模板選擇、Side Panel、真實 AI 整合 (Claude/Gemini)、API Key 管理、自動填入、利潤計算器、SEO 標題生成等
- **完整功能清單**：請參考 [FEATURES.md](./FEATURES.md)

## 功能總覽
詳見 [FEATURES.md](./FEATURES.md) 完整 30 功能清單與開發優先順序。

### 開發優先順序建議
- **Phase 1 (已完成)**: 基礎 AI 生成 + Side Panel + 多模板
- **Phase 2**: 利潤計算器 + SEO 優化 + 廣告文案強化
- **Phase 3**: 批量生成 + 價格監控
- **Phase 4**: 多平台 + 數據分析 + 變現系統

## 開發環境設定 (Windows)

```powershell
# 請參考專案根目錄的 setup 指令，或直接：
cd $env:USERPROFILE\Desktop
# (如果有 zip)
Expand-Archive shopee-ai-desc-extension.zip -DestinationPath shopee-ai-dev -Force
cd shopee-ai-dev\shopee-ai-desc-extension

git init
git add .
git commit -m "feat: 初始化 30 功能開發專案"

git remote add origin https://github.com/netfox-web/shopee-ai-desc-generator.git
git branch -M main
git push -u origin main
```

載入擴充功能測試：
1. Chrome 開啟 `chrome://extensions/`
2. 開啟「開發人員模式」
3. 「載入未封裝項目」→ 選擇本資料夾

## 貢獻
歡迎根據 FEATURES.md 逐步實作剩餘功能。

目標：打造最強蝦皮賣家 AI 工具。
