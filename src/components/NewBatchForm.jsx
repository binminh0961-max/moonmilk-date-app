import React, { useState } from 'react';
import { 
  PackagePlus, 
  MapPin, 
  Calendar, 
  Hash, 
  Save, 
  Sparkles, 
  Heart,
  Tag, 
  FileText 
} from 'lucide-react';
import { getDateWithOffset } from '../utils/dateUtils';
import { HelloKittyHead, HelloKittyBow, CuteStrawberry, KittyPaw, HelloKittyWithHeart } from './HelloKittyStickers';

export default function NewBatchForm({ onSaveBatch, productSuggestions = [], onComplete }) {
  const [productName, setProductName] = useState('');
  const [shelfLocation, setShelfLocation] = useState('');
  const [category, setCategory] = useState('Bánh tươi & Snack');
  const [expiryDate, setExpiryDate] = useState(getDateWithOffset(7));
  const [quantity, setQuantity] = useState(10);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [successToast, setSuccessToast] = useState(false);

  const handleSelectSuggestion = (name) => {
    setProductName(name);
    const found = productSuggestions.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (found && found.shelf_location) {
      setShelfLocation(found.shelf_location);
    }
  };

  const handleQuickDate = (offsetDays) => {
    const newDate = getDateWithOffset(offsetDays);
    setExpiryDate(newDate);
  };

  const validate = () => {
    const errs = {};
    if (!productName.trim()) {
      errs.productName = 'Bông ơi, nhớ nhập tên sản phẩm nha!';
    }
    if (!shelfLocation.trim()) {
      errs.shelfLocation = 'Bông để món này ở kệ nào nè?';
    }
    if (!expiryDate) {
      errs.expiryDate = 'Bông chọn ngày hết hạn giúp Kitty nha!';
    }
    if (!quantity || Number(quantity) <= 0) {
      errs.quantity = 'Số lượng nhập phải lớn hơn 0 nghen Bông';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newBatch = {
      productName: productName.trim(),
      shelfLocation: shelfLocation.trim(),
      category,
      expiryDate,
      quantity: Number(quantity),
      note: note.trim(),
    };

    onSaveBatch(newBatch);

    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      if (onComplete) onComplete();
    }, 1300);

    setProductName('');
    setQuantity(10);
    setNote('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast thông báo siêu ngọt ngào cho Bông */}
      {successToast && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white shadow-xl shadow-pink-500/30 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300 border-2 border-white">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 bg-white rounded-2xl p-1 flex items-center justify-center">
              <HelloKittyHead className="w-10 h-10 animate-bounce-slow" bowColor="#ff2d75" />
            </div>
            <div>
              <p className="font-black text-base flex items-center gap-1.5">
                <span>Oa, Bông đã lưu lô hàng mới thành công!</span>
                <Heart className="w-4 h-4 fill-white inline" />
              </p>
              <p className="text-xs text-pink-100 font-semibold">
                Kitty đã lưu vào SQLite và bắt đầu canh chừng hạn giúp Bông rồi đó! 🎀🍓
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Container chính của Form Hồng Hello Kitty */}
      <div className="bg-white rounded-3xl border-2 border-pink-200 shadow-lg overflow-hidden relative">
        {/* Nơ trang trí góc */}
        <div className="absolute top-3 right-3 opacity-20 pointer-events-none">
          <HelloKittyBow className="w-24 h-24" color="#ff2d75" />
        </div>

        {/* Header Form */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 text-white flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/95 rounded-2xl p-1.5 shadow-md flex items-center justify-center">
              <HelloKittyHead className="w-14 h-14" bowColor="#ff1493" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Khai Báo Nhập Hàng Mới Cho Bông</h2>
                <HelloKittyBow className="w-5 h-5" color="#ffffff" />
              </div>
              <p className="text-xs text-pink-100 font-semibold mt-1">
                Nhập thông tin sản phẩm và ngày hết hạn để Kitty tự động báo thức cho Bông nhé! 🌸
              </p>
            </div>
          </div>
        </div>

        {/* Nội dung Form chia 2 Cột tối ưu màn hình Desktop */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* CỘT TRÁI: Tên sản phẩm, Vị trí kệ, Danh mục */}
            <div className="space-y-6">
              <div className="border-b-2 border-pink-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-black text-pink-700 uppercase tracking-wider flex items-center gap-2">
                  <KittyPaw className="w-4 h-4 text-pink-500" />
                  <span>Cột Trái: Thông Tin Sản Phẩm</span>
                </h3>
                <span className="text-xs text-pink-400 font-bold">🍓 Thông tin chung</span>
              </div>

              {/* 1. Tên sản phẩm */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CuteStrawberry className="w-4 h-4" />
                    <span>Tên sản phẩm</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-xs text-pink-400 font-semibold">Tự động gợi ý</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="product-list-suggestions"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                      if (errors.productName) setErrors({ ...errors, productName: null });
                    }}
                    placeholder="VD: Sữa dâu Meiji, Kẹo dẻo Hello Kitty, Bánh quy..."
                    className={`w-full px-4 py-3.5 rounded-2xl border-2 text-sm font-bold text-slate-800 transition-all focus:outline-none focus:ring-4 ${
                      errors.productName
                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/50'
                        : 'border-pink-200 focus:border-pink-500 focus:ring-pink-100 hover:border-pink-300 bg-pink-50/20'
                    }`}
                  />
                  <datalist id="product-list-suggestions">
                    {productSuggestions.map((prod, index) => (
                      <option key={index} value={prod.name}>
                        {prod.shelf_location ? `(Kệ: ${prod.shelf_location})` : ''}
                      </option>
                    ))}
                  </datalist>
                </div>
                {errors.productName && (
                  <p className="text-xs text-rose-500 mt-1.5 font-bold">{errors.productName}</p>
                )}

                {/* Gợi ý sản phẩm nhanh cho Bông */}
                {productSuggestions.length > 0 && (
                  <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
                    <span className="text-[11px] text-pink-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Bông bấm chọn nhanh:
                    </span>
                    {productSuggestions.slice(0, 3).map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSuggestion(item.name)}
                        className="text-[11px] px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 hover:text-pink-700 text-pink-800 transition-colors font-extrabold border border-pink-200 cursor-pointer"
                      >
                        {item.name.length > 20 ? item.name.slice(0, 20) + '...' : item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Vị trí kệ */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-pink-500" />
                    <span>Vị trí kệ hàng của Bông</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-xs text-pink-400 font-normal">VD: Kệ A1, Tủ mát C2</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={shelfLocation}
                    onChange={(e) => {
                      setShelfLocation(e.target.value);
                      if (errors.shelfLocation) setErrors({ ...errors, shelfLocation: null });
                    }}
                    placeholder="Bông xếp món này ở đâu? (VD: Tủ mát B1-02, Kệ Snack 03)"
                    className={`w-full px-4 py-3.5 rounded-2xl border-2 text-sm font-bold text-slate-800 transition-all focus:outline-none focus:ring-4 ${
                      errors.shelfLocation
                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/50'
                        : 'border-pink-200 focus:border-pink-500 focus:ring-pink-100 hover:border-pink-300 bg-pink-50/20'
                    }`}
                  />
                </div>
                {errors.shelfLocation && (
                  <p className="text-xs text-rose-500 mt-1.5 font-bold">{errors.shelfLocation}</p>
                )}
              </div>

              {/* 3. Danh mục */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-pink-500" />
                  <span>Danh mục sản phẩm</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-pink-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 bg-white cursor-pointer"
                >
                  <option value="Bánh tươi & Snack">Bánh tươi &amp; Snack</option>
                  <option value="Sữa & Bơ sữa">Sữa &amp; Bơ sữa</option>
                  <option value="Thực phẩm chế biến">Thực phẩm chế biến</option>
                  <option value="Đồ uống & Trà sữa">Đồ uống &amp; Trà sữa</option>
                  <option value="Kẹo ngọt & Chocolate">Kẹo ngọt &amp; Chocolate</option>
                  <option value="Đồ hộp & Gia vị">Đồ hộp &amp; Gia vị</option>
                  <option value="Mỹ phẩm & Chăm sóc">Mỹ phẩm &amp; Chăm sóc</option>
                  <option value="Bách hóa khác">Bách hóa khác</option>
                </select>
              </div>
            </div>

            {/* CỘT PHẢI: Ngày hết hạn (+3 nút chọn nhanh), Số lượng, Ghi chú */}
            <div className="space-y-6">
              <div className="border-b-2 border-pink-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-black text-pink-700 uppercase tracking-wider flex items-center gap-2">
                  <HelloKittyBow className="w-4 h-4" color="#ff2d75" />
                  <span>Cột Phải: Hạn Sử Dụng &amp; Số Lượng</span>
                </h3>
                <span className="text-xs text-pink-400 font-bold">🎀 Chi tiết lô</span>
              </div>

              {/* 1. Ngày hết hạn & 3 nút bấm nhỏ chọn nhanh */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    <span>Ngày hết hạn</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-pink-600 font-bold">✨ Bông chọn nhanh:</span>
                </div>

                <div className="space-y-2.5">
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => {
                      setExpiryDate(e.target.value);
                      if (errors.expiryDate) setErrors({ ...errors, expiryDate: null });
                    }}
                    className={`w-full px-4 py-3.5 rounded-2xl border-2 text-sm font-bold text-slate-800 transition-all focus:outline-none focus:ring-4 cursor-pointer ${
                      errors.expiryDate
                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/50'
                        : 'border-pink-200 focus:border-pink-500 focus:ring-pink-100 hover:border-pink-300 bg-pink-50/20'
                    }`}
                  />

                  {/* 3 NÚT BẤM NHỎ CHỌN NHANH ĐƯỢC DECOR CỰC XINH */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleQuickDate(3)}
                      className="px-3 py-2.5 text-xs font-black rounded-2xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all text-pink-700 active:scale-95 text-center shadow-xs cursor-pointer"
                    >
                      +3 ngày 🎀
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDate(7)}
                      className="px-3 py-2.5 text-xs font-black rounded-2xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all text-pink-700 active:scale-95 text-center shadow-xs cursor-pointer"
                    >
                      +7 ngày 🍓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDate(30)}
                      className="px-3 py-2.5 text-xs font-black rounded-2xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all text-pink-700 active:scale-95 text-center shadow-xs cursor-pointer"
                    >
                      +30 ngày ✨
                    </button>
                  </div>
                </div>

                {errors.expiryDate && (
                  <p className="text-xs text-rose-500 mt-1.5 font-bold">{errors.expiryDate}</p>
                )}
              </div>

              {/* 2. Số lượng nhập */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-pink-500" />
                    <span>Số lượng nhập</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-xs text-pink-400 font-semibold">Đơn vị: cái / hộp / gói</span>
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, Number(q) - 5))}
                    className="px-4 py-3.5 rounded-2xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-100 font-black text-pink-700 text-sm active:scale-95 cursor-pointer"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      if (errors.quantity) setErrors({ ...errors, quantity: null });
                    }}
                    className={`w-full px-4 py-3.5 rounded-2xl border-2 text-base font-black text-center transition-all focus:outline-none focus:ring-4 ${
                      errors.quantity
                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/50'
                        : 'border-pink-200 focus:border-pink-500 focus:ring-pink-100 hover:border-pink-300 bg-pink-50/20 text-pink-700'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Number(q) + 5)}
                    className="px-4 py-3.5 rounded-2xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-100 font-black text-pink-700 text-sm active:scale-95 cursor-pointer"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Number(q) + 20)}
                    className="px-4 py-3.5 rounded-2xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-100 font-black text-pink-700 text-sm active:scale-95 cursor-pointer"
                  >
                    +20
                  </button>
                </div>
                {errors.quantity && (
                  <p className="text-xs text-rose-500 mt-1.5 font-bold">{errors.quantity}</p>
                )}
              </div>

              {/* 3. Ghi chú */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-pink-500" />
                  <span>Ghi chú thêm của Bông (Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Hàng mới tặng kèm sticker, thùng số 1 của Bông..."
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-pink-200 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 bg-pink-50/20"
                />
              </div>
            </div>

          </div>

          {/* NÚT "LƯU THÔNG TIN" TO, MÀU HỒNG CỰC KỲ NỔI BẬT */}
          <div className="pt-6 border-t-2 border-pink-100">
            <button
              type="submit"
              className="w-full py-4 px-8 rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 text-white font-black text-base tracking-wider shadow-xl shadow-pink-500/35 active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer border-2 border-pink-300"
            >
              <Save className="w-6 h-6 stroke-[2.5]" />
              <span>BÔNG LƯU THÔNG TIN LÔ HÀNG 🎀</span>
              <Heart className="w-5 h-5 fill-white" />
            </button>
            <p className="text-center text-xs text-pink-500 font-bold mt-2.5 flex items-center justify-center gap-1">
              <span>🌸 Dữ liệu được lưu an toàn vào SQLite (Chuẩn 3NF) cho Bông</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
