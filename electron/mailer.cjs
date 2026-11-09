/**
 * ==============================================================================
 * MODULE: GỬI EMAIL THÔNG BÁO TỰ ĐỘNG & CRONJOB (MAILER)
 * ==============================================================================
 * - Đọc cấu hình động từ SQLite (database.cjs) qua hàm getSettings()
 * - Không hardcode email hay mật khẩu
 * - Quản lý tiến trình Cronjob chạy ngầm định kỳ
 * ==============================================================================
 */

const nodemailer = require('nodemailer');
const cron = require('node-cron');
const database = require('./database.cjs');

let cronJobInstance = null;

/**
 * Hàm gửi email thông báo động
 * @param {object} options
 * @param {string} [options.subject] Tiêu đề email
 * @param {string} [options.html] Nội dung HTML
 * @param {string} [options.text] Nội dung Text thuần
 * @param {Array}  [options.items] Danh sách lô hàng cần cảnh báo
 * @returns {Promise<{success: boolean, message: string, messageId?: string}>}
 */
async function sendMail(options = {}) {
  // 1. Lấy cấu hình email mới nhất từ database
  const settings = database.getSettings();

  // 2. Kiểm tra nếu chưa cấu hình (sender_email hoặc app_password bị trống)
  if (!settings || !settings.sender_email?.trim() || !settings.app_password?.trim()) {
    console.error('❌ [Mailer Error] Không thể gửi mail: sender_email hoặc app_password bị trống!');
    console.error('👉 Vui lòng vào màn hình "Cài Đặt" trong ứng dụng để nhập Email gửi và Mật khẩu ứng dụng.');
    return {
      success: false,
      message: 'Chưa cấu hình Email gửi hoặc Mật khẩu ứng dụng trong Cài đặt.',
    };
  }

  // 3. Xử lý danh sách email nhận (cách nhau bởi dấu phẩy)
  const rawReceivers = settings.receiver_emails || '';
  const receiverList = rawReceivers
    .split(',')
    .map((email) => email.trim())
    .filter((email) => email.length > 0 && email.includes('@'));

  if (receiverList.length === 0) {
    console.error('❌ [Mailer Error] Không thể gửi mail: Danh sách email nhận (receiver_emails) trống hoặc không hợp lệ!');
    console.error('👉 Dữ liệu hiện tại:', rawReceivers);
    return {
      success: false,
      message: 'Danh sách email nhận trống hoặc không hợp lệ.',
    };
  }

  console.log(`📧 [Mailer] Bắt đầu khởi tạo Nodemailer transport cho: ${settings.sender_email}...`);

  // 4. Khởi tạo transport động với thông tin lấy từ database
  let transporter;
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: settings.sender_email.trim(),
        pass: settings.app_password.trim(),
      },
    });
  } catch (transportErr) {
    console.error('❌ [Mailer Error] Lỗi khi tạo transport:', transportErr.message);
    return {
      success: false,
      message: `Lỗi khởi tạo mail transport: ${transportErr.message}`,
    };
  }

  // 5. Chuẩn bị nội dung gửi mail
  const subject = options.subject || '🔔 [Moonmilk] Cảnh Báo Sản Phẩm Cận Hạn & Quá Hạn';
  const htmlContent = options.html || generateAlertEmailHtml(options.items || []);
  const textContent = options.text || 'Hệ thống gửi cảnh báo hạn sử dụng từ ứng dụng Quản lý Date Moonmilk.';

  const mailOptions = {
    from: `"Moonmilk Date Manager" <${settings.sender_email.trim()}>`,
    to: receiverList.join(', '), // Danh sách email nhận dạng "a@gmail.com, b@gmail.com"
    subject: subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    console.log(`🚀 [Mailer] Đang gửi mail tới [${receiverList.join(', ')}]...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Mailer Success] Đã gửi email thành công! Message ID: ${info.messageId}`);
    return {
      success: true,
      message: `Đã gửi email thành công đến ${receiverList.length} địa chỉ.`,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ [Mailer Error] Lỗi trong quá trình gửi mail qua Nodemailer:', error.message);
    return {
      success: false,
      message: `Lỗi gửi mail: ${error.message}`,
    };
  }
}

/**
 * Gửi email thử nghiệm để kiểm tra cấu hình tài khoản
 */
