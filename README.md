Markdown Indexer
================

📁 一款跨平台 (Windows/macOS) 的桌面應用，讓你快速整理與查詢本機的 Markdown (.md) 檔案。

* * *

🔧 功能特色
-------

*   ✅ 支援選擇單一檔案或整個目錄進行索引匯入
    
*   ✅ 自動解析 Markdown 檔案內的 YAML Front Matter，如 title、category、tags、keywords
    
*   ✅ 資料儲存於 SQLite 資料庫，可快速搜尋
    
*   ✅ 可直接從搜尋結果中：
    
    *   🔍 開啟檔案所在目錄
        
    *   📝 透過 VS Code 開啟該檔案
        
*   ✅ 清除功能：可移除資料庫中已不存在的檔案紀錄
    
*   ✅ UI 使用純 HTML + jQuery，簡潔明瞭
    

* * *

📦 安裝方式
-------

請確認你已安裝以下環境：

*   Node.js (建議 v18 以上)
    
*   Git
    
*   VS Code（如果要使用 "用 VSCode 開啟" 功能）
    

步驟如下：

1.  將專案 Clone 下來：
    
    ```bash
    git clone https://github.com/vaga0/markdownFileIndex.git
    cd markdownFileIndex
    ```
    
2.  安裝相依套件：
    
    ```bash
    npm install
    ```
    
3.  啟動應用程式：
    
    ```bash
    npm start
    ```
    

* * *

📁 Markdown Header 格式規範（Front Matter）
-------------------------------------

.md 檔案應包含 YAML 格式的 meta header，例如：

```markdown
---
title: 我的筆記
category: 技術
tags: [javascript, node]
keywords: [express, middleware]
---
```

這些欄位將被用來建立資料庫索引，方便你日後搜尋與整理。

* * *

🗂 操作說明
-------

*   「匯入檔案」：選擇單一 .md 檔案並加入資料庫
    
*   「匯入目錄」：遞迴讀取該資料夾下所有 .md 檔案並加入資料庫
    
*   「清除已刪除項目」：比對資料庫與實際檔案系統，刪除不存在的檔案紀錄
    
*   「搜尋」：輸入關鍵字查詢符合 title、tags、category、keywords 任一欄位的記錄
    
*   查詢結果提供：
    
    *   📂 開啟目錄（於檔案總管 / Finder 中）
        
    *   📝 以 VS Code 開啟該檔案
        

* * *

🧩 注意事項
-------

*   若 VS Code 無法開啟檔案，請確認 code CLI 工具已加入環境變數（打開終端機執行 code 測試）。
    
*   Windows 下支援包含中文或空格的路徑，但請確認路徑字元正確傳遞。
    

* * *
