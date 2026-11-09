const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose an API object safely to the React renderer thread
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Lấy danh sách toàn bộ lô hàng / cảnh báo
  getAllBatches: () => ipcRenderer.invoke('db:get-all-batches'),
  getAlerts: () => ipcRenderer.invoke('db:get-alerts'),

  // Đánh dấu đã xử lý
  toggleBatchResolved: (batchId, status) =>
    ipcRenderer.invoke('db:toggle-resolved', { batchId, status }),

  // Thêm mới / lưu lô hàng
  createBatch: (data) => ipcRenderer.invoke('db:create-batch', data),
  saveBatch: (data) => ipcRenderer.invoke('db:save-batch', data),

  // Cập nhật lô hàng
  updateBatch: (batchId, data) =>
    ipcRenderer.invoke('db:update-batch', { batchId, ...data }),

  // Xóa lô hàng
  deleteBatch: (batchId) => ipcRenderer.invoke('db:delete-batch', batchId),

  // Lấy danh sách sản phẩm gợi ý
  getProductSuggestions: () => ipcRenderer.invoke('db:get-product-suggestions'),

  // Cấu hình Email & Hệ thống (Settings)
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (data) => ipcRenderer.invoke('settings:save', data),
  sendTestEmail: () => ipcRenderer.invoke('mail:send-test'),

  // Lắng nghe sự kiện thông báo từ Main Process nếu cần
  onDataChanged: (callback) => {
    const subscription = (_event, ...args) => callback(...args);
    ipcRenderer.on('db:changed', subscription);
    return () => ipcRenderer.removeListener('db:changed', subscription);
  },

  // Trạng thái môi trường
  isElectron: true
});