async function sendTestEmail() {
  const now = new Date().toLocaleString('vi-VN');
  const testHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #fed7e2; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px;">🌸 Kiểm Tra Kết Nối Email Thành Công!</h1>
        <p style="margin: 8px 0 0; opacity: 0.9; font-size: 13px;">Hệ thống Quản lý Hạn Sử Dụng Moonmilk</p>
      </div>
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <p style="font-size: 15px; font-weight: bold; color: #0f172a;">Xin chào bạn,</p>
        <p>Cấu hình gửi email tự động của bạn trên ứng dụng Moonmilk đã được thiết lập <strong>hoàn toàn chính xác</strong> và sẵn sàng hoạt động!</p>
        <div style="background: #fdf2f8; border-left: 4px solid #ec4899; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 0; font-size: 13px; color: #831843;">
            ⏰ <strong>Thời gian gửi thử:</strong> ${now}<br/>
            ⚙️ <strong>Chế độ:</strong> SMTP Gmail (App Password động từ SQLite)
          </p>
        </div>
        <p style="font-size: 13px; color: #64748b;">Hệ thống Cronjob sẽ tự động quét các lô hàng cận hạn và gửi báo cáo chi tiết đến danh sách email này.</p>
      </div>
      <div style="background: #fff5f7; padding: 14px 24px; text-align: center; font-size: 11px; color: #9d174d; border-top: 1px solid #fce7f3;">
        © Moonmilk Expiry Manager • Thông báo tự động không cần trả lời
      </div>
    </div>
  `;

  return await sendMail({
    subject: '🧪 [Moonmilk] Thử nghiệm kết nối Email thành công! 💖',
    html: testHtml,
    text: `Kiểm tra kết nối email thành công vào lúc: ${now}`,
  });
}

/**
 * Tạo giao diện HTML cho email thông báo danh sách sản phẩm cận hạn / quá hạn
 * @param {Array} items
 * @returns {string} HTML string
 */
function generateAlertEmailHtml(items = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let rowsHtml = '';

  if (items.length === 0) {
    rowsHtml = `
      <tr>
        <td colspan="5" style="padding: 16px; text-align: center; color: #64748b;">
          Hiện không có sản phẩm nào cận hạn hoặc quá hạn. Tất cả đều an toàn! 🌸
        </td>
      </tr>
    `;
  } else {
    items.forEach((item, index) => {
      const expiry = new Date(item.expiry_date);
      const diffTime = expiry - today;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let badgeColor = '#10b981'; // Green
      let badgeBg = '#ecfdf5';
      let statusText = `Còn ${days} ngày`;

      if (days < 0) {
        badgeColor = '#ef4444'; // Red
        badgeBg = '#fef2f2';
        statusText = `Đã quá hạn ${Math.abs(days)} ngày`;
      } else if (days <= (item.warning_days || 7)) {
        badgeColor = '#f59e0b'; // Yellow
        badgeBg = '#fffbeb';
        statusText = `Cận date (${days} ngày)`;
      }

      rowsHtml += `
        <tr style="border-bottom: 1px solid #f1f5f9; ${index % 2 === 1 ? 'background-color: #fafafa;' : ''}">
          <td style="padding: 12px 14px; font-weight: bold; color: #1e293b;">${item.product_name || item.name}</td>
          <td style="padding: 12px 14px; color: #475569;">${item.shelf_location || 'Kệ chính'}</td>
          <td style="padding: 12px 14px; text-align: center; font-weight: bold; color: #0284c7;">${item.quantity || 0}</td>
          <td style="padding: 12px 14px; text-align: center; color: #334155;">${item.expiry_date}</td>
          <td style="padding: 12px 14px; text-align: center;">
            <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; color: ${badgeColor}; background: ${badgeBg};">
              ${statusText}
            </span>
          </td>
        </tr>
      `;
    });
  }

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 720px; margin: 0 auto; background: #ffffff; border: 1px solid #fce7f3; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
      <div style="background: linear-gradient(135deg, #e11d48, #be123c); padding: 24px; color: white;">
        <h2 style="margin: 0; font-size: 20px;">🚨 CẢNH BÁO HẠN SỬ DỤNG SẢN PHẨM</h2>
        <p style="margin: 6px 0 0; opacity: 0.9; font-size: 13px;">
          Báo cáo tự động từ Hệ thống Moonmilk • Ngày: ${today.toLocaleDateString('vi-VN')}
        </p>
      </div>

      <div style="padding: 24px;">
        <p style="margin-top: 0; font-size: 14px; color: #334155;">
          Phát hiện <strong>${items.length}</strong> lô hàng cần kiểm tra và xử lý ngay tại quầy/kho:
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; margin: 16px 0;">
          <thead>
            <tr style="background-color: #fdf2f8; color: #831843; font-weight: bold; border-bottom: 2px solid #fbcfe8;">
              <th style="padding: 10px 14px;">Tên Sản Phẩm</th>
              <th style="padding: 10px 14px;">Vị Trí Kệ</th>
              <th style="padding: 10px 14px; text-align: center;">Số Lượng</th>
              <th style="padding: 10px 14px; text-align: center;">Hạn Dùng</th>
              <th style="padding: 10px 14px; text-align: center;">Tình Trạng</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 14px; border-radius: 8px; font-size: 12px; color: #64748b;">
          💡 <strong>Hành động đề xuất:</strong> Vui lòng kiểm tra kệ hàng, ưu tiên dán tem giảm giá cho sản phẩm cận date hoặc thu hồi sản phẩm quá hạn theo quy trình.
        </div>
      </div>

      <div style="background: #fdf2f8; padding: 14px; text-align: center; font-size: 11px; color: #9d174d; border-top: 1px solid #fce7f3;">
        Hệ thống Quản lý Moonmilk Expiry Manager • Thông báo tự động định kỳ
      </div>
    </div>
  `;
}

