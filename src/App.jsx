import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import AlertList from './components/AlertList';
import NewBatchForm from './components/NewBatchForm';
import Settings from './components/Settings';
import { INITIAL_MOCK_BATCHES, MOCK_PRODUCT_SUGGESTIONS } from './mock/mockData';
import { getDaysRemaining } from './utils/dateUtils';
import { Calendar, RefreshCw, PlusCircle, Heart, Sparkles } from 'lucide-react';
import { HelloKittyHead, HelloKittyBow, CuteStrawberry } from './components/HelloKittyStickers';

export default function App() {
  const [currentTab, setCurrentTab] = useState('alerts');
  const [batches, setBatches] = useState([]);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isElectronMode, setIsElectronMode] = useState(false);

  useEffect(() => {
    const hasElectron = typeof window !== 'undefined' && !!window.electronAPI;
    setIsElectronMode(hasElectron);

    if (hasElectron) {
      loadBatchesFromDB();
      loadProductSuggestions();
    } else {
      console.info('[DateTracker] Chạy chế độ Web Browser Preview (Mock Data)');
      setBatches(INITIAL_MOCK_BATCHES);
      setProductSuggestions(MOCK_PRODUCT_SUGGESTIONS);
      setIsLoading(false);
    }
  }, []);

  const loadBatchesFromDB = async () => {
    setIsLoading(true);
    try {
      if (window.electronAPI?.getAllBatches) {
        const data = await window.electronAPI.getAllBatches();
        setBatches(data || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu từ SQLite:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductSuggestions = async () => {
    try {
      if (window.electronAPI?.getProductSuggestions) {
        const data = await window.electronAPI.getProductSuggestions();
        setProductSuggestions(data || []);
      }
    } catch (err) {
      console.error('Lỗi tải gợi ý sản phẩm:', err);
    }
  };

  const handleToggleResolve = useCallback(async (batchId, status) => {
    if (window.electronAPI?.toggleBatchResolved) {
      try {
        await window.electronAPI.toggleBatchResolved(batchId, status);
        await loadBatchesFromDB();
      } catch (err) {
        console.error('Lỗi cập nhật trạng thái:', err);
      }
    } else {
      setBatches((prev) =>
        prev.map((b) => (b.batch_id === batchId ? { ...b, is_resolved: status ? 1 : 0 } : b))
      );
    }
  }, []);

  const handleDeleteBatch = useCallback(async (batchId) => {
    if (window.electronAPI?.deleteBatch) {
      try {
        await window.electronAPI.deleteBatch(batchId);
        await loadBatchesFromDB();
      } catch (err) {
        console.error('Lỗi xóa lô hàng:', err);
        alert('Lỗi xóa lô hàng: ' + err.message);
      }
    } else {
      setBatches((prev) => prev.filter((b) => b.batch_id !== batchId));
    }
  }, []);

  const handleUpdateBatch = useCallback(async (batchId, updateData) => {
    if (window.electronAPI?.updateBatch) {
      try {
        await window.electronAPI.updateBatch(batchId, updateData);
        await loadBatchesFromDB();
        await loadProductSuggestions();
      } catch (err) {
        console.error('Lỗi cập nhật lô hàng:', err);
        alert('Lỗi cập nhật: ' + err.message);
      }
    } else {
      setBatches((prev) =>
        prev.map((b) =>
          b.batch_id === batchId
            ? {
                ...b,
                product_name: updateData.productName || b.product_name,
                shelf_location: updateData.shelfLocation || b.shelf_location,
                quantity: updateData.quantity !== undefined ? Number(updateData.quantity) : b.quantity,
                expiry_date: updateData.expiryDate || b.expiry_date,
              }
            : b
        )
      );
    }
  }, []);

  const handleSaveBatch = useCallback(async (newBatchData) => {
    if (window.electronAPI?.createBatch) {
      try {
        await window.electronAPI.createBatch(newBatchData);
        await loadBatchesFromDB();
        await loadProductSuggestions();
      } catch (err) {
        console.error('Lỗi lưu lô hàng:', err);
      }
    } else {
      const mockNewItem = {
        batch_id: Date.now(),
        product_id: Math.floor(Math.random() * 1000),
        product_name: newBatchData.productName,
        category: newBatchData.category,
        shelf_location: newBatchData.shelfLocation,
        quantity: newBatchData.quantity,
        expiry_date: newBatchData.expiryDate,
        warning_days: 7,
        is_resolved: 0,
        batch_code: `LOT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
        note: newBatchData.note,
      };

      setBatches((prev) => [mockNewItem, ...prev]);

      setProductSuggestions((prev) => {
        if (!prev.some((p) => p.name.toLowerCase() === newBatchData.productName.toLowerCase())) {
          return [{ name: newBatchData.productName, shelf_location: newBatchData.shelfLocation }, ...prev];
        }
        return prev;
      });
    }
  }, []);

  const stats = useMemo(() => {
    let expiredCount = 0; // <= 15 ngày (Xả gấp 50%)
    let warningCount = 0; // 16 - 30 ngày (Cận date 30%)
    let safeCount = 0;    // > 30 ngày (An toàn)

    batches.forEach((b) => {
      const isResolved = b.is_resolved === 1 || b.status === 'CLEARED';
      if (!isResolved) {
        const expDate = b.expiration_date || b.expiry_date;
        const days = getDaysRemaining(expDate);
        if (days <= 15) expiredCount++;
        else if (days <= 30) warningCount++;
        else safeCount++;
      }
    });

    return { expiredCount, warningCount, safeCount, total: batches.length };
  }, [batches]);

  const currentDateVN = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fff0f5] text-slate-800 font-sans relative">
      {/* 1. SIDEBAR BÊN TRÁI ĐƯỢC DECOR HỒNG HELLO KITTY */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        stats={stats}
        isElectronMode={isElectronMode}
      />

      {/* 2. MAIN CONTENT BÊN PHẢI (DESKTOP HORIZONTAL LAYOUT) */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header Bar Xinh Xắn */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b-2 border-pink-200 px-8 flex items-center justify-between flex-shrink-0 z-10 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center">
              <HelloKittyHead className="w-8 h-8" bowColor="#ff2d75" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-pink-700 tracking-tight flex items-center gap-1.5">
                  {currentTab === 'alerts' 
                    ? 'Bảng Cảnh Báo Date Của Bông' 
                    : currentTab === 'new-batch' 
                    ? 'Khai Báo Lô Hàng Mới Cho Bông' 
                    : 'Cấu Hình Email Thông Báo ⚙️'}
                </h1>
                <HelloKittyBow className="w-4 h-4 inline" color="#ff2d75" />
              </div>
              <p className="text-xs text-pink-500 font-bold mt-0.5 flex items-center gap-1.5 capitalize">
                <Calendar className="w-3.5 h-3.5 text-pink-500" />
                <span>{currentDateVN}</span>
                <span>• Chúc Bông một ngày ngọt ngào! 🍓</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Nút Refresh */}
            {isElectronMode && (
              <button
                onClick={loadBatchesFromDB}
                title="Làm mới dữ liệu từ SQLite"
                className="p-2.5 text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 rounded-2xl border border-pink-200 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-pink-600' : ''}`} />
              </button>
            )}

            {/* Nút chuyển nhanh giữa 2 màn hình */}
            {currentTab === 'alerts' ? (
              <button
                onClick={() => setCurrentTab('new-batch')}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-black shadow-md shadow-pink-500/25 active:scale-95 transition-all cursor-pointer border border-pink-300"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Nhập Hàng Mới</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('alerts')}
                className="flex items-center gap-2 px-4 py-2.5 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded-2xl text-xs font-black shadow-sm transition-all cursor-pointer border border-pink-300"
              >
                <span>Xem Bảng Cảnh Báo 🎀</span>
                {stats.expiredCount + stats.warningCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] rounded-full font-black animate-pulse">
                    {stats.expiredCount + stats.warningCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </header>

        {/* Nội dung màn hình chính cuộn mượt mà */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentTab === 'alerts' && (
            <AlertList
              batches={batches}
              onToggleResolve={handleToggleResolve}
              onDeleteBatch={handleDeleteBatch}
              onUpdateBatch={handleUpdateBatch}
              onGoToNewBatch={() => setCurrentTab('new-batch')}
            />
          )}
          {currentTab === 'new-batch' && (
            <NewBatchForm
              onSaveBatch={handleSaveBatch}
              productSuggestions={productSuggestions}
              onComplete={() => setCurrentTab('alerts')}
            />
          )}
          {currentTab === 'settings' && (
            <Settings onGoBack={() => setCurrentTab('alerts')} />
          )}
        </div>
      </main>
    </div>
  );
}
