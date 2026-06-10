# Shopee AI 描述生成器 (30功能版)

Chrome Extension 為蝦皮賣家打造的最強 AI 工具，目標實作完整 30 個實用功能。

## 專案狀態 (v2.5.0 - Release Packaging + 完整 Phase 1-8 ✅)
- **目前版本**: 2.5.0 (manifest.json 可控)
- **已完整實作所有 30 個功能**：內容生成、價格/競品監控、批量/搬家/右鍵/圖片自動化、銷售與客訴分析、客服與訂單自動化、Prompt自訂/團隊/Pro/多平台同步。
- 真實 Claude + Gemini 呼叫、Side Panel、上下文選單、Pro 鎖定模擬、儀表板。
- **Release 基礎設施**：CHANGELOG.md、RELEASE_CHECKLIST.md、自動打包腳本（scripts/pack-extension.ps1）
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

## Release & Packaging (Phase 9)

### 目前版本
- manifest.json 中的 "version" 欄位為主要版本來源。
- 每次 release 時更新版本號（語意化）。
- README 頂部會顯示目前版本與更新日期。

### 打包指令
在 PowerShell 中執行：

```powershell
powershell -File scripts/pack-extension.ps1
```

輸出：
- `dist/shopee-ai-desc-generator-vX.Y.Z.zip`
- 會自動排除：.git、node_modules、scripts/fixtures、local secrets、暫存檔、dist 本身等。
- 壓縮後的 zip 可直接用於「載入未封裝項目」測試（解壓後指向資料夾）。

### 驗收
- 打包後 zip 內不應包含敏感資料。
- 在 chrome://extensions 開發者模式下載入來源資料夾或解壓後的資料夾。
- 確認 side panel、options page、popup 正常開啟。
- 無 manifest 錯誤（icons、matches 等）。
- 完整檢查清單見 [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)

### 發佈流程摘要
1. 完成所有測試與驗收項目
2. 更新 manifest version
3. 更新 CHANGELOG.md
4. 執行打包指令
5. 檢查 zip 內容與大小
6. 更新 README 版本資訊
7. 提交 commit（包含版本與打包相關變更）
8. **不要直接 merge main / 不要 deploy**（除非 owner 明確指示）

## 測試與 Smoke Test (Phase 8)

執行自動化 smoke test（無需真實蝦皮登入）：

```bash
node scripts/smoke-test.js
```

預期輸出：所有項目 PASS，最後 "All smoke tests PASSED."

涵蓋項目：
- feature registry 30 功能數量與 id 不重複
- parser pageType 判斷（商品頁 / 列表頁 / 編輯頁 / 不支援頁）
- 商品頁 productData 正規化（title, price, sold, rating, reviewCount, image, url, shopName, category）
- 賣家列表 product list 正規化（含 fallback）
- mock output 不含亂碼、不含 prompt 原文、結構化繁中
- CSV 產生含 UTF-8 BOM
- gateway config 不接受 raw provider key（只接受 issued key）

手動 Smoke Test 文件（補充在 README）：
- Reload 擴充前後：狀態區、按鈕反應、最近結果保留
- 商品頁測試：狀態顯示「蝦皮商品頁」、資料已抓取、名稱/價/售
- 賣家列表頁測試：批量按鈕出現、CSV 下載（含 BOM）
- 賣家編輯頁測試：填入功能正常
- 批量 CSV 測試：下載後 Excel 開啟無亂碼
- Gateway fallback 測試：未設或失敗時顯示 fallback 提示，結果區仍有輸出

常見錯誤排除：
- 測試失敗指向具體 parser / mock / gateway 檢查
- CSV 亂碼：確認 BOM 存在
- Registry 數量錯：檢查 sidepanel.js fullFeatures 陣列

注意：測試不碰 production、不 deploy。
