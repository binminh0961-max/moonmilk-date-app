import React from 'react';

/**
 * Các biểu tượng và Sticker Hello Kitty chuẩn SVG siêu sắc nét, dễ thương
 * Thiết kế riêng theo phong cách Sanrio tone Hồng kẹo ngọt cho bạn Bông 🎀
 */

// 1. Sticker Mặt Hello Kitty Kinh Điển với chiếc nơ hồng
export function HelloKittyHead({ className = "w-12 h-12", bowColor = "#ff2d75" }) {
  return (
    <svg viewBox="0 0 100 85" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="kitty-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f472b6" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Đầu & Tai Tròn */}
      <g filter="url(#kitty-glow)">
        <path
          d="M26 23 C22 13 14 6 12 11 C10 16 17 26 19 31 C10 39 8 57 18 69 C28 81 72 81 82 69 C92 57 90 39 81 31 C83 26 90 16 88 11 C86 6 78 13 74 23 C66 18 34 18 26 23 Z"
          fill="#FFFFFF"
          stroke="#333333"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
      </g>

      {/* Chiếc nơ đặc trưng bên tai phải (hoặc tai trái theo góc nhìn) */}
      <g transform="translate(62, 12) rotate(15)">
        {/* Nút thắt giữa nơ */}
        <circle cx="10" cy="10" r="5.5" fill={bowColor} stroke="#222" strokeWidth="2.2" />
        {/* Cánh nơ trái */}
        <ellipse cx="2" cy="10" rx="7" ry="6" fill={bowColor} stroke="#222" strokeWidth="2.2" />
        <circle cx="3" cy="9" r="2" fill="#fff" opacity="0.6" />
        {/* Cánh nơ phải */}
        <ellipse cx="18" cy="10" rx="7" ry="6" fill={bowColor} stroke="#222" strokeWidth="2.2" />
        <circle cx="17" cy="9" r="2" fill="#fff" opacity="0.6" />
        {/* Nút tròn chính giữa đè lên */}
        <circle cx="10" cy="10" r="4.2" fill="#ff75a0" />
      </g>

      {/* Hai mắt hạt huyền oval */}
      <ellipse cx="36" cy="48" rx="3.2" ry="4.5" fill="#222222" />
      <ellipse cx="64" cy="48" rx="3.2" ry="4.5" fill="#222222" />

      {/* Chiếc mũi vàng xinh xắn */}
      <ellipse cx="50" cy="55" rx="4" ry="2.8" fill="#FACC15" stroke="#222" strokeWidth="1.6" />

      {/* Đôi má hồng siêu ngọt ngào dành riêng cho Bông */}
      <ellipse cx="28" cy="54" rx="5" ry="3.2" fill="#ff7eb3" opacity="0.65" />
      <ellipse cx="72" cy="54" rx="5" ry="3.2" fill="#ff7eb3" opacity="0.65" />

      {/* Râu mèo 3 sợi mỗi bên */}
      <g stroke="#222" strokeWidth="2.4" strokeLinecap="round">
        {/* Râu trái */}
        <path d="M 23 44 L 8 41" />
        <path d="M 22 51 L 6 52" />
        <path d="M 23 58 L 8 63" />
        {/* Râu phải */}
        <path d="M 77 44 L 92 41" />
        <path d="M 78 51 L 94 52" />
        <path d="M 77 58 L 92 63" />
      </g>
    </svg>
  );
}

// 2. Sticker Hello Kitty ôm Trái Tim khắc tên "Bông"
export function HelloKittyWithHeart({ className = "w-20 h-20", name = "Bông" }) {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
        {/* Thân & Chân */}
        <path d="M40 70 C35 90 40 105 45 108 C50 110 55 106 60 106 C65 106 70 110 75 108 C80 105 85 90 80 70 Z" fill="#fff" stroke="#222" strokeWidth="3" />
        
        {/* Chiếc váy hồng chấm bi */}
        <path d="M38 78 C35 98 42 102 60 102 C78 102 85 98 82 78 Z" fill="#ff4d8d" stroke="#222" strokeWidth="2.5" />
        
        {/* Đầu Hello Kitty */}
        <g transform="translate(10, 0)">
          {/* Tai trái */}
          <path d="M26 23 C22 13 14 6 12 11 C10 16 17 26 19 31 C10 39 8 57 18 69 C28 81 72 81 82 69 C92 57 90 39 81 31 C83 26 90 16 88 11 C86 6 78 13 74 23 C66 18 34 18 26 23 Z" fill="#fff" stroke="#222" strokeWidth="3" />
          
          {/* Nơ Hồng */}
          <g transform="translate(60, 10)">
            <ellipse cx="2" cy="10" rx="7" ry="6" fill="#ff1493" stroke="#222" strokeWidth="2" />
            <ellipse cx="18" cy="10" rx="7" ry="6" fill="#ff1493" stroke="#222" strokeWidth="2" />
            <circle cx="10" cy="10" r="5" fill="#ff69b4" stroke="#222" strokeWidth="2" />
          </g>

          {/* Mắt, mũi, má hồng, râu */}
          <ellipse cx="36" cy="46" rx="3" ry="4.2" fill="#222" />
          <ellipse cx="64" cy="46" rx="3" ry="4.2" fill="#222" />
          <ellipse cx="50" cy="52" rx="3.8" ry="2.6" fill="#FACC15" stroke="#222" strokeWidth="1.5" />
          <ellipse cx="28" cy="51" rx="5" ry="3" fill="#ff80bf" opacity="0.7" />
          <ellipse cx="72" cy="51" rx="5" ry="3" fill="#ff80bf" opacity="0.7" />
          
          <path d="M 23 42 L 10 39" stroke="#222" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 22 48 L 8 49" stroke="#222" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 23 54 L 10 59" stroke="#222" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 77 42 L 90 39" stroke="#222" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 78 48 L 92 49" stroke="#222" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 77 54 L 90 59" stroke="#222" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* Trái Tim Khổng Lồ ôm trước ngực */}
        <g transform="translate(30, 62) scale(0.6)">
          <path
            d="M50 88 C20 60 5 45 5 28 C5 12 18 0 34 0 C43 0 50 6 50 12 C50 6 57 0 66 0 C82 0 95 12 95 28 C95 45 80 60 50 88 Z"
            fill="#ff3385"
            stroke="#ffffff"
            strokeWidth="3.5"
          />
          {/* Tên "Bông" được khắc lên trái tim */}
          <text
            x="50"
            y="48"
            fill="#ffffff"
            fontSize="22"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            {name} 💖
          </text>
        </g>

        {/* Hai bàn tay ôm vào trái tim */}
        <ellipse cx="36" cy="74" rx="5" ry="4" fill="#fff" stroke="#222" strokeWidth="2" />
        <ellipse cx="84" cy="74" rx="5" ry="4" fill="#fff" stroke="#222" strokeWidth="2" />
      </svg>
    </div>
  );
}

