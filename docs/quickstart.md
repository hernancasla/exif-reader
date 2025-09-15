## Quickstart

### Installation

```bash
npm install exif-reader-ts piexifjs
```

### Read EXIF from a base64 image (Node or Browser)

```typescript
import { ExifManager } from 'exif-reader-ts';

const { keyValueExif, exifData } = await ExifManager.readExif(imageBase64);

// keyValueExif is an array like [{ key: 'Make', value: 'Canon' }, ...]
// exifData is the raw EXIF object suitable for modification
```

### Provide basic EXIF when the image has none

```typescript
import { ExifManager } from 'exif-reader-ts';

const basic = {
  make: 'Canon',
  model: 'EOS 80D',
  date: '2024-06-01T12:00:00Z',
  GPSLatitude: -34.6037,
  GPSLongitude: -58.3816,
};

const { keyValueExif, exifData } = await ExifManager.readExif(imageBase64, basic);
```

### Read EXIF from an image URL (Browser)

```typescript
import { ExifManager } from 'exif-reader-ts';

const { keyValueExif } = await ExifManager.readExif('https://example.com/photo.jpg');
```

### Modify EXIF values

```typescript
import { ExifManager, ExifData } from 'exif-reader-ts';

const base = ExifManager.generateBaseExif({ make: 'Nikon', model: 'D90', date: '2024-01-01T00:00:00Z' });
const updatedBase64: string = ExifManager.modifyExif(imageBase64, base as ExifData);
```

### Remove all EXIF

```typescript
import { ExifManager } from 'exif-reader-ts';

const cleanBase64: string = ExifManager.removeExif(imageBase64);
```

### Extract GPS coordinates from GPS EXIF data

```typescript
import { ExifManager } from 'exif-reader-ts';

const coords = ExifManager.getGPSCoordinates(gpsData);
// -> { latitude: string, longitude: string } | null
```

### Browser-only EXIF enrichment (optional)

`ExifHandler` can enrich images with current time and device GPS (if permitted).

```typescript
import { ExifHandler } from 'exif-reader-ts';

const handler = new ExifHandler();
const exifBytes = await handler.processExifData(imageBase64, 'photo.jpg');
// exifBytes is a serialized EXIF string suitable for insertion with piexif
```

Notes:
- `ExifHandler` relies on `navigator.geolocation` and browser APIs, and is not intended for Node.
- For image URLs, `readExif` fetches the image and extracts EXIF in the browser.