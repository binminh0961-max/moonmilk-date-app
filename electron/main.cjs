const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const database = require('./database.cjs');
const mailer = require('./mailer.cjs');

let mainWindow = null;

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 680,
    title: 'Quản Lý Hạn Sử Dụng Sản Phẩm',
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Để better-sqlite3 giao tiếp trơn tru trong main
    },
    // Modern frame settings
    autoHideMenuBar: true,
    show: false, // Tránh nhấp nháy trắng trước khi render
  });

  // Khởi tạo Database SQLite
  try {
    const dbPath = isDev
      ? path.join(__dirname, '..', 'moonmilk.sqlite')
      : path.join(app.getPath('userData'), 'moonmilk.sqlite');

    console.log(`[Database] Đang khởi tạo SQLite tại: ${dbPath}`);
    database.initDatabase(dbPath);
  } catch (error) {
    console.error('[Database Error] Không thể khởi tạo SQLite:', error);
    dialog.showErrorBox('Lỗi Cơ Sở Dữ Liệu', `Không thể mở SQLite: ${error.message}`);
  }

  // Phân luồng nạp giao diện Dev / Prod
  if (isDev) {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    console.log(`[Electron] Đang chạy chế độ DEV -> kết nối tới: ${devServerUrl}`);
    mainWindow.loadURL(devServerUrl);
    
    // Tắt tự động mở DevTools (khi nào cần bạn có thể nhấn Ctrl + Shift + I để mở thủ công)
    // mainWindow.webContents.openDevTools();
  } else {
    const prodPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log(`[Electron] Đang chạy chế độ PROD -> nạp file: ${prodPath}`);
    mainWindow.loadFile(prodPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ==========================================
// CẤU HÌNH IPC HANDLERS GIAO TIẾP VỚI REACT
// ==========================================

// 1. Lấy danh sách cảnh báo / lô hàng
ipcMain.handle('db:get-alerts', async () => {
  try {
    const batches = database.getAllBatches();
    return batches;
  } catch (err) {
    console.error('❌ [SQLite Error - db:get-alerts]:', err.message);
    console.error('Stack trace:', err.stack);
    throw new Error(`Lỗi SQLite khi truy vấn danh sách: ${err.message}`);
  }
});

// Giữ alias db:get-all-batches để tương thích ngược
ipcMain.handle('db:get-all-batches', async () => {
  try {
    return database.getAllBatches();
  } catch (err) {
    console.error('❌ [SQLite Error - db:get-all-batches]:', err.message);
    throw err;
  }
});

// 2. Thêm mới / Lưu lô hàng
ipcMain.handle('db:save-batch', async (_event, data) => {
  try {
    console.log('[IPC] Nhận yêu cầu db:save-batch:', data);
    const result = database.createBatch(data);
    return result;
  } catch (err) {
    console.error('❌ [SQLite Error - db:save-batch]:', err.message);
    console.error('Dữ liệu đầu vào gây lỗi:', JSON.stringify(data, null, 2));
    console.error('Stack trace:', err.stack);
    throw new Error(`Lỗi SQLite khi lưu lô hàng: ${err.message}`);
  }
});

// Giữ alias db:create-batch
ipcMain.handle('db:create-batch', async (_event, data) => {
  try {
    return database.createBatch(data);
  } catch (err) {
    console.error('❌ [SQLite Error - db:create-batch]:', err.message);
    console.error('Dữ liệu đầu vào gây lỗi:', data);
    throw err;
  }
});

ipcMain.handle('db:toggle-resolved', async (_event, { batchId, status }) => {
  try {
    return database.toggleBatchResolved(batchId, status);
  } catch (err) {
    console.error('❌ [SQLite Error - db:toggle-resolved]:', err.message);
    throw err;
  }
});

ipcMain.handle('db:delete-batch', async (_event, batchId) => {
  try {
    return database.deleteBatch(batchId);
  } catch (err) {
    console.error('❌ [SQLite Error - db:delete-batch]:', err.message);
    throw err;
  }
});

ipcMain.handle('db:update-batch', async (_event, payload) => {
  try {
    const { batchId, id, ...data } = payload;
    const targetId = batchId || id;
    return database.updateBatch(targetId, data);
  } catch (err) {
    console.error('❌ [SQLite Error - db:update-batch]:', err.message);
    throw err;
  }
});

ipcMain.handle('db:get-product-suggestions', async () => {
  try {
    return database.getProductSuggestions();
  } catch (err) {
    console.error('❌ [SQLite Error - db:get-product-suggestions]:', err.message);
    throw err;
  }
});

// ==========================================
// CẤU HÌNH EMAIL & SETTINGS IPC HANDLERS
// ==========================================

// 1. Lấy cấu hình email hiện tại
ipcMain.handle('settings:get', async () => {
  try {
    return database.getSettings();
  } catch (err) {
    console.error('❌ [IPC Error - settings:get]:', err.message);
    throw err;
  }
});
// Alias channel tương thích ngược
ipcMain.handle('db:get-settings', async () => database.getSettings());

// 2. Lưu hoặc cập nhật cấu hình email
ipcMain.handle('settings:save', async (_event, data) => {
  try {
    console.log('[IPC] Lưu cài đặt email:', {
      sender_email: data?.sender_email,
      receiver_emails: data?.receiver_emails,
      has_password: Boolean(data?.app_password),
    });
    return database.saveSettings(data);
  } catch (err) {
    console.error('❌ [IPC Error - settings:save]:', err.message);
    throw err;
  }
});
// Alias channel tương thích ngược
ipcMain.handle('db:save-settings', async (_event, data) => database.saveSettings(data));

// 3. Gửi email thử nghiệm từ giao diện Cài đặt
ipcMain.handle('mail:send-test', async () => {
  try {
    return await mailer.sendTestEmail();
  } catch (err) {
    console.error('❌ [IPC Error - mail:send-test]:', err.message);
    throw err;
  }
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  // Khởi động Cronjob quét hạn sử dụng tự động (8:00 sáng mỗi ngày)
  try {
    mailer.startCronJob('0 8 * * *');
  } catch (cronErr) {
    console.error('❌ [Cronjob] Không thể khởi động cron:', cronErr.message);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  mailer.stopCronJob();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
