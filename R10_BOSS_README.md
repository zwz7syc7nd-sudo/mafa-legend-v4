# R10.3 黑紅魔龍

接續 R10.2 已接受人物與既有 Boss 骨架試製，這一階段只處理 Boss。人物的程式與資產保留不變。

在此目錄執行 `node serve.cjs`，開啟 `http://127.0.0.1:8144/`。獨立模型與動作檢視在 `/boss-lab.html`，可轉動視角、播放、拖曳時間與關閉發光。請透過本機 HTTP 開啟，不使用 `file://`。

魔龍具有完整頭、上下顎、彎角、胸腹、四肢、爪、翼膜、翼骨與尾部。黑鱗隨 32 節骨架變形；近身爪擊、震地、吐息與衝撞的預警、傷害與實際接觸位置已對齊。

寬度 960 px 以下自動採平衡細節。需要比較時可使用 `?bossQuality=high`、`?bossQuality=balanced`、`?bossQuality=low`。三種細節保留相同骨架、輪廓與動作；不改變命中判定。

存檔 key 是 `mafa-r10-boss-stage2-task4-v2`，不自動匯入舊角色存檔。預設 8144 origin 與先前人物本機 origin 分開。

這是供獨立 QA 的本機階段 checkpoint；尚未部署或上傳。桌面與代表手機尺寸的 Chromium 畫面已檢查，尚未實测 iPhone、Safari、PWA 或離線安裝。第三項裝備掉寶與第四項自然戰鬥不在這次修改範圍。

詳見外層 `qa/STAGE2_HANDOFF.md`、測試 JSON、動態 GIF 與連續畫面。
