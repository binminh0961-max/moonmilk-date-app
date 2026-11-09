/**
 * ============================================================================
 * DATABASE.CJS - COMMONJS MODULE QUẢN LÝ CƠ SỞ DỮ LIỆU SQLITE (CHUẨN 3NF)
 * Ứng dụng: Quản lý hạn sử dụng sản phẩm (Moonmilk Desktop App)
 * ============================================================================
 */

const path = require('path');
const fs = require('fs');

let db = null;

function getDatabaseInstance(dbFilePath) {
  try {
    const Database = require('better-sqlite3');
    return new Database(dbFilePath);
  } catch (err1) {
    try {
      const { DatabaseSync } = require('node:sqlite');
      return new DatabaseSync(dbFilePath);
    } catch (err2) {
      console.error('❌ [Database Error] Không thể nạp SQLite driver:', err1.message, err2.message);
      throw new Error('Vui lòng cài đặt better-sqlite3 hoặc sử dụng Node.js 22.5+ hỗ trợ node:sqlite');
    }
  }
}

function initDB(customPath) {
  try {
    const dbPath = customPath || path.join(process.cwd(), 'moonmilk.sqlite');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = getDatabaseInstance(dbPath);

    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        product_id TEXT PRIMARY KEY,
        product_name TEXT NOT NULL,
        category TEXT,
        warning_days INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS batches (
        batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        expiration_date DATE NOT NULL,
        quantity INTEGER,
        location TEXT,
        status TEXT DEFAULT 'TRACKING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_batches_exp_date ON batches (expiration_date);
      CREATE INDEX IF NOT EXISTS idx_batches_status ON batches (status);
      CREATE INDEX IF NOT EXISTS idx_batches_prod_id ON batches (product_id);
    `;

    db.exec(createTableQuery);
    console.log(`✅ [Database] Đã khởi tạo thành công CSDL SQLite tại: ${dbPath}`);

    seedInitialDataIfEmpty();
    return db;
  } catch (error) {
    console.error('❌ [Database Error - initDB]:', error.message);
    throw error;
  }
}

function addProduct(product_id, product_name, category = 'Bách hóa', warning_days = 15) {
  try {
    if (!db) throw new Error('Database chưa được khởi tạo. Hãy gọi initDB() trước.');

    const sql = `
      INSERT INTO products (product_id, product_name, category, warning_days)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(product_id) DO UPDATE SET
        product_name = excluded.product_name,
        category = excluded.category,
        warning_days = excluded.warning_days;
    `;

    const stmt = db.prepare(sql);
    const result = stmt.run(
      String(product_id).trim(),
      String(product_name).trim(),
      category ? String(category).trim() : 'Bách hóa',
      Number(warning_days) || 15
    );

    return {
      success: true,
      product_id,
      product_name,
      changes: result.changes
    };
  } catch (error) {
    console.error(`❌ [Database Error - addProduct(${product_id})]:`, error.message);
    throw error;
  }
}

function addBatch(product_id, expiration_date, quantity, location) {
  try {
    if (!db) throw new Error('Database chưa được khởi tạo. Hãy gọi initDB() trước.');

    const sql = `
      INSERT INTO batches (product_id, expiration_date, quantity, location, status)
      VALUES (?, ?, ?, ?, 'TRACKING')
    `;

    const stmt = db.prepare(sql);
    const result = stmt.run(
      String(product_id).trim(),
      String(expiration_date).trim(),
      Number(quantity) || 0,
      location ? String(location).trim() : 'Chưa xếp kệ'
    );

    return {
      success: true,
      batch_id: result.lastInsertRowid,
      product_id,
      expiration_date,
      quantity,
      location,
      status: 'TRACKING'
    };
  } catch (error) {
    console.error(`❌ [Database Error - addBatch]:`, error.message);
    throw error;
  }
}

function updateBatchStatus(batch_id, status = 'CLEARED') {
  try {
    if (!db) throw new Error('Database chưa được khởi tạo. Hãy gọi initDB() trước.');

    const sql = `
      UPDATE batches
      SET status = ?
      WHERE batch_id = ?
    `;

    const stmt = db.prepare(sql);
    const result = stmt.run(String(status).trim(), Number(batch_id));

    return {
      success: result.changes > 0,
      batch_id: Number(batch_id),
      status
    };
  } catch (error) {
    console.error(`❌ [Database Error - updateBatchStatus(${batch_id})]:`, error.message);
    throw error;
  }
}

function deleteBatch(batch_id) {
  try {
    if (!db) throw new Error('Database chưa được khởi tạo. Hãy gọi initDB() trước.');

    const stmt = db.prepare('DELETE FROM batches WHERE batch_id = ?');
    const result = stmt.run(Number(batch_id));

    return {
      success: result.changes > 0,
      batch_id: Number(batch_id),
      changes: result.changes
    };
  } catch (error) {
    console.error(`❌ [Database Error - deleteBatch(${batch_id})]:`, error.message);
    throw error;
  }
}

function updateBatch(batch_id, data = {}) {
  try {
    if (!db) throw new Error('Database chưa được khởi tạo. Hãy gọi initDB() trước.');

    const findStmt = db.prepare('SELECT batch_id, product_id, expiration_date, quantity, location, status FROM batches WHERE batch_id = ?');
    const currentBatch = findStmt.get(Number(batch_id));

    if (!currentBatch) {
      throw new Error(`Không tìm thấy lô hàng với ID #${batch_id}`);
    }

    const productName = data.product_name || data.productName;
    const expirationDate = data.expiration_date || data.expiryDate || data.expiry_date;
    const location = data.location || data.shelfLocation || data.shelf_location;
    const quantity = data.quantity !== undefined && data.quantity !== '' ? Number(data.quantity) : currentBatch.quantity;
    const status = data.status || currentBatch.status;
    const category = data.category;
    const warningDays = data.warning_days || data.warningDays;

    if (productName || category || warningDays) {
      const updateProdStmt = db.prepare(`
        UPDATE products
        SET 
          product_name = COALESCE(?, product_name),
          category = COALESCE(?, category),
          warning_days = COALESCE(?, warning_days)
        WHERE product_id = ?
      `);
      updateProdStmt.run(
        productName ? String(productName).trim() : null,
        category ? String(category).trim() : null,
        warningDays ? Number(warningDays) : null,
        currentBatch.product_id
      );
    }

    const updateBatchSql = `
      UPDATE batches
      SET 
        expiration_date = COALESCE(?, expiration_date),
        quantity = COALESCE(?, quantity),
        location = COALESCE(?, location),
        status = COALESCE(?, status)
      WHERE batch_id = ?
    `;

    const updateBatchStmt = db.prepare(updateBatchSql);
    const result = updateBatchStmt.run(
      expirationDate ? String(expirationDate).trim() : null,
      quantity !== undefined && !isNaN(quantity) ? quantity : null,
      location ? String(location).trim() : null,
      status ? String(status).trim() : null,
      Number(batch_id)
    );

    return {
      success: true,
      batch_id: Number(batch_id),
      changes: result.changes
    };
  } catch (error) {
    console.error(`❌ [Database Error - updateBatch(${batch_id})]:`, error.message);
    throw error;
  }
}

