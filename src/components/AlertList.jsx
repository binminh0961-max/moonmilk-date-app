import React, { useState, useMemo } from 'react';
import { 
  Search, 
  CheckCircle, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  ShieldCheck, 
  RotateCcw, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Heart, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  Hash, 
  FileText 
} from 'lucide-react';
import { getExpiryStatus, formatDateVN, getDateWithOffset } from '../utils/dateUtils';
import { HelloKittyHead, HelloKittyBow, CuteStrawberry, KittyPaw } from './HelloKittyStickers';

export default function AlertList({ batches = [], onToggleResolve, onGoToNewBatch, onUpdateBatch, onDeleteBatch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'RED' | 'YELLOW' | 'GREEN' | 'RESOLVED'
  const [hideResolved, setHideResolved] = useState(false);

  // State quản lý Modal Chỉnh Sửa Lô Hàng
  const [editingBatch, setEditingBatch] = useState(null);
  const [editForm, setEditForm] = useState({
    productName: '',
    shelfLocation: '',
    expiryDate: '',
    quantity: 1,
    note: ''
  });

  // Tính toán trạng thái theo 3 mốc cố định: RED (<=15), YELLOW (16-30), GREEN (>30)
  const batchesWithStatus = useMemo(() => {
    return batches.map((batch) => {
      const expDate = batch.expiration_date || batch.expiry_date;
      const statusInfo = getExpiryStatus(expDate);
      const isResolved = batch.status === 'CLEARED' || batch.is_resolved === 1;

      return {
        ...batch,
        expiry_date: expDate,
        expiration_date: expDate,
        is_resolved: isResolved ? 1 : 0,
        status: isResolved ? 'CLEARED' : 'TRACKING',
        statusInfo,
        alert_color: statusInfo.code, // 'RED' | 'YELLOW' | 'GREEN'
      };
    });
  }, [batches]);

  // Thống kê số lượng khớp 3 mốc thời gian mới
  const stats = useMemo(() => {
    let redCount = 0;    // <= 15 ngày
    let yellowCount = 0; // 16 - 30 ngày
    let greenCount = 0;  // > 30 ngày
    let resolvedCount = 0;

    batchesWithStatus.forEach((item) => {
      if (item.is_resolved) {
        resolvedCount++;
      } else {
        if (item.statusInfo.code === 'RED') redCount++;
        else if (item.statusInfo.code === 'YELLOW') yellowCount++;
        else greenCount++;
      }
    });

    return { 
      red: redCount, 
      yellow: yellowCount, 
      green: greenCount, 
      resolved: resolvedCount, 
      total: batches.length 
    };
  }, [batchesWithStatus]);

  // Lọc dữ liệu theo Search và Bộ lọc
  const filteredBatches = useMemo(() => {
    return batchesWithStatus.filter((item) => {
      if (hideResolved && item.is_resolved && selectedFilter !== 'RESOLVED') {
        return false;
      }

      if (selectedFilter === 'RED' && (item.statusInfo.code !== 'RED' || item.is_resolved)) {
        return false;
      }
      if (selectedFilter === 'YELLOW' && (item.statusInfo.code !== 'YELLOW' || item.is_resolved)) {
        return false;
      }
      if (selectedFilter === 'GREEN' && (item.statusInfo.code !== 'GREEN' || item.is_resolved)) {
        return false;
      }
      if (selectedFilter === 'RESOLVED' && !item.is_resolved) {
        return false;
      }

      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        return (
          item.product_name?.toLowerCase().includes(query) ||
          item.shelf_location?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query) ||
          item.batch_code?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [batchesWithStatus, searchTerm, selectedFilter, hideResolved]);

  // Xóa lô hàng (có window.confirm)
  const handleDelete = async (item) => {
    const batchId = item.batch_id || item.id;
    const isConfirmed = window.confirm(
      `Bông ơi, bạn có chắc chắn muốn xóa lô hàng của "${item.product_name}" (ID #${batchId}) không?\nHành động này không thể hoàn tác!`
    );

    if (isConfirmed) {
      try {
        if (window.electronAPI?.deleteBatch) {
          await window.electronAPI.deleteBatch(batchId);
        }
        if (onDeleteBatch) {
          await onDeleteBatch(batchId);
        }
      } catch (err) {
        console.error('Lỗi khi xóa lô hàng:', err);
        alert('Không thể xóa lô hàng: ' + err.message);
      }
    }
  };

  // Mở modal sửa dữ liệu
  const handleOpenEdit = (item) => {
    setEditingBatch(item);
    setEditForm({
      productName: item.product_name || '',
      shelfLocation: item.location || item.shelf_location || '',
      expiryDate: item.expiration_date || item.expiry_date || '',
      quantity: item.quantity || 1,
      note: item.note || ''
    });
  };

  // Lưu chỉnh sửa lô hàng
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBatch) return;

    const batchId = editingBatch.batch_id || editingBatch.id;
    const payload = {
      product_name: editForm.productName.trim(),
      productName: editForm.productName.trim(),
      location: editForm.shelfLocation.trim(),
      shelfLocation: editForm.shelfLocation.trim(),
      expiration_date: editForm.expiryDate,
      expiryDate: editForm.expiryDate,
      quantity: Number(editForm.quantity),
      note: editForm.note.trim()
    };

    try {
      if (window.electronAPI?.updateBatch) {
        await window.electronAPI.updateBatch(batchId, payload);
      }
      if (onUpdateBatch) {
        await onUpdateBatch(batchId, payload);
      }
      setEditingBatch(null);
    } catch (err) {
      console.error('Lỗi khi cập nhật lô hàng:', err);
      alert('Không thể cập nhật lô hàng: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* =========================================================================
          1. 3 THẺ (CARDS) THỐNG KÊ NGANG NHAU (CHUẨN 3 MỐC 15 NGÀY VÀ 30 NGÀY)
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* THẺ 1 (VIỀN ĐỎ/CAM ĐẬM): 🔴 XẢ GẤP (≤ 15 NGÀY) */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === 'RED' ? 'ALL' : 'RED')}
          className={`p-5 rounded-[28px] border-2 transition-all cursor-pointer relative overflow-hidden shadow-sm select-none ${
            selectedFilter === 'RED'
              ? 'bg-rose-50/90 border-[#ff5a5f] ring-4 ring-rose-200/80 shadow-md scale-[1.01]'
              : 'bg-white border-[#ff7a70] hover:border-[#ff5a5f] hover:shadow-md hover:bg-rose-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#d9383a] uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d4f] animate-ping"></span>
              <span>🔴 XẢ GẤP (≤ 15 NGÀY)</span>
            </span>
            <div className="p-1.5 rounded-xl bg-rose-50 border border-rose-200">
              <AlertOctagon className="w-4 h-4 text-[#ff4d4f]" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#e03131] tracking-tight">{stats.red}</span>
              <span className="text-sm text-[#b02a2c] font-black">lô cần xả</span>
            </div>
            <div className="transform rotate-3 hover:scale-110 transition-transform">
              <HelloKittyBow className="w-7 h-7" color="#ff2d55" />
            </div>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-rose-100/80">
            <p className="text-xs text-[#c92a2a] font-bold leading-relaxed">
              Lô cần xả - Bông ưu tiên dán tem giảm giá 50%
            </p>
          </div>
        </div>

        {/* THẺ 2 (VIỀN VÀNG): 🟡 CẬN DATE (≤ 30 NGÀY) */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === 'YELLOW' ? 'ALL' : 'YELLOW')}
          className={`p-5 rounded-[28px] border-2 transition-all cursor-pointer relative overflow-hidden shadow-sm select-none ${
            selectedFilter === 'YELLOW'
              ? 'bg-amber-50/90 border-[#f59e0b] ring-4 ring-amber-200/80 shadow-md scale-[1.01]'
              : 'bg-white border-[#ffd152] hover:border-[#f59e0b] hover:shadow-md hover:bg-amber-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#b45309] uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
              <span>🟡 CẬN DATE (≤ 30 NGÀY)</span>
            </span>
            <div className="p-1.5 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-[#d97706]" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#d97706] tracking-tight">{stats.yellow}</span>
              <span className="text-sm text-[#b45309] font-black">lô chú ý</span>
            </div>
            <div className="transform -rotate-6 hover:scale-110 transition-transform">
              <CuteStrawberry className="w-7 h-7" />
            </div>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-amber-100/80">
            <p className="text-xs text-[#b45309] font-bold leading-relaxed">
              Lô chú ý - Bông ưu tiên dán tem giảm giá 30%
            </p>
          </div>
        </div>

        {/* THẺ 3 (VIỀN XANH LÁ): 🟢 AN TOÀN (> 30 NGÀY) */}
        <div
          onClick={() => setSelectedFilter(selectedFilter === 'GREEN' ? 'ALL' : 'GREEN')}
          className={`p-5 rounded-[28px] border-2 transition-all cursor-pointer relative overflow-hidden shadow-sm select-none ${
            selectedFilter === 'GREEN'
              ? 'bg-emerald-50/90 border-[#10b981] ring-4 ring-emerald-200/80 shadow-md scale-[1.01]'
              : 'bg-white border-[#52e5a3] hover:border-[#10b981] hover:shadow-md hover:bg-emerald-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#047857] uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
              <span>🟢 AN TOÀN (&gt; 30 NGÀY)</span>
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-[#059669]" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#059669] tracking-tight">{stats.green}</span>
              <span className="text-sm text-[#047857] font-black">lô tươi ngon</span>
            </div>
            <div className="transform rotate-12 hover:scale-110 transition-transform">
              <KittyPaw className="w-7 h-7" color="#10b981" />
            </div>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-emerald-100/80">
            <p className="text-xs text-[#047857] font-bold leading-relaxed">
              Lô tươi ngon - Hạn dài tha hồ bán nha Bông
            </p>
          </div>
        </div>

      </div>

      {/* =========================================================================
          2. THANH TÌM KIẾM VÀ CÁC NÚT LỌC MÀU
         ========================================================================= */}
      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl border-2 border-pink-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên bánh kẹo, sữa chua, kệ A1, tủ mát B2 của Bông..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-pink-100 bg-pink-50/40 text-sm font-bold text-slate-700 placeholder-pink-300 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-500/30 ring-2 ring-pink-300'
                : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200'
            }`}
          >
            🎀 Tất cả ({stats.total})
          </button>

          <button
            onClick={() => setSelectedFilter('RED')}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFilter === 'RED'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-300'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            🔴 Xả gấp ≤ 15 ngày ({stats.red})
          </button>

          <button
            onClick={() => setSelectedFilter('YELLOW')}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFilter === 'YELLOW'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-300'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            🟡 Cận date ≤ 30 ngày ({stats.yellow})
          </button>

          <button
            onClick={() => setSelectedFilter('GREEN')}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFilter === 'GREEN'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-300'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            🟢 An toàn &gt; 30 ngày ({stats.green})
          </button>

          {/* Toggle ẩn đã xử lý */}
          <label className="flex items-center gap-1.5 text-xs font-bold text-pink-700 cursor-pointer ml-1 select-none bg-pink-50 px-3 py-2 rounded-xl border border-pink-200 hover:bg-pink-100">
            <input
              type="checkbox"
              checked={hideResolved}
              onChange={(e) => setHideResolved(e.target.checked)}
              className="w-4 h-4 rounded text-pink-600 focus:ring-pink-400 border-pink-300 cursor-pointer accent-pink-600"
            />
            <span>Ẩn đã xử lý</span>
          </label>
        </div>
      </div>

      {/* =========================================================================
          3. BẢNG DỮ LIỆU ĐÃ TỐI ƯU 100% CHIỀU RỘNG (W-FULL TABLE-FIXED, NO SCROLL)
         ========================================================================= */}
      <div className="w-full bg-white rounded-3xl border-2 border-pink-200 shadow-md overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100 border-b-2 border-pink-200 text-pink-900 text-xs uppercase font-black tracking-wider">
              <th className="w-[34%] py-2.5 px-3 text-left">Tên sản phẩm của Bông</th>
              <th className="w-[15%] py-2.5 px-2 text-center">Vị trí kệ</th>
              <th className="w-[9%] py-2.5 px-2 text-center">Số lượng</th>
              <th className="w-[15%] py-2.5 px-2 text-center">Hạn dùng</th>
              <th className="w-[15%] py-2.5 px-2 text-center">Trạng thái</th>
              <th className="w-[12%] py-2.5 px-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-100 text-xs md:text-sm font-semibold">
            {filteredBatches.map((item) => {
              const isResolved = item.is_resolved === 1;
              const { statusInfo } = item;
              const batchId = item.batch_id || item.id;

              return (
                <tr
                  key={batchId}
                  className={`transition-colors duration-150 hover:bg-pink-50/60 ${
                    isResolved ? 'bg-slate-50/60 opacity-60' : ''
                  }`}
                >
                  {/* Cột 1: Tên sản phẩm (Rộng 34% - truncate chống tràn hàng) */}
                  <td className="px-3 py-2 text-left">
                    <div className="flex items-center gap-2 min-w-0">
                      <CuteStrawberry className="w-4 h-4 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p 
                          className={`font-black text-slate-800 text-xs md:text-sm truncate ${isResolved ? 'line-through text-slate-400' : ''}`}
                          title={item.product_name}
                        >
                          {item.product_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-pink-600 font-bold truncate">
                          {item.product_id && (
                            <span className="font-mono bg-pink-100/80 px-1.5 py-0.5 rounded text-[10px] text-pink-800 flex-shrink-0">
                              #{item.product_id}
                            </span>
                          )}
                          {item.category && <span className="truncate">🌸 {item.category}</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Vị trí kệ (Rộng 15%) */}
                  <td className="px-2 py-2 text-center">
                    <span 
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-100 border border-pink-200 text-pink-800 text-xs font-black truncate max-w-full"
                      title={item.location || item.shelf_location || 'Chưa xếp kệ'}
                    >
                      <MapPin className="w-3 h-3 text-pink-500 flex-shrink-0" />
                      <span className="truncate">{item.location || item.shelf_location || 'Chưa xếp'}</span>
                    </span>
                  </td>

                  {/* Cột 3: Số lượng (Rộng 9%) */}
                  <td className="px-2 py-2 text-center">
                    <span className="inline-block px-2 py-0.5 font-black text-pink-700 bg-pink-50 border border-pink-200 rounded-lg text-xs">
                      {item.quantity}
                    </span>
                  </td>

                  {/* Cột 4: Hạn dùng & Ngày chênh lệch (Rộng 15%) */}
                  <td className="px-2 py-2 text-center">
                    <div className="flex items-center justify-center gap-1 font-bold text-slate-800 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                      <span>{formatDateVN(item.expiration_date || item.expiry_date)}</span>
                    </div>
                    <div className="text-[10px] mt-0.5 font-bold truncate">
                      {statusInfo.days < 0 ? (
                        <span className="text-rose-600">Quá {Math.abs(statusInfo.days)} ngày</span>
                      ) : statusInfo.days === 0 ? (
                        <span className="text-rose-600 font-black">Hôm nay</span>
                      ) : statusInfo.days <= 15 ? (
                        <span className="text-[#d9383a] font-black">Còn {statusInfo.days} ngày</span>
                      ) : statusInfo.days <= 30 ? (
                        <span className="text-[#b45309] font-black">Còn {statusInfo.days} ngày</span>
                      ) : (
                        <span className="text-[#047857]">Còn {statusInfo.days} ngày</span>
                      )}
                    </div>
                  </td>

                  {/* Cột 5: Trạng thái 3 mốc (Rộng 15%) */}
                  <td className="px-2 py-2 text-center">
                    {isResolved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-pink-50 text-pink-700 border border-pink-300 truncate max-w-full">
                        <CheckCircle2 className="w-3 h-3 text-pink-500 flex-shrink-0" />
                        <span className="truncate">Đã xử lý 💖</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black border truncate max-w-full ${statusInfo.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusInfo.dotClass}`}></span>
                        <span className="truncate">{statusInfo.label}</span>
                      </span>
                    )}
                  </td>

                  {/* Cột 6: Thao tác ICON-ONLY (Rộng 12% - 3 icon nằm ngang gọn gàng) */}
                  <td className="px-2 py-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* 1. Nút Đã xử lý / Hoàn tác (Icon-only) */}
                      {isResolved ? (
                        <button
                          type="button"
                          onClick={() => onToggleResolve(batchId, false)}
                          className="p-1.5 rounded-lg text-pink-700 bg-pink-100 hover:bg-pink-200 transition-all cursor-pointer active:scale-95"
                          title="Hoàn tác về chưa xử lý"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onToggleResolve(batchId, true)}
                          className="p-1.5 rounded-lg text-white bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 active:scale-95 transition-all shadow-xs cursor-pointer border border-pink-300"
                          title="Đánh dấu đã xử lý 🎀"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* 2. Nút Sửa (Icon-only) */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 transition-all cursor-pointer active:scale-95 shadow-xs"
                        title="Sửa thông tin lô hàng"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* 3. Nút Xóa (Icon-only) */}
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer active:scale-95 shadow-xs"
                        title="Xóa lô hàng vĩnh viễn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer bảng nhỏ gọn */}
        <div className="p-3 bg-pink-50/70 border-t-2 border-pink-100 flex flex-col md:flex-row items-center justify-between text-xs text-pink-800 font-bold gap-2">
          <div className="flex items-center flex-wrap gap-3">
            <span className="flex items-center gap-1">
              <HelloKittyBow className="w-3.5 h-3.5" color="#ff2d75" />
              <span>Quy ước 3 mốc:</span>
            </span>
            <span className="text-[#d9383a]">🔴 ≤ 15 ngày (Xả 50%)</span>
            <span className="text-[#b45309]">🟡 16 - 30 ngày (Cận date 30%)</span>
            <span className="text-[#047857]">🟢 &gt; 30 ngày (An toàn)</span>
          </div>

          <div className="text-pink-600 font-black">
            <span>Tiệm Bông đang có </span>
            <span className="px-2 py-0.5 bg-white rounded-lg border border-pink-200 text-pink-700">
              {filteredBatches.length} / {batches.length} lô
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. MODAL FORM CHỈNH SỬA DỮ LIỆU TĨNH (HELLO KITTY STYLE)
         ========================================================================= */}
      {editingBatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-pink-200 shadow-2xl max-w-lg w-full overflow-hidden relative animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="p-5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl p-1 flex items-center justify-center">
                  <HelloKittyHead className="w-8 h-8" bowColor="#ff2d75" />
                </div>
                <div>
                  <h3 className="font-black text-base tracking-wide flex items-center gap-1.5">
                    <span>Chỉnh Sửa Lô Hàng Của Bông</span>
                    <HelloKittyBow className="w-4 h-4" color="#ffffff" />
                  </h3>
                  <p className="text-[11px] text-pink-100 font-semibold">
                    Cập nhật lại hạn dùng, số lượng hoặc vị trí kệ
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingBatch(null)}
                className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form sửa dữ liệu */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {/* 1. Tên sản phẩm */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CuteStrawberry className="w-3.5 h-3.5" />
                  <span>Tên sản phẩm</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.productName}
                  onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-pink-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 bg-pink-50/20"
                />
              </div>

              {/* 2. Vị trí kệ */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-500" />
                  <span>Vị trí kệ hàng</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.shelfLocation}
                  onChange={(e) => setEditForm({ ...editForm, shelfLocation: e.target.value })}
                  placeholder="VD: Kệ A1-02, Tủ mát B2..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-pink-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 bg-pink-50/20"
                />
              </div>

              {/* 3. Ngày hết hạn & 3 nút chọn nhanh */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-pink-500" />
                    <span>Ngày hết hạn</span>
                  </span>
                  <span className="text-[11px] text-pink-500 font-bold">Bông chọn nhanh:</span>
                </label>
                <input
                  type="date"
                  required
                  value={editForm.expiryDate}
                  onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-pink-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 bg-pink-50/20 cursor-pointer"
                />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, expiryDate: getDateWithOffset(3) })}
                    className="py-1.5 text-xs font-bold rounded-xl border border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors"
                  >
                    +3 ngày 🎀
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, expiryDate: getDateWithOffset(7) })}
                    className="py-1.5 text-xs font-bold rounded-xl border border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors"
                  >
                    +7 ngày 🍓
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, expiryDate: getDateWithOffset(30) })}
                    className="py-1.5 text-xs font-bold rounded-xl border border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors"
                  >
                    +30 ngày ✨
                  </button>
                </div>
              </div>

              {/* 4. Số lượng */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-pink-500" />
                  <span>Số lượng</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-pink-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 bg-pink-50/20"
                />
              </div>

              {/* 5. Ghi chú */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-pink-500" />
                  <span>Ghi chú</span>
                </label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  placeholder="VD: Cần xả gấp trước chủ nhật..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-pink-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 bg-pink-50/20"
                />
              </div>

              {/* Nút bấm hành động của Modal */}
              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 shadow-md shadow-pink-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi 💖</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
