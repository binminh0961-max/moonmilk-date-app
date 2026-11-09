/**
 * ==============================================================================
 * MODULE: GỬI EMAIL THÔNG BÁO TỰ ĐỘNG & CRONJOB (MAILER) - ES MODULE & CJS COMPATIBLE
 * ==============================================================================
 * Đọc cấu hình Email động từ database (bảng settings)
 * Không hardcode email và app_password
 * ==============================================================================
 */

import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { getSettings, getAlertList } from './database.js';

let cronJobInstance = null;

/**
 * Gửi email thông báo hạn sử dụng sản phẩm
 * @param {object} options
 * @param {string} [options.subject] Tiêu đề email
 * @param {string} [options.html] Nội dung HTML
 * @param {string} [options.text] Nội dung Text thuần
 * @param {Array}  [options.items] Danh sách lô hàng
 * @returns {Promise<{success: boolean, message: string, messageId?: string}>}
 */
export async function sendMail(options = {}) {
  // 1. Đọc cấu hình động từ database SQLite
  const settings = getSettings();

  // 2. Kiểm tra nếu chưa cấu hình (sender_email hoặc app_password bị trống)
  if (!settings || !settings.sender_email?.trim() || !settings.app_password?.trim()) {
    console.error('❌ [Mailer Error] Không thể gửi email: sender_email hoặc app_password bị trống!');
    console.error('👉 Vui lòng vào màn hình "Cài Đặt" trong ứng dụng để thiết lập Email gửi và Mật khẩu ứng dụng.');
    return {
      success: false,
      message: 'Chưa cấu hình Email gửi hoặc Mật khẩu ứng dụng trong Cài đặt.',
    };
  }

  // 3. Phân tách danh sách email nhận (người dùng nhập cách nhau bởi dấu phẩy)
  const rawReceivers = settings.receiver_emails || '';
  const receiverList = rawReceivers
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && e.includes('@'));

  if (receiverList.length === 0) {
    console.error('❌ [Mailer Error] Không thể gửi email: Danh sách email nhận (receiver_emails) trống hoặc không hợp lệ!');
    return {
      success: false,
      message: 'Danh sách email nhận trống hoặc không hợp lệ.',
    };
  }

  console.log(`📧 [Mailer] Khởi tạo transport động cho sender: ${settings.sender_email}...`);

  // 4. Khởi tạo transport động từ thông tin cấu hình
  let transporter;
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: settings.sender_email.trim(),
        pass: settings.app_password.trim(),
      },
    });
  } catch (err) {
    console.error('❌ [Mailer Error] Lỗi khởi tạo nodemailer transport:', err.message);
    return { success: false, message: err.message };
  }

  // 5. Cấu hình nội dung thư
  const mailOptions = {
    from: `"Moonmilk Date Manager" <${settings.sender_email.trim()}>`,
    to: receiverList.join(', '), // Phân cách bằng dấu phẩy
    subject: options.subject || '🔔 [Moonmilk] Thông Báo Hạn Sử Dụng Sản Phẩm',
    text: options.text || 'Thông báo tự động về hạn sử dụng sản phẩm từ Moonmilk.',
    html: options.html || generateAlertEmailHtml(options.items || []),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Mailer Success] Gửi mail thành công đến: ${receiverList.join(', ')} (Message ID: ${info.messageId})`);
    return {
      success: true,
      message: `Đã gửi email thành công đến ${receiverList.length} địa chỉ.`,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ [Mailer Error] Lỗi khi gửi mail:', error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Gửi email thử nghiệm để kiểm tra thông tin cấu hình
 */
export async function sendTestEmail() {
  const now = new Date().toLocaleString('vi-VN');
  const testHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fbcfe8; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 20px; color: white; text-align: center;">
        <h2 style="margin: 0;">🎉 Kết Nối Email Thành Công!</h2>
      </div>
      <div style="padding: 20px; color: #334155;">
        <p>Xin chào,</p>
        <p>Cấu hình gửi email tự động của ứng dụng Moonmilk hoạt động bình thường!</p>
        <p>Thời gian gửi thử nghiệm: <strong>${now}</strong></p>
      </div>
    </div>
  `;

  return await sendMail({
    subject: '🧪 [Moonmilk] Thử nghiệm kết nối Email thành công! 💖',
    html: testHtml,
    text: `Kiểm tra email thành công lúc: ${now}`,
  });
}

