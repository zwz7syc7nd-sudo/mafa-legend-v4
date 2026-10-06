瑪法・烈焰戰紀 R10.9.1 — 手機同層上傳版

解壓後所有檔案都在同一層，沒有game/assets/vendor等子資料夾。
模型、貼圖與玩法/血量/掉落/存檔邏輯維持已驗收版本；只修正檔案引用與說明。

更新既有GitHub網站：
1. 在iPhone「檔案」App點ZIP解壓，開啟解壓後的資料夾。
2. 用Safari開啟github.com/zwz7syc7nd-sudo/mafa-legend-v4，確認main分支與最上層檔案列表。
3. 選Add file → Upload files → choose your files，選本包解壓後的檔案。不要只上傳ZIP或外層資料夾。
4. 本包共134檔。GitHub網頁每次最多100檔，請分兩批選取並提交到main；同名檔案用本包版本更新。
5. 兩批都完成並等待既有Vercel部署Ready後，再重新載入 https://mafa-legend-v4.vercel.app/ 。中間只傳完一批時可能暫時仍缺檔。
既有repo內其他檔案或舊資料夾可以保留；新版入口只使用本包的同層引用，不需要新增子目錄。
此處是手動上傳指引；製作端沒有替你成功更新公開站，連線權限問題由parent另行處理。

若GitHub行動版沒有顯示Upload files，可切換Safari的桌面版網站後再找Add file。
官方上傳規則：https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
每個檔案均小於GitHub網頁25MiB的單檔上限；最多100檔/次是檔案數限制。

Windows本機：已安裝Node.js時，在這一層開PowerShell，執行 node .\serve.cjs，再開 http://127.0.0.1:8172 。不需npm install。
serve.cjs只服務電腦本機，不會自動讓同Wi-Fi手機可連線。iPhone解壓不等於直接執行App，遊戲仍須透過HTTP(S)網站開啟。

授權：R10_ASSETS_AND_LICENSES.md；Three.js MIT全文：LICENSE。
package.json是遊戲描述檔；three-package.json只保存Three.js原始npm資訊，不是網站的主package.json。
FLAT_SOURCE_MAP.json記錄原始路徑、新檔名與逐檔SHA256。
R10_SHA256SUMS.txt及舊階段文件原樣保留為歷史資料，內部旧路徑不代表此單層包；本包請以FLAT_SOURCE_MAP.json為準。
本機桌面Chrome與觸控模擬檢查不等於iPhone/Safari/PWA實機、效能或離線驗證。
