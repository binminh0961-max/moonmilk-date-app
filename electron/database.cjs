const path = require('path');
const fs = require('fs');

let db = null;
let dbEngine = 'node:sqlite'; // 'node:sqlite' hoặc 'better-sqlite3'

/**
 * Khởi tạo Database SQLite và tạo cấu trúc bảng chuẩn 3NF
 * Tự động chọn giữa Node.js built-in 'node:sqlite' (Node 22+) hoặc 'better-sqlite3'
 * @param {string} customDbPath Đường dẫn file db tùy chọn
 */
function initDatabase(customDbPath) {
  const dbPath = customDbPath || path.join(process.cwd(), 'moonmilk.sqlite');

  // Đảm bảo thư mục cha tồn tại
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Ưu tiên 1: better-sqlite3 (Driver chuẩn, tối ưu và nhanh nhất cho Electron)
  try {
    const Database = require('better-sqlite3');
    db = new Database(dbPath);
    dbEngine = 'better-sqlite3';
    console.log(`[Database] Đã nạp thành công better-sqlite3 engine tại: ${dbPath}`);
  } catch (err1) {
    // Ưu tiên 2: node:sqlite (nếu chạy dưới môi trường Node 22+ có hỗ trợ)
    try {
      const { DatabaseSync } = require('node:sqlite');
      db = new DatabaseSync(dbPath);
      dbEngine = 'node:sqlite';
      console.log(`[Database] Sử dụng Node.js built-in SQLite engine tại: ${dbPath}`);
    } catch (err2) {
      console.error('❌ [Database Error] Lỗi nạp better-sqlite3:', err1.message);
      console.error('❌ [Database Error] Lỗi nạp node:sqlite:', err2.message);
      throw new Error(
        'Không tìm thấy SQLite driver phù hợp cho Electron. ' +
        'Vui lòng chạy: npm run rebuild:electron'
      );
    }
  }

  // Kích hoạt hỗ trợ khóa ngoại Foreign Keys & chế độ WAL
  try {
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');
  } catch (e) {
    console.warn('[Database] Cảnh báo kích hoạt pragma:', e.message);
  }

  createTables();
  seedInitialDataIfEmpty();

  return db;
}

/**
 * Tạo bảng Product và Batch theo chuẩn 3NF
 * - 1NF: Dữ liệu nguyên tử, mỗi dòng có khóa chính id
 * - 2NF: Khóa chính đơn (id), các thuộc tính không khóa phụ thuộc hoàn toàn vào id
 * - 3NF: Không phụ thuộc bắc cầu (transitive dependency). Thông tin sản phẩm (name, shelf_location)
 *        nằm ở bảng products, thông tin lô (quantity, expiry_date) nằm ở bảng batches
 */
