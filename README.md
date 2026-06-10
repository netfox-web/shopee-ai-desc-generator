# Shopee AI 描述生成器 (30功能版)

Chrome Extension 為蝦皮賣家打造的最強 AI 工具，目標實作完整 30 個實用功能。

## 專案狀態 (v2.4 - 全部30功能一次完成 ✅)
- **已完整實作所有 30 個功能**：內容生成、價格/競品監控、批量/搬家/右鍵/圖片自動化、銷售與客訴分析、客服與訂單自動化、Prompt自訂/團隊/Pro/多平台同步。
- 真實 Claude + Gemini 呼叫、Side Panel、上下文選單、Pro 鎖定模擬、儀表板。
- **完整規格**：詳見 [FEATURES.md](./FEATURES.md)

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
4. 每次修改 sidepanel.js / content.js / background.js 後，務必點「重新載入」按鈕，然後關閉並重新開啟 Side Panel 測試。

## 貢獻
歡迎根據 FEATURES.md 逐步實作剩餘功能。

目標：打造最強蝦皮賣家 AI 工具。

## Issue #1 MVP 手動驗收清單 (最小可驗收)
- [ ] 載入 Side Panel 於蝦皮賣家商品編輯頁 (非公開頁)
- [ ] 狀態區顯示: 頁面類型=shopee-seller-edit, 商品資料=已抓取, 模式=Mock, 任務=閒置
- [ ] 點 "載入分析" -> 結果區顯示 stats JSON (byFeature 有數據)
- [ ] 點 "廣告文案一鍵生成" -> 結果區顯示專屬 mock 文案 + 自動複製
- [ ] 點 "SEO 標題 + 關鍵字優化" -> 結果區顯示 SEO 內容
- [ ] 點 "多語言翻譯" -> 結果區顯示結構化中英越泰
- [ ] 點 "評價回覆自動生成" -> 結果區顯示回覆
- [ ] 點 "同類商品價格監控" -> 結果區顯示報告 + 監控狀態更新
- [ ] 點 "AI 建議售價" -> 結果區顯示建議價格
- [ ] 點 "利潤計算器" -> 結果區顯示計算 (ROI)
- [ ] 點 "競品分析報告" -> 結果區顯示報告
- [ ] 點 "批量商品描述生成" -> 結果區 + 自動下載 batch-descriptions.csv (3筆)
- [ ] 點 "一鍵搬家工具" -> 結果區 + 自動下載 migrated.csv
- [ ] 點 "使用量統計儀表板" (即載入分析) -> 結果區 stats
- [ ] 非支援頁面 (如 google.com): 狀態顯示 "非支援頁面", 點按鈕顯示提示 + 預設資料生成
- [ ] 所有按鈕有 loading (按鈕文字變) / success (結果區) / error (錯誤顯示)
- [ ] 點 "嘗試填入當前頁面" (如果在編輯頁) 成功填入描述欄
- [ ] Console (Side Panel Inspect) 有 [SidePanel] logs 無紅錯
- [ ] 重新載入擴充 + 關開 Side Panel 後功能仍正常

驗收路徑: 開啟 Side Panel -> 點以上 12 個 -> 檢查結果區/狀態/下載/填入。使用 mock 模式。
