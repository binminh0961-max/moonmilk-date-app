import React, { useState } from 'react';

export default function AddBatchForm({ onBatchAdded }) {
  const initialFormState = {
    productName: '',
    shelfLocation: '',
    quantity: 1,
    expiryDate: '',
    category: 'Sữa & Thực phẩm tươi',
    note: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý thay đổi các trường input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Nút bấm tiện ích: Tăng nhanh ngày hết hạn (+3, +7, +30 ngày)
  const addQuickDays = (daysToAdd) => {
    const baseDate = formData.expiryDate ? new Date(formData.expiryDate) : new Date();
    baseDate.setDate(baseDate.getDate() + daysToAdd);

    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;

    setFormData((prev) => ({
      ...prev,
      expiryDate: formatted,
    }));
  };

  // Format ngày về chuẩn ISO YYYY-MM-DD
  const formatToISODate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Định dạng ngày tháng không hợp lệ!');
    }
    // Sử dụng local components để tránh lệch timezone UTC
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Xử lý Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productName.trim()) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }
    if (!formData.expiryDate) {
      alert('Vui lòng chọn ngày hết hạn!');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Format chuỗi ngày tháng về chuẩn ISO YYYY-MM-DD
      const isoExpiryDate = formatToISODate(formData.expiryDate);

      const payload = {
        productName: formData.productName.trim(),
        shelfLocation: formData.shelfLocation.trim(),
        quantity: parseInt(formData.quantity, 10) || 1,
        expiryDate: isoExpiryDate,
        category: formData.category,
        note: formData.note.trim(),
      };

      console.log('[AddBatchForm] Chuẩn bị gửi dữ liệu:', payload);

      // 2. Gọi API Electron IPC
      if (window.electronAPI && typeof window.electronAPI.saveBatch === 'function') {
        const result = await window.electronAPI.saveBatch(payload);
        console.log('[AddBatchForm] Kết quả lưu từ SQLite:', result);
        alert('🎉 Thêm lô hàng mới vào SQLite thành công!');
      } else {
        console.warn('[AddBatchForm] window.electronAPI.saveBatch không tồn tại (chế độ Web Preview)');
        alert('Thông báo: Ứng dụng đang chạy ở chế độ Web Preview, đã mô phỏng lưu thành công!');
      }

      // 3. Reset form về ban đầu
      setFormData(initialFormState);

      // Gọi callback để cập nhật lại danh sách nếu có
      if (typeof onBatchAdded === 'function') {
        onBatchAdded();
      }
    } catch (error) {
      console.error('[AddBatchForm Error] Lỗi khi lưu lô hàng:', error);
      alert(`❌ Đã xảy ra lỗi khi lưu: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto">
      {/* Tiêu đề Form */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Khai Báo Lô Date Mới</h2>
        <p className="text-sm text-gray-500 mt-1">
          Nhập thông tin sản phẩm và ngày hết hạn in trên bao bì
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CỘT TRÁI: Tên sản phẩm & Vị trí kệ */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="VD: Sữa tươi TH True Milk 1L, Bánh mì gối..."
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Danh mục ngành hàng
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="Sữa & Thực phẩm tươi">Sữa & Thực phẩm tươi (Cảnh báo 2-3 ngày)</option>
                <option value="Đồ hộp & Gia vị">Đồ hộp & Gia vị (Cảnh báo 30 ngày)</option>
                <option value="Bánh kẹo & Snack">Bánh kẹo & Snack (Cảnh báo 15 ngày)</option>
                <option value="Đồ uống & Nước giải khát">Đồ uống (Cảnh báo 15 ngày)</option>
                <option value="Bách hóa tổng hợp">Bách hóa tổng hợp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Vị trí kệ hàng
              </label>
              <input
                type="text"
                name="shelfLocation"
                value={formData.shelfLocation}
                onChange={handleChange}
                placeholder="VD: Tủ mát 2 - Ngăn 3, Kệ A4..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* CỘT PHẢI: Ngày hết hạn & Số lượng */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ngày hết hạn (In trên bao bì) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />

              {/* Nút bấm chọn nhanh ngày */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500 font-medium">Chọn nhanh:</span>
                <button
                  type="button"
                  onClick={() => addQuickDays(3)}
                  className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded border border-gray-200 transition font-medium"
                >
                  +3 ngày
                </button>
                <button
                  type="button"
                  onClick={() => addQuickDays(7)}
                  className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded border border-gray-200 transition font-medium"
                >
                  +7 ngày
                </button>
                <button
                  type="button"
                  onClick={() => addQuickDays(30)}
                  className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded border border-gray-200 transition font-medium"
                >
                  +30 ngày
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Số lượng trên kệ
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ghi chú thêm (Tùy chọn)
              </label>
              <input
                type="text"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="VD: Hàng dán tem khuyến mãi 30%..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Nút Lưu Form */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center gap-2 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Đang lưu vào SQLite...' : '💾 Lưu Lô Hàng Mới'}
          </button>
        </div>
      </form>
    </div>
  );
}
