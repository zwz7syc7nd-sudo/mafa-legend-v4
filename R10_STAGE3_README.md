# R10.4.1 裝備掉落與常駐發光 — 供父任務獨立 QA

目前狀態：第三項含使用者新增「常駐裝備發光」的實作與本機 QA 完成，等待父任務獨立驗收。第四項自然戰鬥尚未開始。

## 開啟與來源

- 工作目錄：`task-4/stage3-work/game`；執行 `node serve.cjs`，本機 `http://127.0.0.1:8150/`。
- 來源為 `checkpoints/R10.3-boss-accepted/mafa-r10.3-boss-review.zip`，已重驗 SHA256 `f30b1cba03b72cde9ec2167ab701c491018c2a8b3d338fc1431707a479763547`。
- R10.3 已由父任務確認桌面驗收，原遊戲 ZIP 和證據 ZIP 保留原位並 byte-identical 複製到 accepted 目錄。R10.2 與 task-3 不改動。
- 新 key：`mafa-r10-items-stage3-task4-v1`。每項瀏覽器測試使用新隔離 context。没有讀取原有瀏覽器存檔。

## 完成的變更

1. 穿戴、卸下、強化、丟到地面、走近拾取與點名稱前往拾取都接到真實遊戲狀態。
2. 一個 item ID 只保存一份資料。`inventory` 是擁有物品的 canonical registry；`equipped` 只有 ID 參照，背包列表排除穿戴物品。地面只在 `drops`。三種邏輯位置互斥，轉移不重建 ID。
3. 行囊180格，不含現有四欄的穿戴物品。滿包拾取保留物品在地面；不換金、不丟失。滿包不能卸下。已穿戴物品必須先卸下才可丟棄。連點有短暫保護，重複拾取找不到已轉移物品就無動作。
4. 丟棄保留名稱、品質、外觀、強化、四種屬性；丟出的物品需主動點名稱拾回，不會立刻自動撿回。怪物掉落維持靠近拾取。刷新怪物不清掉地面裝備。
5. schema10 保存背包／穿戴／地面座標與物品序號。先完整驗證再 load，ID 重複、錯誤欄位或穿戴參照、八欄格式、非法序號都被拒絕。接受有效舊四欄格式。
6. 初始讀到損壞字串會保留原 key、暫停自動寫入、顯示原資料下載按鈕。確認匯入有效資料時，先留存原字串 recovery 副本，再恢復儲存；該流程已以實際匯入控制項及重新開啟驗證。
7. 地面名稱、品質文字／顏色、圖示可點擊，置於特效上方並避讓 HUD。空間不足的其餘物品可展開捲動，清單在連續繪製時維持節點與 scrollTop。
8. 背包有品質框、品質文字、強化值、屬性、ID／位置。667×375、844×390 與1280×800 實看；小尺寸面板採兩欄獨立捲動。
9. `r10-equipment-visuals.js` 為新增 adapter。世界與預覽共用同一裝備資料；武器品質顏色不再跟隨胸甲、卸下武器後兩處同時隱藏。戒指／護符仍為數值裝備，沒有新增模型。原人物／魔龍／Boss幾何模組及其素材不修改。

## 已執行的 QA 與可重跑腳本

使用已安裝 Chrome + Playwright，無新增系統安裝。PowerShell 需將 TEMP/TMP 指到 task-4/.tmp。腳本皆從 task-4 執行，8150 服務需啟動。

| 報告 | 結果與內容 |
|---|---|
| `ITEM_UI_TEST.json` | 26 項物品與 UI 斷言通過；零瀏覽器錯誤。實際攻擊按鈕擊殺、名稱點擊走近拾取、裝備/強化/卸下/丟棄/重開/拾回、連點、滿包、錯誤資料拒絕。 |
| `ITEM_VISUAL_TEST.json` | 18 項通過；三種橫向尺寸操作可見、無水平溢出、世界/預覽資料一致、卸下消失、名稱互不重疊與可點擊、原始損壞存檔下載。 |
| `ITEM_EDGE_TEST.json` | 10 項通過；密集掉落捲動、pointerdown/up中間render仍可點擊、怪物刷新保留掉落、序號驗證、真實檔案匯入拒絕/復原、重開與三組舊存檔 sentinel。 |
| `COMBAT_GEOMETRY_TEST.json` | 原Boss 20旋轉/邊界 +16時序案例通過。 |
| `COMBAT_INTEGRATION_TEST.json` | 原Boss 24個30/60Hz內/外/背遊戲案例通過；零錯誤/缺失資源。 |
| `PRESERVATION_TEST.json` | 封存包及人物/Boss來源檔 hash 比對。 |