/**
 * ==============================================================================
 * LOGIC CRONJOB: TỰ ĐỘNG QUÉT VÀ GỬI EMAIL ĐỊNH KỲ
 * ==============================================================================
 */

/**
 * Khởi động tiến trình Cronjob gửi mail tự động
 * Mặc định: Chạy mỗi ngày lúc 08:00 sáng ('0 8 * * *')
 * @param {string} [cronSchedule='0 8 * * *'] Biểu thức cron
 */
function startCronJob(cronSchedule = '0 8 * * *') {
  if (cronJobInstance) {
    cronJobInstance.stop();
  }

  console.log(`⏰ [Cronjob] Đã kích hoạt lịch quét hạn sử dụng: "${cronSchedule}"`);

  cronJobInstance = cron.schedule(cronSchedule, async () => {
    console.log(`\n⏰ [Cronjob Triggered] ${new Date().toLocaleString('vi-VN')}: Tiến hành quét hạn sử dụng...`);

    try {
      // 1. Kiểm tra cấu hình trước khi xử lý
      const settings = database.getSettings();
      if (!settings?.sender_email?.trim() || !settings?.app_password?.trim()) {
        console.warn('⚠️ [Cronjob] Bỏ qua: Chưa có cấu hình Email gửi hoặc Mật khẩu ứng dụng trong Cài đặt.');
        return;
      }

      // 2. Lấy toàn bộ lô hàng từ SQLite
      const batches = database.getAllBatches ? database.getAllBatches() : [];

      // 3. Lọc các sản phẩm chưa xử lý (is_resolved = 0) và cận date hoặc quá hạn
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const alertItems = batches.filter((b) => {
        if (b.is_resolved === 1) return false;
        const expiry = new Date(b.expiry_date);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const warningDays = b.warning_days || 7;
        return diffDays <= warningDays; // Cận hạn hoặc quá hạn
      });

      if (alertItems.length === 0) {
        console.log('✅ [Cronjob] Không có sản phẩm nào cận hạn hoặc quá hạn hôm nay. Không cần gửi mail.');
        return;
      }

      console.log(`⚠️ [Cronjob] Phát hiện ${alertItems.length} sản phẩm cần gửi cảnh báo!`);

      // 4. Gửi email cảnh báo
      await sendMail({
        subject: `🚨 [Moonmilk] Cảnh Báo: Có ${alertItems.length} Sản Phẩm Cận Hạn / Hết Hạn Cần Xử Lý`,
        items: alertItems,
      });
    } catch (err) {
      console.error('❌ [Cronjob Error] Lỗi trong tiến trình quét cronjob:', err.message);
    }
  });

  return cronJobInstance;
}

/**
 * Dừng tiến trình Cronjob
 */
function stopCronJob() {
  if (cronJobInstance) {
    cronJobInstance.stop();
    cronJobInstance = null;
    console.log('🛑 [Cronjob] Đã dừng tiến trình quét email tự động.');
  }
}

module.exports = {
  sendMail,
  sendNotificationEmail: sendMail, // alias
  sendTestEmail,
  startCronJob,
  stopCronJob,
  generateAlertEmailHtml,
};
