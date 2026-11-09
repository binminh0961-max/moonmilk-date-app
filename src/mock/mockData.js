import { getDateWithOffset } from '../utils/dateUtils';

/**
 * Dữ liệu Mock tĩnh hiển thị trực quan theo 3 mốc cố định mới:
 * 🔴 Đỏ: <= 15 ngày (Xả gấp 50%)
 * 🟡 Vàng: 16 - 30 ngày (Cận date 30%)
 * 🟢 Xanh: > 30 ngày (An toàn)
 */
export const INITIAL_MOCK_BATCHES = [
  // Mốc 1: RED (Đỏ) - <= 15 ngày
  {
    batch_id: 1,
    product_id: 'P001',
    product_name: 'Sữa chua TH True Milk Nha Đam 100g',
    category: 'Sữa & Bơ sữa',
    shelf_location: 'Tủ mát B1-02',
    location: 'Tủ mát B1-02',
    quantity: 16,
    expiry_date: getDateWithOffset(-2), // Quá hạn 2 ngày -> RED
    expiration_date: getDateWithOffset(-2),
    status: 'TRACKING',
    is_resolved: 0,
    batch_code: 'LOT-TH-8902',
    note: 'Hạ kệ chờ lập biên bản hủy'
  },
  {
    batch_id: 2,
    product_id: 'P002',
    product_name: 'Bánh mì hoa cúc Harrys Brioche Pháp 515g',
    category: 'Bánh tươi',
    shelf_location: 'Kệ A3-01',
    location: 'Kệ A3-01',
    quantity: 8,
    expiry_date: getDateWithOffset(5), // Còn 5 ngày -> RED (Xả gấp 50%)
    expiration_date: getDateWithOffset(5),
    status: 'TRACKING',
    is_resolved: 0,
    batch_code: 'LOT-HR-4412',
    note: 'Bông dán tem xả gấp 50%'
  },
  {
    batch_id: 3,
    product_id: 'P003',
    product_name: 'Xúc xích tiệt trùng Heo Vissan Gói 200g',
    category: 'Thực phẩm chế biến',
    shelf_location: 'Kệ A1-04',
    location: 'Kệ A1-04',
    quantity: 24,
    expiry_date: getDateWithOffset(12), // Còn 12 ngày -> RED (Xả gấp 50%)
    expiration_date: getDateWithOffset(12),
    status: 'TRACKING',
    is_resolved: 0,
    batch_code: 'LOT-VS-5521',
    note: 'Bông dán tem xả gấp 50%'
  },

  // Mốc 2: YELLOW (Vàng) - 16 đến 30 ngày
  {
    batch_id: 4,
    product_id: 'P004',
    product_name: 'Phô mai Lát Con Bò Cười Gói 200g',
    category: 'Sữa & Bơ sữa',
    shelf_location: 'Tủ mát C2-05',
    location: 'Tủ mát C2-05',
    quantity: 12,
    expiry_date: getDateWithOffset(18), // Còn 18 ngày -> YELLOW (Cận date 30%)
    expiration_date: getDateWithOffset(18),
    status: 'TRACKING',
    is_resolved: 0,
    batch_code: 'LOT-CB-1109',
    note: 'Bông dán tem giảm giá 30%'
  },
  {
    batch_id: 5,
    product_id: 'P005',
    product_name: 'Nước ép cam Vfresh Vinamilk Hộp 1L',
    category: 'Đồ uống',
    shelf_location: 'Kệ D1-02',
    location: 'Kệ D1-02',
    quantity: 18,
    expiry_date: getDateWithOffset(25), // Còn 25 ngày -> YELLOW (Cận date 30%)
    expiration_date: getDateWithOffset(25),
    status: 'TRACKING',
    is_resolved: 0,
    batch_code: 'LOT-VF-7714',
    note: 'Bông dán tem giảm giá 30%'
  },

  // Mốc 3: GREEN (Xanh) - > 30 ngày
  {
    batch_id: 6,
    product_id: 'P006',
    product_name: 'Nước khoáng thiên nhiên LaVie Chai 500ml',
    category: 'Đồ uống',
    shelf_location: 'Kệ E2-03',
    location: 'Kệ E2-03',
    quantity: 140,
    expiry_date: getDateWithOffset(120), // Còn 120 ngày -> GREEN
    expiration_date: getDateWithOffset(120),
    status: 'TRACKING',
    is_resolved: 0,
    batch_code: 'LOT-LV-9921',
    note: 'Hạn dài tha hồ bán nha Bông'
  },
  {
    batch_id: 7,
    product_id: 'P007',
    product_name: 'Mì ăn liền Hảo Hảo Tôm chua cay 75g',
    category: 'Mì & Bún khô',
    shelf_location: 'Kệ A2-01',
    location: 'Kệ A2-01',
    quantity: 360,
    expiry_date: getDateWithOffset(90), // Còn 90 ngày -> GREEN
    expiration_date: getDateWithOffset(90),
    status: 'TRACKING',
    is_resolved: 0,
    batch_code: 'LOT-HH-6632',
    note: 'Hạn dài an toàn'
  },
  {
    batch_id: 8,
    product_id: 'P008',
    product_name: 'Pate gan Hạ Long Can 150g',
    category: 'Đồ hộp',
    shelf_location: 'Kệ B3-04',
    location: 'Kệ B3-04',
    quantity: 5,
    expiry_date: getDateWithOffset(4),
    expiration_date: getDateWithOffset(4),
    status: 'CLEARED', // Đã xử lý xong
    is_resolved: 1,
    batch_code: 'LOT-HL-3301',
    note: 'Đã hoàn tất thanh lý'
  }
];

export const MOCK_PRODUCT_SUGGESTIONS = [
  { name: 'Sữa chua TH True Milk Nha Đam 100g', shelf_location: 'Tủ mát B1-02' },
  { name: 'Bánh mì hoa cúc Harrys Brioche Pháp 515g', shelf_location: 'Kệ A3-01' },
  { name: 'Xúc xích tiệt trùng Heo Vissan Gói 200g', shelf_location: 'Kệ A1-04' },
  { name: 'Phô mai Lát Con Bò Cười Gói 200g', shelf_location: 'Tủ mát C2-05' },
  { name: 'Nước ép cam Vfresh Vinamilk Hộp 1L', shelf_location: 'Kệ D1-02' },
  { name: 'Nước khoáng thiên nhiên LaVie Chai 500ml', shelf_location: 'Kệ E2-03' },
  { name: 'Mì ăn liền Hảo Hảo Tôm chua cay 75g', shelf_location: 'Kệ A2-01' },
  { name: 'Bột giặt OMO Matic Cửa Trên Túi 3.6kg', shelf_location: 'Kệ H1-01' }
];
