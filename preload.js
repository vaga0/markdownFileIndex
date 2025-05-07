const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // 選擇檔案
  selectFile: () => ipcRenderer.invoke('selectFile'),
  // 選擇資料夾
  selectDirectory: () => ipcRenderer.invoke('selectDirectory'),
  // 匯入檔案
  importFile: (filePath) => ipcRenderer.invoke('importFile', filePath),
  // 匯入目錄
  importDirectory: (dirPath) => ipcRenderer.invoke('importDirectory', dirPath),
  // 清理資料庫
  cleanDatabase: () => ipcRenderer.invoke('cleanDatabase'),
  // 查詢資料庫
  searchNotes: (keyword) => ipcRenderer.invoke('searchNotes', keyword),
  // 開啟目錄
  openFolder: (filePath) => ipcRenderer.invoke('openFolder', filePath),
  // 用 VSCode 開啟檔案
  openWithVSCode: (filePath) => ipcRenderer.invoke('openWithVSCode', filePath)
});
