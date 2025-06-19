import * as piexif from 'piexifjs';
import { ExifData } from '../types';

// Numeric constants for EXIF tags
const IMAGEIFD_MAKE = 271;
const IMAGEIFD_MODEL = 272;
const IMAGEIFD_DATETIME = 306;
const EXIFIFD_DATETIMEORIGINAL = 36867;
const GPSIFD_GPSLATITUDEREF = 1;
const GPSIFD_GPSLATITUDE = 2;
const GPSIFD_GPSLONGITUDEREF = 3;
const GPSIFD_GPSLONGITUDE = 4;

export class ExifHandler {
  private now: string;
  private userComments: Record<string, any>;
  private exifData: ExifData | null;
  private exifBytes: string | null;

  constructor(now: string = new Date().toISOString()) {
    this.now = now;
    this.userComments = {};
    this.exifData = null;
    this.exifBytes = null;
  }

  // Generate base EXIF structure
  generateBaseExif(): ExifData {
    return {
      "0th": {
        [IMAGEIFD_MAKE]: 'Ecos',
        [IMAGEIFD_MODEL]: 'WEBAPP',
        [IMAGEIFD_DATETIME]: this.now
      },
      "Exif": {
        [EXIFIFD_DATETIMEORIGINAL]: this.now
      },
      "GPS": {},
      "Interop": {},
      "1st": {},
      "thumbnail": undefined
    };
  }

  // Get GPS data with timeout protection (browser only)
  async getGpsData(): Promise<{ gpsData: any; coordinates: { latitude: string; longitude: string } }> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error('GPS timeout')), 10000);

      if (!navigator.geolocation) {
        clearTimeout(timeoutId);
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const { latitude, longitude } = position.coords;
          // Convert decimal degrees to DMS (Degrees, Minutes, Seconds)
          const toDMS = (degree: number): [number, number][] => {
            const d = Math.floor(degree);
            const m = Math.floor((degree - d) * 60);
            const s = Math.round((degree - d - m / 60) * 3600);
            return [[d, 1], [m, 1], [s, 1]];
          };

          resolve({
            gpsData: {
              [GPSIFD_GPSLATITUDEREF]: latitude >= 0 ? "N" : "S",
              [GPSIFD_GPSLATITUDE]: toDMS(Math.abs(latitude)),
              [GPSIFD_GPSLONGITUDEREF]: longitude >= 0 ? "E" : "W",
              [GPSIFD_GPSLONGITUDE]: toDMS(Math.abs(longitude))
            },
            coordinates: {
              latitude: latitude.toFixed(6),
              longitude: longitude.toFixed(6)
            }
          });
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
      );
    });
  }

  // Process and update EXIF data
  async processExifData(imageData: string, fileName: string): Promise<string> {
    try {
      // Try to load existing EXIF data
      this.exifData = piexif.load(imageData);
      if (this.exifData && this.exifData.Exif && this.exifData.Exif[37510]) {
        try {
          this.userComments = JSON.parse(this.exifData.Exif[37510]);
        } catch (error) {
          console.warn('Error parsing existing userComments:', error);
        }
      }
    } catch (error) {
      console.warn('No EXIF data found, generating new:', error);
      this.exifData = this.generateBaseExif();
    }

    // Try to get and add GPS data
    try {
      const gpsInfo = await this.getGpsData();
      this.userComments.ImageUploadGPS = gpsInfo.coordinates;
      if (this.exifData) {
        this.exifData.GPS = gpsInfo.gpsData;
      }
    } catch (error) {
      console.warn('GPS data not available:', error);
    }

    // Update metadata
    if (!this.userComments.OriginalName) {
      this.userComments.OriginalName = fileName;
    }
    this.userComments.ImageUploadDate = this.now;
    if (this.exifData && this.exifData.Exif) {
      this.exifData.Exif[37510] = JSON.stringify(this.userComments, null, 2);
    }
    this.exifBytes = piexif.dump(this.exifData || {});
    return this.exifBytes;
  }
} 