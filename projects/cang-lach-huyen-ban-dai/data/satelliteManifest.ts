// Auto-generated from EOX Sentinel-2 2024 cloudless WMTS (CC BY 4.0)
export interface SatelliteMosaic {
  id: string;
  href: string;
  zoom: number;
  x: number;
  y: number;
  w: number;
  h: number;
  pixelWidth: number;
  pixelHeight: number;
}

export const SATELLITE_ATTRIBUTION = "Ảnh vệ tinh nền: EOxCloudless Sentinel-2 2024 (CC BY 4.0 — EOX IT Services GmbH / Copernicus) • Dữ liệu địa hình & hạ tầng: Natural Earth & © OpenStreetMap contributors (ODbL)";

export const SATELLITE_MOSAICS: readonly SatelliteMosaic[] = [
  {
    "id": "asia_pacific_z4",
    "href": "sat/asia_pacific_z4_ready.webp",
    "zoom": 4,
    "x": 40960.0,
    "y": 16384.0,
    "w": 24576.0,
    "h": 20480.0,
    "pixelWidth": 1536,
    "pixelHeight": 1280
  },
  {
    "id": "sea_region_z6",
    "href": "sat/sea_region_z6_ready.webp",
    "zoom": 6,
    "x": 46080.0,
    "y": 23552.0,
    "w": 13312.0,
    "h": 11264.0,
    "pixelWidth": 3328,
    "pixelHeight": 2816
  },
  {
    "id": "vietnam_eastsea_z7",
    "href": "sat/vietnam_eastsea_z7_ready.webp",
    "zoom": 7,
    "x": 50176.0,
    "y": 26624.0,
    "w": 5120.0,
    "h": 5632.0,
    "pixelWidth": 2560,
    "pixelHeight": 2816
  },
  {
    "id": "north_gulf_z9",
    "href": "sat/north_gulf_z9_ready.webp",
    "zoom": 9,
    "x": 51840.0,
    "y": 28672.0,
    "w": 768.0,
    "h": 512.0,
    "pixelWidth": 1536,
    "pixelHeight": 1024
  },
  {
    "id": "haiphong_z12",
    "href": "sat/haiphong_z12_ready.webp",
    "zoom": 12,
    "x": 52128.0,
    "y": 28768.0,
    "w": 176.0,
    "h": 208.0,
    "pixelWidth": 2816,
    "pixelHeight": 3328
  },
  {
    "id": "lach_huyen_z14",
    "href": "sat/lach_huyen_z14_ready.webp",
    "zoom": 14,
    "x": 52176.0,
    "y": 28872.0,
    "w": 84.0,
    "h": 60.0,
    "pixelWidth": 5376,
    "pixelHeight": 3840
  }
] as const;
