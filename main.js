const { app, BrowserWindow, ipcMain, dialog } = require('electron');
app.commandLine.appendSwitch('disable-gpu'); // 加上這行禁用 GPU
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { exec } = require('child_process');

let win;
let db = new sqlite3.Database(path.join(__dirname, 'db', 'index.sqlite'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      filename TEXT,
      path TEXT UNIQUE,
      tags TEXT,
      category TEXT,
      keywords TEXT
    )
  `);
});

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    },
    // frame: false,  // 移除標題列（Menu）
    autoHideMenuBar: true,  // 隱藏菜單欄
  });

  win.loadFile('renderer/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 新增：選擇單一檔案
ipcMain.handle('selectFile', async () => {
  console.log('@@' + 'selectFile!');
  const result = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Markdown', extensions: ['md'] }] });
  return result.filePaths[0] || null;
});

// 新增：選擇資料夾
ipcMain.handle('selectDirectory', async () => {
  console.log('@@' + 'selectDirectory2!');
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.filePaths[0] || null;
});

ipcMain.handle('scanDirectory', async (event, dir) => {
  const files = [];
  const walk = (dirPath) => {
    const items = fs.readdirSync(dirPath);
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) {
        walk(itemPath);
      } else if (itemPath.endsWith('.md')) {
        const content = fs.readFileSync(itemPath, 'utf8');
        const yamlFrontMatter = require('gray-matter')(content);
        files.push({
          title: yamlFrontMatter.data.title || '無標題',
          path: itemPath,
          tags: yamlFrontMatter.data.tags || [],
          category: yamlFrontMatter.data.category || '',
          keywords: yamlFrontMatter.data.keywords || [],
        });
      }
    });
  };

  walk(dir);
  return files;
});

function parseMarkdown(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matter = require('gray-matter');
    const data = matter(content).data;
    const filename = path.parse(filePath).name; // 取得檔名（不含路徑）

    return {
      title: data.title,// || path.basename(filePath),
      path: filePath,
      filename: filename,  // 新增 filename
      tags: Array.isArray(data.tags) ? data.tags.join(',') : '',
      category: data.category || '',
      keywords: Array.isArray(data.keywords) ? data.keywords.join(',') : ''
    };
  } catch (e) {
    return null;
  }
}

function insertOrUpdateNote(note) {
  const sql = `INSERT INTO notes (title, path, filename, tags, category, keywords) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(path) DO UPDATE SET title=excluded.title, filename=excluded.filename, tags=excluded.tags, category=excluded.category, keywords=excluded.keywords`;
  db.run(sql, [note.title, note.path, note.filename, note.tags, note.category, note.keywords]);
}

// 新增：匯入單一檔案
ipcMain.handle('importFile', async (e, filePath) => {
  const note = parseMarkdown(filePath);
  if (note) insertOrUpdateNote(note);
  return note;
});

function scanDirectory(dir) {
  const results = [];const 結果 = [];
  
  const walk = (d) => {
    const items = fs.readdirSync(d);
    items.forEach(item => {
      const fullPath = path.join(d, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (fullPath.endsWith('.md')) {
        const parsed = parseMarkdown(fullPath);
        if (parsed) {
          insertOrUpdateNote(parsed);
          results.push(parsed);
        }
      }
    });
  };
  
  walk(dir);
  return results;
}

// 匯入資料夾（遞迴掃描）
ipcMain.handle('importDirectory', async (e, dirPath) => {
  const notes = scanDirectory(dirPath);
  return notes;
});

ipcMain.handle('getAllNotes', () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM notes', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

ipcMain.handle('removeNotes', async (event, paths) => {
  return new Promise((resolve, reject) => {
    const placeholders = paths.map(() => '?').join(',');
    db.run(`DELETE FROM notes WHERE path IN (${placeholders})`, paths, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

// 搜尋筆記
ipcMain.handle('searchNotes', (e, keyword) => {
  return new Promise((resolve, reject) => {
    const like = `%${keyword}%`;
    db.all(`SELECT * FROM notes WHERE title LIKE ? OR filename LIKE ? OR tags LIKE ? OR category LIKE ? OR keywords LIKE ?`, [like, like, like, like, like], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// 清除不存在的紀錄
ipcMain.handle('cleanDatabase', async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT path FROM notes', (err, rows) => {
      if (err) return reject(err);
      const missing = rows.filter(row => !fs.existsSync(row.path)).map(row => row.path);
      if (missing.length === 0) return resolve(0);
      const q = `DELETE FROM notes WHERE path IN (${missing.map(() => '?').join(',')})`;
      db.run(q, missing, function (err2) {
        if (err2) reject(err2);
        else resolve(missing.length);
      });
    });
  });
});

// 打開所在資料夾
const { shell } = require('electron');
ipcMain.handle('openFolder', (e, filePath) => {
  shell.showItemInFolder(filePath); // 可以直接顯示該檔案在檔案總管的位置
});

// 用 VSCode 開啟
const { spawn } = require('child_process');
const vscodePath = 'C:\\Program Files\\Microsoft VS Code\\Code.exe';  // 這裡請確保 VS Code 安裝路徑正確

ipcMain.handle('openWithVSCode', (e, filePath) => {
  console.log('openWithVSCode:', filePath);

  const child = spawn(vscodePath, [filePath], {
    shell: false, // 關閉 shell 模式
    windowsHide: true
  });

  child.stdout.on('data', data => {
    console.log(`VSCode stdout: ${data}`);
  });

  child.stderr.on('data', data => {
    console.error(`VSCode stderr: ${data}`);
  });

  child.on('error', error => {
    console.error('Failed to start VSCode process:', error);
  });
});