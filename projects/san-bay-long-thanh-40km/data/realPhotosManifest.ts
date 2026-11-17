// Visually verified freely-licensed Wikimedia Commons photos (100% watermark-free)

export interface PhotoSpotlight {
  /** Normalized fraction [0..1] inside photo container */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  label: string;
  sublabel: string;
  badgePos: readonly [number, number];
}

export interface RealPhotoSpec {
  id: string;
  href: string;
  title: string;
  caption_vi: string;
  location_tag: string;
  author: string;
  license: string;
  url: string;
  objectPosition?: string;
  spotlight: PhotoSpotlight;
}

export const REAL_PHOTOS: Record<string, RealPhotoSpec> = {
  tsn_apron: {
    id: "tsn_apron",
    href: "photos/tsn_apron.jpg",
    title: "File:Tan Son Nhat International Airport at night (12088245464).jpg",
    caption_vi: "Toàn cảnh sân bay Tân Sơn Nhất ban đêm giữa lõi đô thị TP.HCM",
    location_tag: "TÂN BÌNH • TP.HCM",
    author: "Bem photography",
    license: "CC BY 2.0",
    url: "https://commons.wikimedia.org/wiki/File:Tan_Son_Nhat_International_Airport_at_night_(12088245464).jpg",
    spotlight: {
      cx: 0.48,
      cy: 0.45,
      rx: 0.26,
      ry: 0.18,
      label: "Đài KLL & sân đỗ",
      sublabel: "Bị phố phường bao vây sát hàng rào",
      badgePos: [0.30, 0.20],
    },
  },
  tsn_terminal: {
    id: "tsn_terminal",
    href: "photos/tsn_terminal.jpg",
    title: "File:Tan Son Nhat ramp (08.2026).jpg",
    caption_vi: "Nhà ga quốc tế và sân đỗ tàu bay tại Cảng HKQT Tân Sơn Nhất",
    location_tag: "TÂN SƠN NHẤT • SÂN ĐỖ",
    author: "Hwi.padam",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Tan_Son_Nhat_ramp_(08.2026).jpg",
    spotlight: {
      cx: 0.74,
      cy: 0.56,
      rx: 0.22,
      ry: 0.16,
      label: "Nhà ga T2 & sân đỗ",
      sublabel: "Nút thắt thực nằm ở cặp đường băng 365 m",
      badgePos: [0.32, 0.22],
    },
  },
  hcm_skyline: {
    id: "hcm_skyline",
    href: "photos/hcm_skyline.jpg",
    title: "File:Ho Chi Minh City - Saigon1324.jpg",
    caption_vi: "Không gian cao ốc ven sông Sài Gòn và vùng phễu bay nội đô",
    location_tag: "TRUNG TÂM TP.HCM",
    author: "lumoplank",
    license: "CC0",
    url: "https://commons.wikimedia.org/wiki/File:Ho_Chi_Minh_City_-_Saigon1324.jpg",
    spotlight: {
      cx: 0.56,
      cy: 0.34,
      rx: 0.18,
      ry: 0.24,
      label: "Vùng cao ốc nội đô",
      sublabel: "Giới hạn tĩnh không & phễu hạ cánh",
      badgePos: [0.28, 0.22],
    },
  },
  long_thanh_site: {
    id: "long_thanh_site",
    href: "photos/long_thanh_site.jpg",
    title: "File:Dji-0031-2479-7509-26233946999421542541397.jpg",
    caption_vi: "Không ảnh thực địa nhà ga cánh hoa sen và thềm đất đỏ Sân bay Long Thành",
    location_tag: "BÌNH SƠN • SÂN BAY LONG THÀNH",
    author: "Hehebisbis",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Dji-0031-2479-7509-26233946999421542541397.jpg",
    spotlight: {
      cx: 0.50,
      cy: 0.43,
      rx: 0.30,
      ry: 0.18,
      label: "Nhà ga hoa sen & đài KLL",
      sublabel: "Thi công đồng bộ trên nền đất đỏ bazan 5.000 ha",
      badgePos: [0.30, 0.20],
    },
  },
  rubber_plantation_dn: {
    id: "rubber_plantation_dn",
    href: "photos/rubber_plantation_dn.jpg",
    title: "File:Belle plantation d'hévéas à Suzannah avec un espacement correct des plants - btv1b101030056.jpg",
    caption_vi: "Tư liệu đồn điền cao su Suzannah lịch sử vùng đất đỏ Đồng Nai",
    location_tag: "ĐẤT ĐỎ ĐỒNG NAI • TƯ LIỆU",
    author: "Gallica BnF (Public domain)",
    license: "Public domain",
    url: "https://commons.wikimedia.org/wiki/File:Belle_plantation_d%27h%C3%A9v%C3%A9as_%C3%A0_Suzannah_avec_un_espacement_correct_des_plants_-_btv1b101030056.jpg",
    spotlight: {
      cx: 0.52,
      cy: 0.56,
      rx: 0.28,
      ry: 0.22,
      label: "Thềm cao su đất đỏ",
      sublabel: "Địa hình thoải, ít dân cư phân tán",
      badgePos: [0.28, 0.20],
    },
  },
  can_gio_mangrove: {
    id: "can_gio_mangrove",
    href: "photos/can_gio_mangrove.jpg",
    title: "File:Mangrove bud.jpg",
    caption_vi: "Hệ sinh thái rừng ngập mặn và nền bùn yếu phía nam TP.HCM",
    location_tag: "CẦN GIỜ • SINH QUYỂN",
    author: "Tho nau",
    license: "CC BY-SA 3.0",
    url: "https://commons.wikimedia.org/wiki/File:Mangrove_bud.jpg",
    spotlight: {
      cx: 0.52,
      cy: 0.50,
      rx: 0.26,
      ry: 0.22,
      label: "Nền bùn yếu ngập mặn",
      sublabel: "Độ lún cao & vùng đệm sinh quyển",
      badgePos: [0.30, 0.20],
    },
  },
  cai_mep_port: {
    id: "cai_mep_port",
    href: "photos/cai_mep_port.jpg",
    title: "File:VN-Phu-My-Hafen-3.jpg",
    caption_vi: "Bến cảng nước sâu Phú Mỹ trên luồng Thị Vải – Cái Mép (Bà Rịa – Vũng Tàu)",
    location_tag: "THỊ VẢI – CÁI MÉP • BR-VT",
    author: "Balou46",
    license: "CC BY-SA 3.0",
    url: "https://commons.wikimedia.org/wiki/File:VN-Phu-My-Hafen-3.jpg",
    spotlight: {
      cx: 0.58,
      cy: 0.50,
      rx: 0.26,
      ry: 0.16,
      label: "Luồng cảng nước sâu Thị Vải",
      sublabel: "Chỉ cách Long Thành ~30–35 km qua CT.02 BH–VT",
      badgePos: [0.30, 0.20],
    },
  },
  widebody_a380: {
    id: "widebody_a380",
    href: "photos/widebody_a380.jpg",
    title: "File:A380 - Paris Air Show 2011 - Take off.jpg",
    caption_vi: "Tàu bay thân rộng cấp ICAO Code F chuẩn sân bay 4F",
    location_tag: "CHUẨN KHAI THÁC ICAO 4F",
    author: "Boute95",
    license: "CC BY-SA 3.0",
    url: "https://commons.wikimedia.org/wiki/File:A380_-_Paris_Air_Show_2011_-_Take_off.jpg",
    spotlight: {
      cx: 0.56,
      cy: 0.50,
      rx: 0.25,
      ry: 0.16,
      label: "Sải cánh ~80 m (Code F)",
      sublabel: "Yêu cầu đường băng 4.000 m × 60–75 m",
      badgePos: [0.28, 0.22],
    },
  },
  incheon_airport: {
    id: "incheon_airport",
    href: "photos/incheon_airport.jpg",
    title: "File:02-NOV-2023 - KC910 ICN-ALA (EI-KEB - B767-300) (03) (cropped).jpg",
    caption_vi: "Sân bay quốc tế Incheon (cách Seoul ~48 km, kết nối đường sắt tốc độ cao)",
    location_tag: "INCHEON • CÁCH SEOUL ~48 KM",
    author: "Simply Aviation",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:02-NOV-2023_-_KC910_ICN-ALA_(EI-KEB_-_B767-300)_(03)_(cropped).jpg",
    spotlight: {
      cx: 0.54,
      cy: 0.52,
      rx: 0.26,
      ry: 0.20,
      label: "Siêu cảng xa đô thị 48 km",
      sublabel: "Cách ly tiếng ồn, mở đường băng độc lập 24/7",
      badgePos: [0.26, 0.20],
    },
  },
  hcm_lt_expressway: {
    id: "hcm_lt_expressway",
    href: "photos/hcm_lt_expressway.jpg",
    title: "File:Long Thành-Dầu Giây Expressway Speed Limit Sign.jpg",
    caption_vi: "Biển báo tuyến cao tốc TP.HCM – Long Thành – Dầu Giây (CT.01)",
    location_tag: "CAO TỐC CT.01 • 120 KM/H",
    author: "MinhVN123",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Long_Th%C3%A0nh-D%E1%BA%A7u_Gi%C3%A2y_Expressway_Speed_Limit_Sign.jpg",
    spotlight: {
      cx: 0.50,
      cy: 0.50,
      rx: 0.24,
      ry: 0.20,
      label: "Trục CT.01 & Cầu Long Thành",
      sublabel: "Cần mở rộng để phá nút cổ chai vượt sông",
      badgePos: [0.28, 0.20],
    },
  },
  hcm_metro_line1: {
    id: "hcm_metro_line1",
    href: "photos/hcm_metro_line1.jpg",
    title: "File:L111 BenThanh Train Front (20250202).jpg",
    caption_vi: "Đoàn tàu Metro số 1 TP.HCM trên cầu cạn hướng về TP. Thủ Đức",
    location_tag: "METRO SỐ 1 • KẾT NỐI THỦ THIÊM",
    author: "Kateru Zakuro",
    license: "CC BY 4.0",
    url: "https://commons.wikimedia.org/wiki/File:L111_BenThanh_Train_Front_(20250202).jpg",
    spotlight: {
      cx: 0.50,
      cy: 0.54,
      rx: 0.20,
      ry: 0.24,
      label: "Đầu tàu đường sắt đô thị",
      sublabel: "40 km đi tàu 120 km/h chỉ ~20–25 phút",
      badgePos: [0.24, 0.22],
    },
  },
};
