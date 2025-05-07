$(document).ready(function () {
  // 1. 匯入檔案
  $('#importFile').on('click', async () => {
    const file = await window.api.selectFile(); // 新增選擇檔案邏輯
    if (file) {
      await window.api.importFile(file); 
      alert('檔案匯入成功');
    }
  });

  // 2. 匯入目錄
  $('#importDir').on('click', async () => {
    const dir = await window.api.selectDirectory();
    if (dir) {
      await window.api.importDirectory(dir);
      alert('目錄匯入完成');
    }
  });

  // 3. 清理資料庫
  $('#cleanDb').on('click', async () => {
    const removed = await window.api.cleanDatabase();
    alert(`已移除 ${removed} 筆不存在的檔案`);
  });

  // 4. 查詢資料庫
  $('#searchBtn').on('click', async () => {
      const keyword = $('#searchInput').val().trim();
      const results = await window.api.searchNotes(keyword);
      $('#resultList').empty();
      results.forEach(note => {
        const $li = $(`<li class="note-card"> <div class="note-info"> <div class="note-title"></div> <div class="note-path"></div> </div> <div class="note-actions"> <button class="btn-folder">📂</button> <button class="btn-vscode">📝</button> </div> </li>`);
        $li.find('.note-title').text(note.title);
        $li.find('.note-path').text(note.path);
        $li.find('.btn-folder').data('path', note.path);
        $li.find('.btn-vscode').data('path', note.path);
        $('#resultList').append($li);
      });
    });

    // 按 Enter 時觸發搜尋按鈕
    $('#searchInput').on('keydown', function (e) {
      if (e.key === 'Enter') {
        $('#searchBtn').click();
      }
    });
    
    // 用事件代理監聽按鈕點擊（支援動態產生）
    $('#resultList').on('click', '.btn-folder', function () {
      const filePath = $(this).data('path');
      window.api.openFolder(filePath);
    });
    
    $('#resultList').on('click', '.btn-vscode', function () {
      const filePath = $(this).data('path');
      window.api.openWithVSCode(filePath);
    });

});
