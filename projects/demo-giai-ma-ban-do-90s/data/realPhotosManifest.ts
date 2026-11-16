// Verified watermark-free Wikimedia Commons photographs of Hai Phong & Lach Huyen
// Licenses: CC0 1.0, Public Domain, CC BY 3.0, CC BY-SA 4.0 (all commercial-safe on YouTube with attribution)

export interface PhotoSpotlightSpec {
  /** Normalized center X (0..1) on the enlarged 1140x642 photo card */
  cx: number;
  /** Normalized center Y (0..1) on the enlarged 1140x642 photo card */
  cy: number;
  /** Normalized horizontal radius (0..1) of the target ellipse */
  rx: number;
  /** Normalized vertical radius (0..1) of the target ellipse */
  ry: number;
  /** Normalized center [x, y] of the callout pill inside the enlarged card */
  badgePos: readonly [number, number];
  /** Primary uppercase callout title */
  label: string;
  /** Optional concise explanatory subtitle */
  sublabel?: string;
}

export interface RealPhotoSpec {
  id: string;
  href: string;
  caption_vi: string;
  location_tag: string;
  credit: string;
  license: string;
  author: string;
  width: number;
  height: number;
  sourceUrl: string;
  objectPosition?: string;
  spotlight: PhotoSpotlightSpec;
}

