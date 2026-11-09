# Ứng Dụng Quản Lý Hạn Sử Dụng Sản Phẩm (Desktop App)

Ứng dụng Desktop quản lý hạn sử dụng sản phẩm xây dựng bằng **Electron.js**, **React 18**, **Tailwind CSS** và **SQLite** (chuẩn hóa dữ liệu 3NF).

---

## 🚀 Khởi chạy ứng dụng

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Chạy ứng dụng Desktop (Electron + React Vite HMR)
```bash
npm run electron:dev
```

### 3. Hoặc chỉ chạy giao diện trên trình duyệt Web (Mock Preview)
```bash
npm run dev
```

---

## 🗄️ Cấu Trúc Cơ Sở Dữ Liệu SQLite (Chuẩn 3NF)

### 1. Bảng `products` (Danh mục sản phẩm)
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT UNIQUE)
- `category` (TEXT)
- `shelf_location` (TEXT) - Vị trí kệ
- `warning_days` (INTEGER DEFAULT 7) - Số ngày ngưỡng cảnh báo
- `created_at`, `updated_at`

### 2. Bảng `batches` (Lô hàng & Hạn sử dụng)
- `id` (INTEGER PRIMARY KEY)
- `product_id` (FOREIGN KEY REFERENCES products(id))
- `batch_code` (TEXT)
- `quantity` (INTEGER)
- `expiry_date` (TEXT ISO `YYYY-MM-DD`)
- `is_resolved` (INTEGER 0 | 1)
- `resolved_at` (DATETIME)
- `note` (TEXT)

---

## 🎨 Quy Ước Màu Sắc Cảnh Báo
- 🔴 **Đỏ**: Hết hạn (`< 0` ngày)
- 🟡 **Vàng**: Cận date (`≤ 7` ngày)
- 🟢 **Xanh**: An toàn (`> 7` ngày)