腳本：`tools/qa-items.cjs`、`tools/qa-items-visual.cjs`、`tools/qa-items-edges.cjs`、`tools/regression-test-combat-geometry.cjs`、`tools/regression-qa-boss-combat.cjs`。`implement-inventory.cjs` 與文字片段是初次實作歷史，請勿對成品重跑。

第一輪已發現並修正的小尺寸預覽捲動、密集標籤避讓、展開清單重繪問題。測試程式曾把損壞字串寫在正常頁面 pagehide 前，因正常關頁儲存覆蓋而產生錯誤測試；已改成新頁載入前植入，實際保護與復原均通過。失敗探索記錄只保留本機歷史，不當成功證据。

## 動態與畫面證據

- `qa/final/R10.4-equipment-drop-workflow.webp`：全彩主證據，16.932秒；107個來源畫面（UI畫面刻意停留便於讀取），編碼後36個不同畫面。實際擊殺/走近為60Hz模擬、12Hz截取。
- `qa/final/R10.4-equipment-drop-workflow.gif`：方便播放的副本；色彩量化較粗，以WebP或PNG判斷美術。
- `qa/final/R10.4-workflow-contact-sheet.png` 和 `all-decoded-workflow-frames.png`：已實際觀看；全部36解碼畫面已檢視，關鍵操作另有全尺寸PNG。
- `qa/workflow/0000.png`～`0106.png`：107來源画面保留本機。`ITEM_UI_TEST.json` 有逐幀標籤與UI停留資訊。
- 可先看 `07-enhanced.png`、`10-reloaded-ground.png`、`13-full-bag-unequip-protected.png`、`bag-detail-667.png`、`ground-cluster-667.png`、`overflow-last-item-scroll.png`、`corrupt-save-protected.png`。

## 新增單張人物圖需求

使用者另行要求的 `R10-current-character-preview.png` 已新截目前R10.4實際裝備面板與場上人物並成功建立Library單檔：`libfile_f4520b1eddfc819197d5a27b1b198a26` / `file_00000000486481f5b79820a95dd5ea47`。官方當前 metadata helper 在Windows因 `os.setxattr` 不存在失敗；雲端建檔成功，本機metadata未保存，helper未修改。此新單檔不屬先前失敗的最終ZIP/GIF批次，該批次沒有重試。

## 尚未宣稱

未實測物理iPhone、Safari、PWA或離線安裝；沒有部署、push、購買、付費生成、系統安裝。第三項父任務獨立驗收尚待完成；第四項自然戰鬥未開始。最終ZIP與動態證據僅本機保存，依委派要求由父任務安排最終交付。

## 使用者追加的常駐裝備發光要求（R10.4.1）

已重新實看原7圖中 B20935ED、28A183F8、2370837F、FEA8A161 四個構圖。新增 r10-equipment-glow.js：真正的 emissive 白金劍紋、橙紅窄halo、局部火焰、胸肩翼甲亮紋與寶石光點；品質框加光暈。全部使用既有劍/甲/骨架掛點，沒有修改骨骼或動作。普通品質無光，稀有/史詩/傳說逐級提升；+15比+0強，卸下光組隱藏。

GLOW_ATTACHMENT_TEST.json 的144個八向待機/走路/攻擊取樣，與相同初始狀態的原人物模組比較，骨骼差0；無裝備時兩組光全部關閉。已實看前/背/走/攻四圖與新待機合成圖。新增光效後 ITEM_UI_TEST_GLOW.json 的26項流程斷言再通過（另零browsererror）；ITEM_VISUAL_TEST.json 的18項重跑通過。功能workflow WebP是R10.4原流程錄製，R10.4.1追加效果另見 R10.4.1-idle-equipment-glow.webp，不將舊片冒充新發光錄影。

第二個使用者明確新單圖請求 R10-character-glow-preview.png 已成功建立Library：libfile_d2a1a1cfc3b481918d07b7d5856ef9d3 / file_00000000244481f5a8dabb23aa208bb2；標示傳說武器+0與胸甲+0。父任務已原生附圖並實看，確認白金刃芯、金橙窄外光及品質框可見。官方metadatahelper在Windows仍因os.setxattr不可用失敗，沒有改helper；雲端建檔成功。

第四項具體參照與父任務實看影片觀察另保存在 STAGE4_REFERENCE_NOTES.md，待第三項獨立驗收後再開始。

新發光影片 qa/final/R10.4.1-idle-equipment-glow.webp：85個不同畫面，7.055秒，實際60Hz遊戲模擬/12Hz截取；涵蓋傳說+0待機、實際搖桿行走、實際攻擊按鈕、史詩、普通、卸下、傳說+15。後四種是明確記錄的品質/強化QA fixture，沒有冒稱正常遊戲取得。85個解碼畫面接觸表與五個全尺寸關鍵畫面已實看。