function createTables() {
  const schema = `
    -- Bảng 1: Danh mục Sản phẩm (Master Product)
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT DEFAULT 'Bách hóa',
      shelf_location TEXT NOT NULL,
      warning_days INTEGER DEFAULT 7,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Bảng 2: Lô hàng và Hạn sử dụng (Batch / Inventory Lot)
    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      batch_code TEXT,
      quantity INTEGER NOT NULL CHECK (quantity >= 0),
      expiry_date TEXT NOT NULL, -- Định dạng chuẩn ISO YYYY-MM-DD
      is_resolved INTEGER DEFAULT 0 CHECK (is_resolved IN (0, 1)), -- 0: Đang bày bán, 1: Đã xử lý
      resolved_at DATETIME NULL,
      note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Chỉ mục (Indexes) tối ưu hóa truy vấn tìm kiếm và lọc hạn
    CREATE INDEX IF NOT EXISTS idx_batches_expiry ON batches (expiry_date);
    CREATE INDEX IF NOT EXISTS idx_batches_resolved ON batches (is_resolved);
    CREATE INDEX IF NOT EXISTS idx_batches_product_id ON batches (product_id);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);

    -- Bảng 3: Cấu hình hệ thống & Email thông báo (Settings - 1 record duy nhất)
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      sender_email TEXT NOT NULL DEFAULT '',
      app_password TEXT NOT NULL DEFAULT '',
      receiver_emails TEXT NOT NULL DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.exec(schema);

  // Khởi tạo bản ghi mặc định cho settings nếu chưa tồn tại
  try {
    db.exec(`
      INSERT OR IGNORE INTO settings (id, sender_email, app_password, receiver_emails)
      VALUES (1, '', '', '');
    `);
  } catch (e) {
    console.warn('[Database] Khởi tạo settings mặc định:', e.message);
  }
}

/**
 * Chèn dữ liệu mẫu thực tế nếu database đang trống
 */
function seedInitialDataIfEmpty() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (!countRow || countRow.count === 0) {
    const today = new Date();
    const formatDate = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    const insertProductStmt = db.prepare(`
      INSERT INTO products (name, category, shelf_location, warning_days)
      VALUES (?, ?, ?, ?)
    `);

    const insertBatchStmt = db.prepare(`
      INSERT INTO batches (product_id, batch_code, quantity, expiry_date, is_resolved, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Dữ liệu mẫu phong phú phản ánh ngay 3 trạng thái Đỏ, Vàng, Xanh
    const seedItems = [
      {
        name: 'Sữa chua TH True Milk Nha Đam 100g',
        category: 'Sữa & Bơ sữa',
        shelf: 'Tủ mát B1-02',
        warningDays: 5,
        batchCode: 'LOT-TH-8902',
        qty: 16,
        offset: -3, // 🔴 Hết hạn 3 ngày trước
        resolved: 0,
        note: 'Hạ kệ chờ lập biên bản hủy'
      },
      {
        name: 'Bánh mì hoa cúc Harrys Brioche 515g',
        category: 'Bánh tươi',
        shelf: 'Kệ A3-01',
        warningDays: 5,
        batchCode: 'LOT-HR-4412',
        qty: 7,
        offset: -1, // 🔴 Hết hạn hôm qua
        resolved: 0,
        note: 'Thu hồi khỏi quầy trưng bày'
      },
      {
        name: 'Xúc xích tiệt trùng Heo Vissan 200g',
        category: 'Thực phẩm chế biến',
        shelf: 'Kệ A1-04',
        warningDays: 7,
        batchCode: 'LOT-VS-5521',
        qty: 24,
        offset: 2, // 🟡 Còn 2 ngày
        resolved: 0,
        note: 'Dán tem ưu đãi giảm 40%'
      },
      {
        name: 'Phô mai Lát Con Bò Cười Hộp 200g',
        category: 'Sữa & Bơ sữa',
        shelf: 'Tủ mát C2-05',
        warningDays: 7,
        batchCode: 'LOT-CB-1109',
        qty: 12,
        offset: 5, // 🟡 Còn 5 ngày
        resolved: 0,
        note: 'Đưa lên mặt trước kệ'
      },
      {
        name: 'Nước khoáng thiên nhiên LaVie 500ml',
        category: 'Đồ uống',
        shelf: 'Kệ E2-03',
        warningDays: 14,
        batchCode: 'LOT-LV-9921',
        qty: 140,
        offset: 120, // 🟢 Còn 120 ngày (An toàn)
        resolved: 0,
        note: 'Lô hàng mới nhập kho'
      },
      {
        name: 'Mì ăn liền Hảo Hảo Tôm chua cay 75g',
        category: 'Thực phẩm khô',
        shelf: 'Kệ A2-01',
        warningDays: 15,
        batchCode: 'LOT-HH-6632',
        qty: 360,
        offset: 90, // 🟢 Còn 90 ngày (An toàn)
        resolved: 0,
        note: 'Hạn dùng dài tiêu chuẩn'
      },
      {
        name: 'Pate gan Hạ Long Hộp 150g',
        category: 'Đồ hộp',
        shelf: 'Kệ B3-04',
        warningDays: 7,
        batchCode: 'LOT-HL-3301',
        qty: 5,
        offset: -4,
        resolved: 1, // Đã xử lý
        note: 'Đã hoàn tất thanh lý'
      }
    ];

    for (const item of seedItems) {
      const prodRes = insertProductStmt.run(item.name, item.category, item.shelf, item.warningDays);
      const prodId = prodRes.lastInsertRowid;
      insertBatchStmt.run(
        prodId,
        item.batchCode,
        item.qty,
        formatDate(item.offset),
        item.resolved,
        item.note
      );
    }
  }
}

