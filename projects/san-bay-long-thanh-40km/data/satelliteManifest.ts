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
    "id": "south_vn_z9",
    "href": "sat/south_vn_z9_ready.webp",
    "zoom": 9,
    "x": 51712.0,
    "y": 30336.0,
    "w": 1024.0,
    "h": 1024.0,
    "pixelWidth": 2048,
    "pixelHeight": 2048
  },
  {
    "id": "hcm_lt_corridor_z12",
    "href": "sat/hcm_lt_corridor_z12_ready.webp",
    "zoom": 12,
    "x": 52144.0,
    "y": 30736.0,
    "w": 160.0,
    "h": 128.0,
    "pixelWidth": 2560,
    "pixelHeight": 2048
  },
  {
    "id": "long_thanh_z14",
    "href": "sat/long_thanh_z14_ready.webp",
    "zoom": 14,
    "x": 52244.0,
    "y": 30780.0,
    "w": 36.0,
    "h": 28.0,
    "pixelWidth": 2304,
    "pixelHeight": 1792
  },
  {
    "id": "tsn_z14",
    "href": "sat/tsn_z14_ready.webp",
    "zoom": 14,
    "x": 52172.0,
    "y": 30776.0,
    "w": 24.0,
    "h": 20.0,
    "pixelWidth": 1536,
    "pixelHeight": 1280
  }
] as const;
