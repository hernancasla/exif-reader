## Types

TypeScript interfaces exported by the library.

### ExifData

```ts
export interface ExifData {
  [key: string]: any;
}
```

### ExifKeyValue

```ts
export interface ExifKeyValue {
  key: string;
  value: any;
}
```

### GPSCoordinates

```ts
export interface GPSCoordinates {
  latitude: string;
  longitude: string;
}
```

### ImageInfo

```ts
export interface ImageInfo {
  size: string;
  type: string;
  width: number | string;
  height: number | string;
}
```

### GPSData

```ts
export interface GPSData {
  [key: string]: any;
  GPSLatitude?: number[];
  GPSLongitude?: number[];
  GPSLatitudeRef?: string;
  GPSLongitudeRef?: string;
}
```

### BasicExifInfo

```ts
export interface BasicExifInfo {
  make?: string;
  model?: string;
  date?: string;
  GPSLatitude?: number;
  GPSLongitude?: number;
}
```