export const REAL_PHOTOS = {
  cang_hai_phong_old: {
    id: "cang_hai_phong_old",
    href: "photos/cang_hai_phong_old.jpg",
    location_tag: "TƯ LIỆU ĐẦU THẾ KỶ XX • SÔNG CẤM",
    caption_vi: "Cảng Hải Phòng trăm tuổi nằm sâu trong lòng sông Cấm",
    credit: "Tư liệu lịch sử • CC0 (Wikimedia Commons)",
    license: "CC0 1.0 Universal",
    author: "Aero Mre Indochine / TUNMCHP",
    width: 1920,
    height: 1281,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cang_Hai_Phong.jpg",
    spotlight: {
      cx: 0.44,
      cy: 0.46,
      rx: 0.16,
      ry: 0.21,
      badgePos: [0.75, 0.26],
      label: "LÒNG SÔNG HẸP • TÀU CỠ NHỎ",
      sublabel: "Bến cảng nội đô nằm sâu trong đất liền",
    },
  },
  chua_ve_port: {
    id: "chua_ve_port",
    href: "photos/chua_ve_port.jpg",
    location_tag: "THỰC ĐỊA CỤM CẢNG SÔNG CẤM",
    caption_vi: "Bến cảng Chùa Vẽ nằm sâu trong nội địa sông Cấm",
    credit: "Ảnh: Phó Nháy • Public Domain (Wikimedia)",
    license: "Public Domain (PD-self)",
    author: "Phó Nháy",
    width: 1920,
    height: 1440,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Ch%C3%B9a_V%E1%BA%BD_Terminal,_Port_of_H%E1%BA%A3i_Ph%C3%B2ng.JPG",
    spotlight: {
      cx: 0.36,
      cy: 0.55,
      rx: 0.22,
      ry: 0.20,
      badgePos: [0.74, 0.27],
      label: "BẾN CẢNG SÔNG • CÁCH BIỂN 48 KM",
      sublabel: "Cẩu bờ cỡ nhỏ bên luồng sông hẹp 80 m",
    },
  },
  cang_tan_vu: {
    id: "cang_tan_vu",
    href: "photos/cang_tan_vu.jpg",
    location_tag: "THỰC TẾ ĐỘI TÀU GOM HÀNG (FEEDER)",
    caption_vi: "Tàu feeder cỡ vừa tại cụm cảng cửa sông Đình Vũ – Tân Vũ",
    credit: "Tư liệu Cảng Hải Phòng • CC0 (Wikimedia)",
    license: "CC0 1.0 Universal",
    author: "TUNMCHP",
    width: 1772,
    height: 1045,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:CANG_TAN_VU.jpg",
    spotlight: {
      cx: 0.52,
      cy: 0.62,
      rx: 0.19,
      ry: 0.16,
      badgePos: [0.74, 0.24],
      label: "TÀU GOM HÀNG (FEEDER) CỠ VỪA",
      sublabel: "Chở hàng sang Singapore / Hồng Kông ghép chuyến",
    },
  },
  song_cam_2023: {
    id: "song_cam_2023",
    href: "photos/song_cam_2023.jpg",
    location_tag: "THỰC ĐỊA SÔNG CẤM • HẢI PHÒNG",
    caption_vi: "Dòng sông Cấm đục ngầu phù sa chảy sát hai bờ đô thị",
    credit: "Ảnh: HP1992 • CC BY-SA 4.0 (Wikimedia)",
    license: "CC BY-SA 4.0",
    author: "HP1992",
    width: 1920,
    height: 1224,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:S%C3%B4ng_C%E1%BA%A5m_H%E1%BA%A3i_Ph%C3%B2ng_th%C3%A1ng_12_n%C4%83m_2023f.jpg",
    objectPosition: "center 88%",
    spotlight: {
      cx: 0.76,
      cy: 0.63,
      rx: 0.17,
      ry: 0.15,
      badgePos: [0.33, 0.28],
      label: "NƯỚC ĐỤC PHÙ SA • SÂU -7,0 M",
      sublabel: "Bồi lắng hàng năm sát kè phố nội đô",
    },
  },
  tan_vu_bridge: {
    id: "tan_vu_bridge",
    href: "photos/tan_vu_bridge.jpg",
    location_tag: "THỰC ĐỊA CẦU VƯỢT BIỂN • 5,44 KM",
    caption_vi: "Cầu vượt biển Tân Vũ – Lạch Huyện băng qua cửa Nam Triệu",
    credit: "Ảnh: Thu Hà Nội • CC BY 3.0 (Wikimedia)",
    license: "CC BY 3.0",
    author: "Thu Hà Nội",
    width: 1920,
    height: 1077,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Dinh_Vu_-_Cat_Hai_Bridge.jpg",
    objectPosition: "center 68%",
    spotlight: {
      cx: 0.45,
      cy: 0.56,
      rx: 0.22,
      ry: 0.14,
      badgePos: [0.73, 0.25],
      label: "CẦU VƯỢT BIỂN DÀI 5,44 KM",
      sublabel: "Nhảy vọt qua bãi bồi cửa Nam Triệu sang Cát Hải",
    },
  },
  lach_huyen_cranes: {
    id: "lach_huyen_cranes",
    href: "photos/lach_huyen_cranes.jpg",
    location_tag: "THỰC ĐỊA LUỒNG LẠCH HUYỆN • 160 M",
    caption_vi: "Dàn cẩu STS đón tàu container lớn tại khu bến Lạch Huyện",
    credit: "Ảnh: Marc Mongenet • CC BY-SA 4.0 (Wikimedia)",
    license: "CC BY-SA 4.0",
    author: "Marc Mongenet",
    width: 1920,
    height: 1280,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Lach_Huyen_Port_from_Cai_Vieng_Port.jpg",
    objectPosition: "center 82%",
    spotlight: {
      cx: 0.31,
      cy: 0.54,
      rx: 0.15,
      ry: 0.15,
      badgePos: [0.69, 0.28],
      label: "DÀN SIÊU CẨU STS • LUỒNG 160 M",
      sublabel: "Đón tàu lớn ngay rìa biển sâu đảo Cát Hải",
    },
  },
  cang_htit_lach_huyen: {
    id: "cang_htit_lach_huyen",
    href: "photos/cang_htit_lach_huyen.jpg",
    location_tag: "THỰC ĐỊA BẾN 3–4 LẠCH HUYỆN (HTIT)",
    caption_vi: "Siêu tàu mẹ MSC cập cảng nước sâu Lạch Huyện — đảo Cát Hải",
    credit: "Ảnh tư liệu HTIT • CC0 (Wikimedia)",
    license: "CC0 1.0 Universal",
    author: "TUNMCHP",
    width: 1920,
    height: 1080,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:CANG_HTIT.jpg",
    objectPosition: "center 40%",
    spotlight: {
      cx: 0.64,
      cy: 0.39,
      rx: 0.15,
      ry: 0.14,
      badgePos: [0.28, 0.32],
      label: "SIÊU TÀU MẸ MSC • 165.000 DWT",
      sublabel: "Tuyến trực tiếp đi thẳng Mỹ & châu Âu",
    },
  },
} as const satisfies Record<string, RealPhotoSpec>;

export type RealPhotoId = keyof typeof REAL_PHOTOS;
export const REAL_PHOTO_LIST: readonly RealPhotoSpec[] = Object.values(REAL_PHOTOS);
