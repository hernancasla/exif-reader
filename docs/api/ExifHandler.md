## ExifHandler (Browser)

Browser helper for generating and enriching EXIF metadata, including GPS from the device (with permission).

```ts
class ExifHandler {
  constructor(now?: string)
  generateBaseExif(): ExifData
  getGpsData(): Promise<{ gpsData: any; coordinates: { latitude: string; longitude: string } }>
  processExifData(imageData: string, fileName: string): Promise<string>
}
```

### constructor(now?: string)

Initializes with a timestamp (`now`) used for EXIF dates. Defaults to the current ISO timestamp.

### generateBaseExif()

Returns a minimal EXIF object with Make (`Ecos`), Model (`WEBAPP`), and Date fields.

```ts
const handler = new ExifHandler();
const exif = handler.generateBaseExif();
```

### getGpsData()

Resolves to a pair of values:
- `gpsData`: GPS fields ready for EXIF insertion (DMS arrays and refs)
- `coordinates`: Readable decimal strings `{ latitude, longitude }`

Uses `navigator.geolocation.getCurrentPosition` with a 10s timeout.

```ts
const { gpsData, coordinates } = await handler.getGpsData();
```

### processExifData(imageData, fileName)

Loads existing EXIF (if any), preserves/merges a JSON `userComments` object in `Exif[37510]`, attempts to inject current GPS data, and returns serialized EXIF bytes (string) suitable for `piexifjs.insert`.

```ts
const handler = new ExifHandler();
const exifBytes = await handler.processExifData(imageBase64, 'photo.jpg');
// Optionally, insert into the image (in browser):
// const updatedBase64 = piexif.insert(exifBytes, imageBase64);
```

### Notes

- Browser-only. Requires `navigator.geolocation`, `fetch`, and DOM APIs.
- If GPS permission is denied or times out, processing continues without GPS.