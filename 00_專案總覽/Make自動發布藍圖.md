# Make 自動發布藍圖

## 目標流程

### 第一階段：每日副本

1. 玩家說：「GM！開啟今日副本！」
2. GM 抽出引路角色、製作卡面並發布今日任務。
3. 玩家確認圖片與貼文，說：「核准發布今日副本。」
4. GM 將 Notion 項目的發布狀態改為「核准發布」。
5. Make 取得 OneDrive 圖檔與 Notion 文案，發布至 Instagram。
6. Make 回寫 Instagram 貼文網址、發布時間與狀態。

### 第二階段：故事結算

1. 玩家完成今日任務故事。
2. GM 保留原文、整理故事、計算點數並製作成就卡。
3. GM 將故事與成就卡同步至本機及 Notion。
4. 玩家確認內容，說：「核准發布今日結算。」
5. Make 將故事頁與成就卡組成 Instagram 輪播並發布。
6. Make 回寫 Instagram 貼文網址、發布時間與圖鑑狀態。

## 角色分工

- 玩家：寫故事並做最後發布確認。
- GM：抽卡、出題、出圖、整理故事、計分、建立成就卡及更新 Notion。
- Notion：內容中控台、審核開關與永久紀錄。
- OneDrive：存放 Make 能取得的正式圖片。
- Make：讀取核准項目、發布 Instagram、回寫發布結果。

## Notion 建議欄位

- 名稱
- DAY
- 發布批次：今日副本／今日結算
- IG 文案
- 圖檔名稱
- OneDrive 圖檔路徑
- 發布狀態：草稿／待確認／核准發布／發布中／已發布／發布失敗
- 核准發布：核取方塊
- IG 貼文網址
- IG Media ID
- 發布時間
- 錯誤訊息

## Make Scenario A：發布今日副本

1. Notion：Watch Data Source Items。
2. Filter：發布批次等於「今日副本」、核准發布為 true、發布狀態不等於「已發布」。
3. OneDrive：依圖檔路徑取得並下載圖片。
4. Instagram for Business：Create a Photo Post。
5. Notion：更新發布狀態、IG Media ID、網址與發布時間。
6. Error Handler：將發布狀態改為「發布失敗」，並回寫錯誤訊息。

## Make Scenario B：發布今日結算

1. Notion：Watch Data Source Items。
2. Filter：發布批次等於「今日結算」、核准發布為 true、發布狀態不等於「已發布」。
3. OneDrive：下載故事頁、成就卡及其他輪播圖片。
4. Instagram for Business：Create a Carousel Post。
5. Notion：更新發布狀態、IG Media ID、網址與發布時間。
6. Error Handler：將發布狀態改為「發布失敗」，並回寫錯誤訊息。

## 安全規則

- 未勾選「核准發布」時，Make 不得發布。
- 發布成功後立即取消核准勾選，避免重複發文。
- 使用 IG Media ID 或發布批次 ID 做重複檢查。
- Make 情境採循序處理，避免同一天兩個批次順序顛倒。
- 正式發布只讀取 OneDrive 的「正式輸出」資料夾，不讀取「待確認」。
- Webhook 網址、API 金鑰及存取憑證不得寫入 Notion 公開頁面或貼文內容。