/**
 * Lấy danh sách toàn bộ Lô hàng kèm thông tin Sản phẩm (JOIN theo chuẩn 3NF)
 */
function getAllBatches() {
  const query = `
    SELECT 
      b.id AS batch_id,
      b.batch_code,
      b.quantity,
      b.expiry_date,
      b.expiry_date AS expiration_date,
      b.is_resolved,
      b.resolved_at,
      b.note,
      b.created_at AS batch_created_at,
      p.id AS product_id,
      p.name AS product_name,
      p.shelf_location,
      p.shelf_location AS location,
      p.category,
      p.warning_days,
      CAST(ROUND(julianday(b.expiry_date) - julianday(date('now', 'localtime'))) AS INTEGER) AS days_remaining,
      CASE 
        WHEN (julianday(b.expiry_date) - julianday(date('now', 'localtime'))) <= 15 THEN 'RED'
        WHEN (julianday(b.expiry_date) - julianday(date('now', 'localtime'))) <= 30 THEN 'YELLOW'
        ELSE 'GREEN'
      END AS alert_color
    FROM batches b
    INNER JOIN products p ON b.product_id = p.id
    ORDER BY b.is_resolved ASC, b.expiry_date ASC
  `;
  return db.prepare(query).all();
}

/**
 * Đánh dấu lô hàng là "Đã xử lý" hoặc chuyển đổi trạng thái
 */
function toggleBatchResolved(batchId, resolvedStatus) {
  const now = resolvedStatus ? new Date().toISOString() : null;
  const stmt = db.prepare(`
    UPDATE batches
    SET is_resolved = ?, resolved_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(resolvedStatus ? 1 : 0, now, Number(batchId));
  return { success: true, batchId, resolved: resolvedStatus };
}

/**
 * Thêm mới lô hàng (tự động tạo Product nếu chưa tồn tại hoặc cập nhật kệ hàng)
 */
function createBatch({ productName, shelfLocation, quantity, expiryDate, category = 'Bách hóa', note = '' }) {
  const trimmedName = productName.trim();
  const trimmedLocation = shelfLocation.trim();

  // Kiểm tra xem sản phẩm đã có trong danh mục chưa
  let product = db.prepare('SELECT id, shelf_location FROM products WHERE name = ?').get(trimmedName);

  if (!product) {
    // Tạo mới sản phẩm trong bảng products
    const res = db.prepare(`
      INSERT INTO products (name, category, shelf_location)
      VALUES (?, ?, ?)
    `).run(trimmedName, category, trimmedLocation);

    product = { id: res.lastInsertRowid, shelf_location: trimmedLocation };
  } else if (trimmedLocation && product.shelf_location !== trimmedLocation) {
    // Cập nhật vị trí kệ mới nhất
    db.prepare(`
      UPDATE products 
      SET shelf_location = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(trimmedLocation, product.id);
  }

  // Tạo mã lô hàng tự động
  const batchCode = `LOT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

  // Thêm lô hàng vào bảng batches
  const batchRes = db.prepare(`
    INSERT INTO batches (product_id, batch_code, quantity, expiry_date, is_resolved, note)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(product.id, batchCode, parseInt(quantity, 10), expiryDate, note);

  return {
    batchId: batchRes.lastInsertRowid,
    productId: product.id,
    batchCode,
    productName: trimmedName,
    shelfLocation: trimmedLocation,
    quantity: parseInt(quantity, 10),
    expiryDate,
    isResolved: 0
  };
}

/**
 * Xóa một lô hàng khỏi hệ thống
 */
function deleteBatch(batchId) {
  const stmt = db.prepare('DELETE FROM batches WHERE id = ?');
  const res = stmt.run(Number(batchId));
  return { success: res.changes > 0 };
}

