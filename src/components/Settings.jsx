import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Key, 
  Users, 
  Save, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { HelloKittyBow } from './HelloKittyStickers';

export default function Settings({ onGoBack }) {
  const [formData, setFormData] = useState({
    sender_email: '',
    app_password: '',
    receiver_emails: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [showGuide, setShowGuide] = useState(false);

  // 1. Khi Component Mount (useEffect): Gọi API để load cấu hình cũ lên form
  useEffect(() => {
    let isMounted = true;

    async function loadCurrentSettings() {
      setIsLoading(true);
      try {
        if (window.electronAPI?.getSettings) {
          const res = await window.electronAPI.getSettings();
          if (isMounted && res) {
            setFormData({
              sender_email: res.sender_email || '',
              app_password: res.app_password || '',
              receiver_emails: res.receiver_emails || '',
            });
          }
        } else {
          // Dự phòng khi chạy chế độ Web Browser Preview (Mock)
          const localSaved = localStorage.getItem('moonmilk_email_settings');
          if (localSaved && isMounted) {
            setFormData(JSON.parse(localSaved));
          }
        }
      } catch (err) {
        console.error('Lỗi khi nạp cấu hình settings:', err);
        if (isMounted) {
          setAlert({
            type: 'error',
            message: `Không thể tải cấu hình: ${err.message}`,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCurrentSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Tự xóa alert khi người dùng bắt đầu chỉnh sửa lại
    if (alert.message) setAlert({ type: '', message: '' });
  };

  // 2. Khi bấm "Lưu cài đặt": Gọi API để lưu và hiển thị thông báo thành công
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    // Validate nhanh dữ liệu đầu vào
    if (!formData.sender_email.trim()) {
      setAlert({ type: 'error', message: 'Vui lòng nhập Email Gửi (Sender Email).' });
      return;
    }
    if (!formData.app_password.trim()) {
      setAlert({ type: 'error', message: 'Vui lòng nhập Mật khẩu ứng dụng (App Password).' });
      return;
    }
    if (!formData.receiver_emails.trim()) {
      setAlert({ type: 'error', message: 'Vui lòng nhập ít nhất một Email nhận thông báo.' });
      return;
    }

    setIsSaving(true);
    try {
      if (window.electronAPI?.saveSettings) {
        const result = await window.electronAPI.saveSettings(formData);
        if (result?.success) {
          setAlert({
            type: 'success',
            message: '🎉 Đã lưu cấu hình Email thành công vào hệ thống SQLite!',
          });
        } else {
          throw new Error(result?.message || 'Lỗi không xác định từ SQLite.');
        }
      } else {
        // Fallback localStorage cho Browser
        localStorage.setItem('moonmilk_email_settings', JSON.stringify(formData));
        setAlert({
          type: 'success',
          message: '🌸 [Mock Mode] Đã lưu cấu hình vào bộ nhớ tạm trình duyệt!',
        });
      }
    } catch (err) {
      console.error('Lỗi khi lưu cài đặt:', err);
      setAlert({
        type: 'error',
        message: `Lỗi khi lưu cài đặt: ${err.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Gửi Email Thử Nghiệm (Tính năng hỗ trợ kiểm tra kết nối ngay lập tức)
  const handleSendTestEmail = async () => {
    setAlert({ type: '', message: '' });

    if (!formData.sender_email.trim() || !formData.app_password.trim()) {
      setAlert({
        type: 'error',
        message: 'Vui lòng điền đầy đủ Email Gửi và Mật khẩu ứng dụng trước khi thử nghiệm!',
      });
      return;
    }

    setIsTesting(true);
    try {
      // Trước khi gửi test, tự động lưu lại cấu hình mới nhất
      if (window.electronAPI?.saveSettings) {
        await window.electronAPI.saveSettings(formData);
      }

      if (window.electronAPI?.sendTestEmail) {
        const res = await window.electronAPI.sendTestEmail();
        if (res?.success) {
          setAlert({
            type: 'success',
            message: `💌 Gửi thư thử nghiệm thành công! Hãy kiểm tra hộp thư đến của: ${formData.receiver_emails}`,
          });
        } else {
          setAlert({
            type: 'error',
            message: `Gửi email thất bại: ${res?.message || 'Vui lòng kiểm tra lại mật khẩu ứng dụng Gmail.'}`,
          });
        }
      } else {
        setAlert({
          type: 'info',
          message: 'Chức năng gửi mail thực tế yêu cầu chạy trong môi trường Electron Desktop.',
        });
      }
    } catch (err) {
      console.error('Lỗi gửi email thử nghiệm:', err);
      setAlert({
        type: 'error',
        message: `Lỗi gửi thử nghiệm: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Danh sách email nhận dạng badge preview
  const previewReceivers = formData.receiver_emails
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* 1. Header Card Xinh Xắn */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-pink-200 relative overflow-hidden">
        <div className="absolute top-2 right-4 opacity-15 pointer-events-none">
          <HelloKittyBow className="w-28 h-28" color="#ff2d75" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-400 p-0.5 shadow-md shadow-pink-500/25 flex items-center justify-center text-white flex-shrink-0">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-pink-700 tracking-tight">
                  Cấu Hình Email Thông Báo
                </h2>
                <HelloKittyBow className="w-5 h-5 inline" color="#ff2d75" />
              </div>
              <p className="text-xs sm:text-sm text-pink-500 font-semibold mt-0.5">
                Thiết lập tài khoản gửi &amp; danh sách nhận thông báo cận hạn tự động
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-pink-600" />
            <span>{showGuide ? 'Ẩn Hướng Dẫn' : 'Cách Tạo App Password?'}</span>
          </button>
        </div>

        {/* Khung hướng dẫn tạo Google App Password khi người dùng click */}
        {showGuide && (
          <div className="mt-5 p-4 sm:p-5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-200 text-xs sm:text-sm text-pink-900 space-y-2 animate-fadeIn">
            <div className="font-extrabold flex items-center gap-1.5 text-pink-800">
              <ShieldCheck className="w-4 h-4 text-pink-600" />
              <span>Hướng Dẫn 3 Bước Lấy "Mật Khẩu Ứng Dụng" (Google App Password):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-pink-700 pl-1 font-medium">
              <li>
                Đăng nhập tài khoản Google và bật <strong>Xác minh 2 bước</strong> (2-Step Verification) tại:{' '}
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-pink-600 hover:text-pink-800 inline-flex items-center gap-0.5"
                >
                  myaccount.google.com/security <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Tìm mục <strong>"Mật khẩu ứng dụng" (App passwords)</strong>, chọn ứng dụng là <em>"Thư" (Mail)</em> và thiết bị là <em>"Máy tính Windows"</em>.
              </li>
              <li>
                Google sẽ tạo mã <strong>16 ký tự</strong> (ví dụ: <code className="bg-white px-2 py-0.5 rounded border border-pink-200 font-mono text-pink-600">abcd efgh ijkl mnop</code>). Hãy sao chép và dán vào ô <strong>Mật khẩu ứng dụng</strong> bên dưới.
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* 2. Thông Báo Trạng Thái (Alert Toast) */}
      {alert.message && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-bold shadow-sm transition-all ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : alert.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : alert.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-sky-600 flex-shrink-0" />
            )}
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert({ type: '', message: '' })}
            className="text-xs px-2 py-1 rounded-lg opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Form Cài Đặt Chính */}
      <form
        onSubmit={handleSaveSettings}
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-pink-200 space-y-6"
      >
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-pink-600">
            <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
            <span className="text-sm font-bold">Đang nạp cấu hình từ SQLite...</span>
          </div>
        ) : (
          <>
            {/* Input 1: Email Gửi (Sender Email) */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-extrabold text-pink-900">
                1. Email Gửi (Sender Email) <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-2xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="sender_email"
                  value={formData.sender_email}
                  onChange={handleChange}
                  placeholder="ví dụ: cuahang.moonmilk@gmail.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-[11px] text-pink-500 font-medium pl-1">
                Tài khoản Gmail được dùng làm máy chủ SMTP để phát đi thông báo.
              </p>
            </div>

            {/* Input 2: Mật khẩu ứng dụng (App Password - loại input password) */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-extrabold text-pink-900">
                2. Mật Khẩu Ứng Dụng (App Password) <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-2xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-400">
                  <Key className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="app_password"
                  value={formData.app_password}
                  onChange={handleChange}
                  placeholder="Nhập mã 16 ký tự (ví dụ: abcd efgh ijkl mnop)"
                  required
                  autoComplete="new-password"
                  className="w-full pl-11 pr-12 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-pink-400 hover:text-pink-600 cursor-pointer"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[11px] text-pink-500 font-medium pl-1">
                Không dùng mật khẩu đăng nhập Gmail thông thường. Bắt buộc dùng <strong>Mật khẩu ứng dụng 16 ký tự</strong>.
              </p>
            </div>

            {/* Input 3: Danh sách Email nhận (Gợi ý người dùng nhập cách nhau bằng dấu phẩy) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs sm:text-sm font-extrabold text-pink-900">
                  3. Danh Sách Email Nhận (Receiver Emails) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-bold text-pink-600 bg-pink-100 px-2.5 py-0.5 rounded-full">
                  Phân cách bằng dấu phẩy ( , )
                </span>
              </div>

              <div className="relative rounded-2xl shadow-xs">
                <div className="absolute top-3.5 left-3.5 pointer-events-none text-pink-400">
                  <Users className="w-5 h-5" />
                </div>
                <textarea
                  name="receiver_emails"
                  rows={3}
                  value={formData.receiver_emails}
                  onChange={handleChange}
                  placeholder="vi-du: quanly@moonmilk.vn, ketoan@moonmilk.vn, cuahangtruong@gmail.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all resize-y"
                />
              </div>

              {/* Tag Preview các email nhận */}
              {previewReceivers.length > 0 && (
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-pink-500 font-bold">Email nhận ({previewReceivers.length}):</span>
                  {previewReceivers.map((email, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-pink-700 border border-pink-200 shadow-2xs"
                    >
                      {email}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Thông tin lịch chạy Cronjob tự động */}
            <div className="p-4 bg-pink-50/70 rounded-2xl border border-pink-200 flex items-start gap-3">
              <Clock className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-pink-800 space-y-0.5">
                <div className="font-extrabold">Lịch Quét Tự Động Định Kỳ (Cronjob)</div>
                <div className="text-pink-600 font-medium leading-relaxed">
                  Hệ thống tự động chạy ngầm lúc <strong>08:00 sáng mỗi ngày</strong>. Nếu phát hiện sản phẩm có hạn dùng &le; ngày cảnh báo hoặc đã quá hạn, email thông báo sẽ tự động gửi tới danh sách người nhận trên.
                </div>
              </div>
            </div>

            {/* Các nút hành động: Lưu cài đặt & Gửi thử nghiệm */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t-2 border-pink-100">
              {/* Nút gửi thử nghiệm */}
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isTesting || isSaving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-pink-700 bg-pink-100 hover:bg-pink-200 active:scale-95 transition-all cursor-pointer border border-pink-300 disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-pink-600" />
                    <span>Đang Gửi Thử...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-pink-600" />
                    <span>Gửi Thử Nghiệm</span>
                  </>
                )}
              </button>

              {/* Nút lưu cấu hình */}
              <button
                type="submit"
                disabled={isSaving || isTesting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30 active:scale-95 transition-all cursor-pointer border border-pink-300 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu Cài Đặt ✨</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
