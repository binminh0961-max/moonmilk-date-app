/**
 * Các hàm tiện ích tính toán và định dạng ngày tháng hạn sử dụng
 * Cập nhật theo Quy tắc kinh doanh mới (3 mốc cố định):
 * - RED (Đỏ): Khoảng cách ngày <= 15 ngày (Xả gấp 50%)
 * - YELLOW (Vàng): Khoảng cách ngày từ 16 đến 30 ngày (Cận date 30%)
 * - GREEN (Xanh lá): Khoảng cách ngày > 30 ngày (An toàn)
 */

/**
 * Tính số ngày còn lại đến hạn (chênh lệch giữa expiryDate và today)
 * Trả về số nguyên: âm (<0) là đã quá hạn, 0 là hôm nay, dương (>0) là còn hạn
 */
export function getDaysRemaining(expiryDateString) {
  if (!expiryDateString) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = expiryDateString.split('-').map(Number);
  const expiry = new Date(year, month - 1, day);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Phân loại trạng thái hạn sử dụng theo 3 mốc cố định:
 * - 'RED' / 'EXPIRED': days <= 15
 * - 'YELLOW' / 'WARNING': 16 <= days <= 30
 * - 'GREEN' / 'SAFE': days > 30
 */
export function getExpiryStatus(expiryDateString) {
  const days = getDaysRemaining(expiryDateString);

  // MỐC 1: RED (ĐỎ) - Khoảng cách ngày <= 15 ngày
  if (days <= 15) {
    let label = '';
    if (days < 0) {
      label = `Quá hạn ${Math.abs(days)} ngày`;
    } else if (days === 0) {
      label = 'Hết hạn hôm nay';
    } else {
      label = `Xả gấp (còn ${days} ngày)`;
    }

    return {
      type: 'RED',
      code: 'RED',
      label,
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-300 ring-rose-500/20',
      dotClass: 'bg-rose-500 animate-pulse',
      icon: '🔴',
      days,
    };
  }

  // MỐC 2: YELLOW (VÀNG) - Khoảng cách ngày từ 16 đến 30 ngày
  if (days <= 30) {
    return {
      type: 'YELLOW',
      code: 'YELLOW',
      label: `Cận date (còn ${days} ngày)`,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 ring-amber-500/20',
      dotClass: 'bg-amber-500',
      icon: '🟡',
      days,
    };
  }

  // MỐC 3: GREEN (XANH) - Khoảng cách ngày > 30 ngày
  return {
    type: 'GREEN',
    code: 'GREEN',
    label: `An toàn (còn ${days} ngày)`,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-emerald-500/20',
    dotClass: 'bg-emerald-500',
    icon: '🟢',
    days,
  };
}

/**
 * Định dạng ngày sang DD/MM/YYYY chuẩn Việt Nam
 */
export function formatDateVN(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Lấy ngày dạng YYYY-MM-DD sau khi cộng thêm số ngày từ hôm nay
 */
export function getDateWithOffset(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