function getAlertList() {
  try {
    if (!db) throw new Error('Database chưa được khởi tạo. Hãy gọi initDB() trước.');

    const sql = `
      SELECT 
        b.batch_id,
        b.product_id,
        p.product_name,
        p.category,
        p.warning_days,
        b.expiration_date,
        b.quantity,
        b.location,
        b.status,
        b.created_at,
        CAST(ROUND(julianday(b.expiration_date) - julianday(date('now', 'localtime'))) AS INTEGER) AS days_remaining,
        CASE 
          WHEN (julianday(b.expiration_date) - julianday(date('now', 'localtime'))) <= 15 THEN 'RED'
          WHEN (julianday(b.expiration_date) - julianday(date('now', 'localtime'))) <= 30 THEN 'YELLOW'
          ELSE 'GREEN'
        END AS alert_color
      FROM batches b
      INNER JOIN products p ON b.product_id = p.product_id
      WHERE b.status = 'TRACKING'
      ORDER BY b.expiration_date ASC;
    `;

    const stmt = db.prepare(sql);
    const rows = stmt.all();

    return rows;
  } catch (error) {
    console.error('❌ [Database Error - getAlertList]:', error.message);
    throw error;
  }
}

function seedInitialDataIfEmpty() {
  try {
    const checkStmt = db.prepare('SELECT COUNT(*) AS count FROM products');
    const result = checkStmt.get();

    if (result.count === 0) {
      const today = new Date();
      const fmt = (offsetDays) => {
        const d = new Date(today);
        d.setDate(d.getDate() + offsetDays);
        return d.toISOString().split('T')[0];
      };

      addProduct('P001', 'Sữa chua TH True Milk Nha Đam 100g', 'Sữa & Bơ sữa', 15);
      addProduct('P002', 'Bánh mì hoa cúc Harrys Brioche 515g', 'Bánh tươi', 15);
      addProduct('P003', 'Xúc xích tiệt trùng Heo Vissan 200g', 'Thực phẩm chế biến', 15);
      addProduct('P004', 'Phô mai Lát Con Bò Cười Gói 200g', 'Sữa & Bơ sữa', 15);
      addProduct('P005', 'Mì ăn liền Hảo Hảo Tôm Chua Cay 75g', 'Thực phẩm khô', 30);
      addProduct('P006', 'Nước khoáng thiên nhiên LaVie 500ml', 'Đồ uống', 30);

      addBatch('P001', fmt(-3), 16, 'Tủ mát B1-02');
      addBatch('P002', fmt(6), 8, 'Kệ Bánh A3-01');
      addBatch('P003', fmt(12), 24, 'Kệ A1-04');
      addBatch('P004', fmt(18), 12, 'Tủ mát C2-05');
      addBatch('P002', fmt(26), 15, 'Kệ Bánh A3-02');
      addBatch('P005', fmt(90), 240, 'Kệ A2-01');
      addBatch('P006', fmt(180), 120, 'Kệ E2-03');
    }
  } catch (e) {
    console.warn('[Database] Bỏ qua seed data:', e.message);
  }
}

module.exports = {
  initDB,
  addProduct,
  addBatch,
  updateBatchStatus,
  deleteBatch,
  updateBatch,
  getAlertList,
};
