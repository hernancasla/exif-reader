export interface ExifData {
  [key: string]: any;
}

export interface GPSCoordinates {
  latitude: string;
  longitude: string;
}

export interface ExifKeyValue {
  key: string;
  value: any;
}

export interface ImageInfo {
  size: string;
  type: string;
  width: number | string;
  height: number | string;
}

export interface GPSData {
  [key: string]: any;
  GPSLatitude?: number[];
  GPSLongitude?: number[];
  GPSLatitudeRef?: string;
  GPSLongitudeRef?: string;
}

export interface BasicExifInfo {
  make?: string;
  model?: string;
  date?: string;
  GPSLatitude?: number;
  GPSLongitude?: number;
} 