/**
 * Tạo HTML bảng danh sách sản phẩm cảnh báo
 */
export function generateAlertEmailHtml(items = []) {
  let rowsHtml = items.map((item, i) => {
    const color = item.alert_color === 'RED' ? '#ef4444' : '#f59e0b';
    const label = item.days_remaining < 0 ? `Quá hạn ${Math.abs(item.days_remaining)} ngày` : `Còn ${item.days_remaining} ngày`;
    return `
      <tr style="border-bottom: 1px solid #f1f5f9; ${i % 2 === 1 ? 'background: #fdf2f8;' : ''}">
        <td style="padding: 10px 12px; font-weight: bold;">${item.product_name || item.name}</td>
        <td style="padding: 10px 12px;">${item.location || item.shelf_location || 'Kệ'}</td>
        <td style="padding: 10px 12px; text-align: center;">${item.quantity || 0}</td>
        <td style="padding: 10px 12px; text-align: center;">${item.expiration_date || item.expiry_date}</td>
        <td style="padding: 10px 12px; text-align: center; color: ${color}; font-weight: bold;">${label}</td>
      </tr>
    `;
  }).join('');

  if (items.length === 0) {
    rowsHtml = `<tr><td colspan="5" style="padding: 16px; text-align: center; color: #64748b;">Không có sản phẩm nào cận hạn hoặc quá hạn!</td></tr>`;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; border: 1px solid #fbcfe8; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #e11d48, #be123c); padding: 20px; color: white;">
        <h2 style="margin: 0;">🚨 CẢNH BÁO HẠN SỬ DỤNG SẢN PHẨM</h2>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Báo cáo tự động từ hệ thống Moonmilk</p>
      </div>
      <div style="padding: 20px;">
        <p>Danh sách <strong>${items.length}</strong> sản phẩm cần kiểm tra:</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #fdf2f8; color: #9d174d;">
              <th style="padding: 8px 12px; text-align: left;">Sản Phẩm</th>
              <th style="padding: 8px 12px; text-align: left;">Vị Trí</th>
              <th style="padding: 8px 12px;">Số Lượng</th>
              <th style="padding: 8px 12px;">Hạn Dùng</th>
              <th style="padding: 8px 12px;">Tình Trạng</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Khởi động Cronjob gửi email định kỳ
 * @param {string} [cronSchedule='0 8 * * *'] Mặc định lúc 8:00 sáng mỗi ngày
 */
export function startCronJob(cronSchedule = '0 8 * * *') {
  if (cronJobInstance) cronJobInstance.stop();

  console.log(`⏰ [Cronjob] Lên lịch quét hạn sử dụng định kỳ: "${cronSchedule}"`);
  cronJobInstance = cron.schedule(cronSchedule, async () => {
    console.log('⏰ [Cronjob Triggered] Đang quét các sản phẩm cảnh báo...');
    try {
      const alerts = getAlertList ? getAlertList() : [];
      const filterUrgent = alerts.filter(a => a.alert_color === 'RED' || a.alert_color === 'YELLOW');

      if (filterUrgent.length === 0) {
        console.log('✅ [Cronjob] Không có sản phẩm nào cận hạn hôm nay.');
        return;
      }

      console.log(`⚠️ [Cronjob] Tìm thấy ${filterUrgent.length} sản phẩm cần cảnh báo. Đang gửi email...`);
      await sendMail({
        subject: `🚨 [Moonmilk] Cảnh báo: Có ${filterUrgent.length} sản phẩm cận hạn / hết hạn!`,
        items: filterUrgent,
      });
    } catch (e) {
      console.error('❌ [Cronjob Error] Lỗi quét tự động:', e.message);
    }
  });

  return cronJobInstance;
}

export function stopCronJob() {
  if (cronJobInstance) {
    cronJobInstance.stop();
    cronJobInstance = null;
  }
}

export default {
  sendMail,
  sendTestEmail,
  startCronJob,
  stopCronJob,
  generateAlertEmailHtml,
};
