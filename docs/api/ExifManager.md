## ExifManager

High-level static API for reading, generating, modifying, and stripping EXIF metadata.

```ts
class ExifManager {
  static readExif(imageSrc: string, basicExifInfo?: BasicExifInfo): Promise<{ keyValueExif: ExifKeyValue[]; exifData: ExifData }>
  static modifyExif(imageData: string, exifData: ExifData): string
  static removeExif(imageData: string): string
  static getGPSCoordinates(gpsData: any): GPSCoordinates | null
  static generateBaseExif(options?: { make?: string; model?: string; date?: string }): ExifData
  static setUserComments(exifData: ExifData, userComments: Record<string, any>): ExifData
}
```

### readExif(imageSrc, basicExifInfo?)

- **imageSrc**: Base64 `data:image/...` string (Node or Browser) OR a URL (Browser)
- **basicExifInfo**: Optional fallback metadata when the source image lacks EXIF
- **Returns**: `{ keyValueExif: ExifKeyValue[], exifData: ExifData }`

Behavior:
- Base64 input: Reads EXIF directly with `piexifjs`. If missing and `basicExifInfo` is provided, generates a minimal EXIF object and user-friendly key/value pairs.
- URL input (browser): Downloads, extracts EXIF, and returns key/value pairs; `exifData` will be `{}` for URL mode.

Example:

```ts
const { keyValueExif, exifData } = await ExifManager.readExif(imageBase64, {
  make: 'Canon',
  model: 'EOS 80D',
  date: '2024-06-01T12:00:00Z',
  GPSLatitude: -34.6037,
  GPSLongitude: -58.3816,
});
```

### modifyExif(imageData, exifData)

Replaces or adds EXIF metadata inside a base64 image.

- **imageData**: Base64 `data:image/...` string
- **exifData**: EXIF object (see Types)
- **Returns**: New base64 string containing the updated EXIF

```ts
const base = ExifManager.generateBaseExif({ make: 'Nikon', model: 'D90' });
const updatedBase64 = ExifManager.modifyExif(imageBase64, base);
```

### removeExif(imageData)

Strips all EXIF metadata from a base64 image.

- **imageData**: Base64 `data:image/...` string
- **Returns**: New base64 string without EXIF

```ts
const clean = ExifManager.removeExif(imageBase64);
```

### getGPSCoordinates(gpsData)

Extracts decimal coordinates from EXIF GPS data (fractional or standard format).

- **gpsData**: Raw GPS object from EXIF
- **Returns**: `{ latitude: string; longitude: string } | null`

```ts
const coords = ExifManager.getGPSCoordinates(exif.GPS);
```

### generateBaseExif(options?)

Creates a minimal EXIF structure with Make, Model, and Date fields.

- **options**: `{ make?: string; model?: string; date?: string }`
- **Returns**: `ExifData`

```ts
const exif = ExifManager.generateBaseExif({ make: 'Canon', model: 'EOS 80D', date: '2024-01-01T00:00:00Z' });
```

### setUserComments(exifData, userComments)

Adds or updates the `Exif[37510]` (UserComment) tag with a JSON string.

- **exifData**: Existing EXIF object
- **userComments**: Arbitrary JSON-serializable object
- **Returns**: Updated `ExifData`

```ts
const updated = ExifManager.setUserComments(exif, { UploadedBy: 'Alice', Note: 'Sample' });
```

### Notes

- For URL inputs, `readExif` is intended for browsers; in Node, prefer base64 inputs.
- `keyValueExif` is a display-friendly flattened view; `exifData` is the structured EXIF object.