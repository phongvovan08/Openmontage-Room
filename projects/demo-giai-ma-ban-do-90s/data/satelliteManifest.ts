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
    "id": "sea_region_z6",
    "href": "sat/sea_region_z6_ready.webp",
    "zoom": 6,
    "x": 49152.0,
    "y": 26624.0,
    "w": 7168.0,
    "h": 7168.0,
    "pixelWidth": 1792,
    "pixelHeight": 1792
  },
  {
    "id": "vietnam_eastsea_z7",
    "href": "sat/vietnam_eastsea_z7_ready.webp",
    "zoom": 7,
    "x": 51200.0,
    "y": 28160.0,
    "w": 3584.0,
    "h": 3584.0,
    "pixelWidth": 1792,
    "pixelHeight": 1792
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
    "x": 52144.0,
    "y": 28848.0,
    "w": 144.0,
    "h": 112.0,
    "pixelWidth": 2304,
    "pixelHeight": 1792
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
