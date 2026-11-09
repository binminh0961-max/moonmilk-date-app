import React from 'react';
import { 
  AlertTriangle, 
  PackagePlus, 
  Sparkles, 
  Database, 
  Heart,
  Crown,
  Settings as SettingsIcon
} from 'lucide-react';
import { HelloKittyHead, HelloKittyWithHeart, HelloKittyBow, CuteStrawberry, KittyPaw } from './HelloKittyStickers';

export default function Sidebar({ currentTab, setCurrentTab, stats, isElectronMode }) {
  const alertCount = stats.expiredCount + stats.warningCount;

  return (
    <aside className="w-72 bg-gradient-to-b from-[#fff0f5] via-[#ffe4ec] to-[#fecddc] text-slate-800 flex flex-col justify-between border-r-2 border-pink-200 select-none flex-shrink-0 relative overflow-hidden shadow-xl z-20">
      
      {/* Họa tiết nơ mờ chìm trong background */}
      <div className="absolute -top-6 -right-6 opacity-15 pointer-events-none transform rotate-12">
        <HelloKittyBow className="w-32 h-32" color="#ff2d75" />
      </div>
      <div className="absolute top-1/2 -left-6 opacity-10 pointer-events-none transform -rotate-12">
        <KittyPaw className="w-24 h-24" color="#f43f5e" />
      </div>

      <div>
        {/* Brand / Logo Cá Nhân Hóa Dành Riêng Cho BÔNG */}
        <div className="p-5 border-b-2 border-pink-200/80 bg-white/70 backdrop-blur-sm relative">
          <div className="flex items-center space-x-3.5">
            <div className="relative group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-400 to-pink-300 p-1 shadow-lg shadow-pink-400/30 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <HelloKittyHead className="w-12 h-12 animate-float-slow" bowColor="#ff1493" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 items-center justify-center text-[9px] text-white">✨</span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg text-pink-700 tracking-tight flex items-center gap-1">
                  Tiệm Của Bông
                </h1>
                <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
              </div>
              <p className="text-xs font-semibold text-pink-500 flex items-center gap-1">
                <span>Hello Kitty Edition</span>
                <HelloKittyBow className="w-3.5 h-3.5 inline" color="#ff1493" />
              </p>
            </div>
          </div>

          {/* Lời chào dễ thương dành riêng cho Bông */}
          <div className="mt-3 px-3 py-1.5 bg-pink-50 rounded-xl border border-pink-200 text-[11px] text-pink-700 font-semibold flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-1">
              <span>🍓 Chào cô chủ Bông!</span>
            </span>
            <span className="text-[10px] bg-pink-200/80 px-2 py-0.5 rounded-full text-pink-800 font-bold">
              Cute 100%
            </span>
          </div>
        </div>

        {/* Menu Quản Trị Hồng Ngọt Ngào */}
        <nav className="p-3.5 space-y-2 mt-2">
          <div className="px-3 pb-1 text-[11px] font-extrabold text-pink-500 uppercase tracking-wider flex items-center gap-1.5">
            <KittyPaw className="w-3.5 h-3.5 text-pink-500" />
            <span>Khu Vực Quản Trị</span>
          </div>

          {/* Nút 1: Cảnh báo Date */}
          <button
            onClick={() => setCurrentTab('alerts')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              currentTab === 'alerts'
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-lg shadow-pink-500/35 scale-[1.02] border border-pink-300'
                : 'bg-white/60 text-pink-900 hover:bg-white hover:text-pink-600 hover:shadow-md border border-pink-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-1.5 rounded-xl ${currentTab === 'alerts' ? 'bg-white/20' : 'bg-pink-100'}`}>
                <AlertTriangle className={`w-4 h-4 ${currentTab === 'alerts' ? 'text-white' : 'text-pink-600'}`} />
              </div>
              <div className="text-left">
                <span className="block leading-tight">Cảnh Báo Date 🎀</span>
                <span className={`text-[10px] block ${currentTab === 'alerts' ? 'text-pink-100' : 'text-pink-400 font-medium'}`}>
                  Soi date &amp; xử lý cận hạn
                </span>
              </div>
            </div>

            {alertCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold shadow-md bg-rose-500 text-white animate-bounce-slow flex items-center gap-0.5 border border-white">
                <span>{alertCount}</span>
                <CuteStrawberry className="w-2.5 h-2.5" />
              </span>
            )}
          </button>

          {/* Nút 2: Nhập hàng mới */}
          <button
            onClick={() => setCurrentTab('new-batch')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              currentTab === 'new-batch'
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-lg shadow-pink-500/35 scale-[1.02] border border-pink-300'
                : 'bg-white/60 text-pink-900 hover:bg-white hover:text-pink-600 hover:shadow-md border border-pink-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-1.5 rounded-xl ${currentTab === 'new-batch' ? 'bg-white/20' : 'bg-pink-100'}`}>
                <PackagePlus className={`w-4 h-4 ${currentTab === 'new-batch' ? 'text-white' : 'text-pink-600'}`} />
              </div>
              <div className="text-left">
                <span className="block leading-tight">Nhập Hàng Mới ✨</span>
                <span className={`text-[10px] block ${currentTab === 'new-batch' ? 'text-pink-100' : 'text-pink-400 font-medium'}`}>
                  Khai báo lô &amp; vị trí kệ
                </span>
              </div>
            </div>

            <Heart className={`w-4 h-4 ${currentTab === 'new-batch' ? 'text-white fill-white' : 'text-pink-400'}`} />
          </button>

          {/* Nút 3: Cài đặt Email */}
          <button
            onClick={() => setCurrentTab('settings')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-lg shadow-pink-500/35 scale-[1.02] border border-pink-300'
                : 'bg-white/60 text-pink-900 hover:bg-white hover:text-pink-600 hover:shadow-md border border-pink-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-1.5 rounded-xl ${currentTab === 'settings' ? 'bg-white/20' : 'bg-pink-100'}`}>
                <SettingsIcon className={`w-4 h-4 ${currentTab === 'settings' ? 'text-white' : 'text-pink-600'}`} />
              </div>
              <div className="text-left">
                <span className="block leading-tight">Cài Đặt Email 🎀</span>
                <span className={`text-[10px] block ${currentTab === 'settings' ? 'text-pink-100' : 'text-pink-400 font-medium'}`}>
                  Cấu hình gửi mail tự động
                </span>
              </div>
            </div>

            <Sparkles className={`w-4 h-4 ${currentTab === 'settings' ? 'text-white' : 'text-pink-400'}`} />
          </button>
        </nav>

        {/* Sticker Hello Kitty Ôm Trái Tim "Bông" ở giữa Sidebar */}
        <div className="px-4 py-2 flex flex-col items-center">
          <div className="w-full bg-white/80 backdrop-blur-sm p-3 rounded-2xl border-2 border-dashed border-pink-300 text-center relative shadow-sm">
            <div className="flex justify-center -mt-6">
              <HelloKittyWithHeart className="w-20 h-20" name="Bông" />
            </div>
            <p className="text-xs font-bold text-pink-700 mt-1">
              "Bông ơi, chúc một ngày vui tươi nha!" 🌸
            </p>
            <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-pink-500 font-semibold">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Tiệm Bông lúc nào cũng xinh</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info / DB Mode Badge */}
      <div className="p-4 border-t-2 border-pink-200/80 bg-white/80 backdrop-blur-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs text-pink-800 font-bold">
          <span className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-pink-600" />
            <span>Dữ liệu SQLite:</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-100 text-pink-700 border border-pink-300 shadow-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
            {isElectronMode ? 'Đã kết nối 💖' : 'Mock Preview 🌸'}
          </span>
        </div>

        <div className="text-[11px] text-pink-600/80 text-center font-medium leading-relaxed">
          Tạo với rất nhiều tình yêu tặng <strong className="text-pink-700 font-extrabold">Bông</strong> 💕
        </div>
      </div>
    </aside>
  );
}