/**
 * Cập nhật thông tin lô hàng và sản phẩm liên quan
 */
function updateBatch(batchId, { productName, shelfLocation, quantity, expiryDate, note }) {
  const batch = db.prepare('SELECT id, product_id FROM batches WHERE id = ?').get(Number(batchId));
  if (!batch) {
    throw new Error(`Không tìm thấy lô hàng với ID #${batchId}`);
  }

  // Cập nhật thông tin sản phẩm nếu có
  if (productName || shelfLocation) {
    const currentProd = db.prepare('SELECT id, name, shelf_location FROM products WHERE id = ?').get(batch.product_id);
    if (currentProd) {
      const newName = productName !== undefined ? productName.trim() : currentProd.name;
      const newLocation = shelfLocation !== undefined ? shelfLocation.trim() : currentProd.shelf_location;
      db.prepare(`
        UPDATE products 
        SET name = ?, shelf_location = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(newName, newLocation, currentProd.id);
    }
  }

  // Cập nhật thông tin bảng batches
  const updateBatchStmt = db.prepare(`
    UPDATE batches
    SET 
      quantity = COALESCE(?, quantity),
      expiry_date = COALESCE(?, expiry_date),
      note = COALESCE(?, note),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const qty = quantity !== undefined && quantity !== '' ? parseInt(quantity, 10) : null;
  updateBatchStmt.run(qty, expiryDate || null, note !== undefined ? note : null, Number(batchId));

  return { success: true, batchId };
}

/**
 * Lấy danh sách sản phẩm để gợi ý (Autocomplete)
 */
function getProductSuggestions() {
  const query = 'SELECT id, name, shelf_location, category FROM products ORDER BY name ASC';
  return db.prepare(query).all();
}

/**
 * ==============================================================================
 * CẤU HÌNH HỆ THỐNG / EMAIL (SETTINGS)
 * ==============================================================================
 */

/**
 * Lấy cấu hình email hiện tại từ bảng settings (1 record duy nhất với id = 1)
 * @returns {{ sender_email: string, app_password: string, receiver_emails: string }}
 */
function getSettings() {
  try {
    const row = db.prepare('SELECT sender_email, app_password, receiver_emails FROM settings WHERE id = 1').get();
    return row || { sender_email: '', app_password: '', receiver_emails: '' };
  } catch (error) {
    console.error('❌ [Database Error] Lỗi khi lấy cấu hình settings:', error.message);
    return { sender_email: '', app_password: '', receiver_emails: '' };
  }
}

/**
 * Lưu hoặc cập nhật cấu hình email vào bảng settings
 * @param {object} data
 * @param {string} data.sender_email Email gửi (Sender Email)
 * @param {string} data.app_password Mật khẩu ứng dụng (App Password)
 * @param {string} data.receiver_emails Danh sách email nhận (cách nhau bởi dấu phẩy)
 * @returns {{ success: boolean, message: string, data: object }}
 */
function saveSettings(data = {}) {
  try {
    const sender_email = (data.sender_email || '').trim();
    const app_password = (data.app_password || '').trim();
    const receiver_emails = (data.receiver_emails || '').trim();

    const stmt = db.prepare(`
      INSERT INTO settings (id, sender_email, app_password, receiver_emails, updated_at)
      VALUES (1, @sender_email, @app_password, @receiver_emails, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        sender_email = excluded.sender_email,
        app_password = excluded.app_password,
        receiver_emails = excluded.receiver_emails,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run({
      sender_email,
      app_password,
      receiver_emails
    });

    console.log('[Database] Đã lưu cấu hình email thành công.');
    return {
      success: true,
      message: 'Lưu cấu hình Email thành công!',
      data: { sender_email, app_password, receiver_emails }
    };
  } catch (error) {
    console.error('❌ [Database Error] Lỗi khi lưu cấu hình settings:', error.message);
    throw error;
  }
}

module.exports = {
  initDatabase,
  getAllBatches,
  toggleBatchResolved,
  createBatch,
  updateBatch,
  deleteBatch,
  getProductSuggestions,
  getSettings,
  saveSettings,
};