// 3. Sticker Nơ Hồng Hello Kitty lấp lánh (Ribbon Bow)
export function HelloKittyBow({ className = "w-8 h-8", color = "#ff2d75" }) {
  return (
    <svg viewBox="0 0 50 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="14" cy="20" rx="12" ry="10" fill={color} stroke="#333" strokeWidth="2.5" />
      <ellipse cx="36" cy="20" rx="12" ry="10" fill={color} stroke="#333" strokeWidth="2.5" />
      <circle cx="12" cy="17" r="3" fill="#fff" opacity="0.6" />
      <circle cx="38" cy="17" r="3" fill="#fff" opacity="0.6" />
      <circle cx="25" cy="20" r="7" fill="#ff75a0" stroke="#333" strokeWidth="2.5" />
    </svg>
  );
}

// 4. Sticker Dâu Tây Mọng Nước (Strawberry) của Kitty
export function CuteStrawberry({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 30 35" className={className} fill="none">
      {/* Quả dâu */}
      <path d="M15 33 C6 26 2 18 2 12 C2 5 7 2 15 2 C23 2 28 5 28 12 C28 18 24 26 15 33 Z" fill="#ff2d55" stroke="#222" strokeWidth="1.8" />
      {/* Hạt dâu */}
      <circle cx="9" cy="12" r="1" fill="#fff" />
      <circle cx="15" cy="14" r="1" fill="#fff" />
      <circle cx="21" cy="12" r="1" fill="#fff" />
      <circle cx="12" cy="20" r="1" fill="#fff" />
      <circle cx="18" cy="20" r="1" fill="#fff" />
      <circle cx="15" cy="26" r="0.9" fill="#fff" />
      {/* Cuống lá xanh */}
      <path d="M15 5 C13 0 11 0 11 0 M15 5 C18 1 20 2 20 2 M15 5 C10 4 8 7 8 7 M15 5 C20 4 22 7 22 7" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// 5. Sticker Bàn Chân Mèo Kitty (Paw print)
export function KittyPaw({ className = "w-6 h-6", color = "#ff7eb3" }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none">
      <ellipse cx="20" cy="27" rx="10" ry="8" fill={color} />
      <circle cx="11" cy="14" r="4.2" fill={color} />
      <circle cx="20" cy="10" r="4.5" fill={color} />
      <circle cx="29" cy="14" r="4.2" fill={color} />
    </svg>
  );
}

// 6. Sticker Hello Kitty đầu bếp / quản lý tiệm
export function HelloKittyChef({ className = "w-16 h-16" }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 110" className="w-full h-full" fill="none">
        {/* Mũ đầu bếp */}
        <path d="M35 30 C30 15 45 5 50 12 C55 5 70 15 65 30 Z" fill="#fff" stroke="#222" strokeWidth="2.5" />
        <ellipse cx="50" cy="30" rx="16" ry="6" fill="#ff7eb3" stroke="#222" strokeWidth="2" />
        
        {/* Đầu */}
        <g transform="translate(0, 15)">
          <path d="M26 23 C22 13 14 6 12 11 C10 16 17 26 19 31 C10 39 8 57 18 69 C28 81 72 81 82 69 C92 57 90 39 81 31 C83 26 90 16 88 11 C86 6 78 13 74 23 C66 18 34 18 26 23 Z" fill="#fff" stroke="#222" strokeWidth="2.8" />
          <circle cx="70" cy="18" r="6" fill="#ff2d75" stroke="#222" strokeWidth="2" />
          <ellipse cx="36" cy="48" rx="3.2" ry="4.5" fill="#222" />
          <ellipse cx="64" cy="48" rx="3.2" ry="4.5" fill="#222" />
          <ellipse cx="50" cy="55" rx="4" ry="2.8" fill="#FACC15" stroke="#222" strokeWidth="1.6" />
          <ellipse cx="28" cy="54" rx="5" ry="3.2" fill="#ff80bf" opacity="0.65" />
          <ellipse cx="72" cy="54" rx="5" ry="3.2" fill="#ff80bf" opacity="0.65" />
          <path d="M 23 44 L 8 41 M 22 51 L 6 52 M 23 58 L 8 63" stroke="#222" strokeWidth="2" strokeLinecap="round" />
          <path d="M 77 44 L 92 41 M 78 51 L 94 52 M 77 58 L 92 63" stroke="#222" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
