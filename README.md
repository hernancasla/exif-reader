# exif-reader-ts

A TypeScript library for handling EXIF data in images.

## Installation

```bash
npm install exif-reader-ts
```

## Usage

```typescript
import { ExifManager } from 'exif-reader-ts';

// Read EXIF data (returns an object with keyValueExif and exifData)
const { keyValueExif, exifData } = await ExifManager.readExif(imageBase64);

// Optionally, provide basicExifInfo if the image has no EXIF:
const { keyValueExif, exifData } = await ExifManager.readExif(imageBase64, {
  make: 'Canon',
  model: 'EOS',
  date: '2024-06-01T12:00:00Z',
  GPSLatitude: -34.6037,
  GPSLongitude: -58.3816
});

// Modify EXIF data
const newExifData = {
  "0th": {
    271: "Nikon", // Make
    272: "D90"     // Model
  }
};
const modifiedImage = ExifManager.modifyExif(imageBase64, newExifData);

// Remove EXIF data
const cleanImage = ExifManager.removeExif(imageBase64);

// Get GPS coordinates from GPS data
const gpsCoordinates = ExifManager.getGPSCoordinates(gpsData);
// Returns { latitude: string, longitude: string } or null
```

## API

- Full docs: see `docs/` for the [Quickstart](docs/quickstart.md) and [API Reference](docs/api/README.md).

### ExifManager.readExif(imageSrc: string, basicExifInfo?: BasicExifInfo): Promise<{ keyValueExif: ExifKeyValue[], exifData: ExifData }>
Reads EXIF data from a base64 image or URL. If no EXIF is found and `basicExifInfo` is provided, it generates basic EXIF data and merges missing fields.

### ExifManager.modifyExif(imageData: string, exifData: ExifData): string
Modifies EXIF data in a base64 image and returns the new image as a base64 string.

### ExifManager.removeExif(imageData: string): string
Removes all EXIF data from a base64 image and returns the cleaned image as a base64 string.

### ExifManager.getGPSCoordinates(gpsData: any): GPSCoordinates | null
Extracts GPS coordinates from EXIF GPS data in various formats.

## Types

### ExifData
```typescript
interface ExifData {
  [key: string]: any;
}
```

### ExifKeyValue
```typescript
interface ExifKeyValue {
  key: string;
  value: string;
}
```

### GPSCoordinates
```typescript
interface GPSCoordinates {
  latitude: string;
  longitude: string;
}
```

### BasicExifInfo
```typescript
interface BasicExifInfo {
  make?: string;
  model?: string;
  date?: string;
  GPSLatitude?: number;
  GPSLongitude?: number;
}
```

## Contributing

- Issues and PRs are welcome. Please include tests for new features.
- Run tests with `npm test`.

## License

ISC 