import * as piexif from 'piexifjs';
import { ExifData, ExifKeyValue } from './types';
import { GPSUtils } from './utils/gps';
import { BrowserImageUtils } from './browser/image';
import { ExifHandler } from './browser/exif-handler';

// Numeric constants for EXIF tags
const IMAGEIFD_MAKE = 271;
const IMAGEIFD_MODEL = 272;
const IMAGEIFD_DATETIME = 306;
const EXIFIFD_DATETIMEORIGINAL = 36867;
const USER_COMMENT_TAG = 37510;

export class ExifManager {

 /**
   * Extracts EXIF data from an image (base64 or URL) and returns it as key-value pairs
   * @param imageSrc - Image URL or base64 string
   * @param basicExifInfo - If provided, used to generate basic EXIF if none exists
   */
  static async readExif(
    imageSrc: string,
    basicExifInfo?: import('./types').BasicExifInfo
  ): Promise<{ keyValueExif: ExifKeyValue[], exifData: ExifData }> {
    // If base64
    if (imageSrc.startsWith('data:image/')) {
      try {
        const exifData = piexif.load(imageSrc);
        const keyValueExif: ExifKeyValue[] = [];
        for (const section in exifData) {
          if (section === 'thumbnail') continue;
          const sectionData = (exifData as any)[section];
          if (section === 'GPS' && Object.keys(sectionData).length > 0) {
            // Process GPS in a readable way
            const gpsCoords = GPSUtils.getGPSCoordinates(sectionData);
            if (gpsCoords) {
              keyValueExif.push({ key: 'GPS', value: JSON.stringify(gpsCoords) });
            }
          }
          for (const tagNumber in sectionData) {
            // Skip if GPS already processed
            if (section === 'GPS') continue;
            // Get tag name if available
            let tagName = tagNumber;
            if ((piexif as any).TAGS && (piexif as any).TAGS[section] && (piexif as any).TAGS[section][tagNumber]) {
              tagName = (piexif as any).TAGS[section][tagNumber].name || tagNumber;
            }
            let tagValue = sectionData[tagNumber];
            if (typeof tagValue === 'object' && tagValue.length) {
              tagValue = tagValue.join(', ');
            } else if (typeof tagValue === 'undefined' || tagValue === null) {
              tagValue = 'N/A';
            }
            keyValueExif.push({ key: tagName, value: tagValue });
          }
        }
        return { keyValueExif, exifData };
      } catch (error) {
        // If no EXIF and basicExifInfo is present
        if (basicExifInfo) {
          const result = [
            { key: 'Make', value: basicExifInfo.make || 'Ecos' },
            { key: 'Model', value: basicExifInfo.model || 'WEBAPP' },
            { key: 'DateTime', value: basicExifInfo.date || new Date().toISOString() }
          ];
          if (
            typeof basicExifInfo.GPSLatitude === 'number' &&
            typeof basicExifInfo.GPSLongitude === 'number'
          ) {
            result.push({
              key: 'GPS',
              value: JSON.stringify({
                latitude: basicExifInfo.GPSLatitude.toFixed(6),
                longitude: basicExifInfo.GPSLongitude.toFixed(6)
              })
            });
          }
          return { keyValueExif: result, exifData: {
            "0th": {
              [IMAGEIFD_MAKE]: basicExifInfo.make || 'Ecos',
              [IMAGEIFD_MODEL]: basicExifInfo.model || 'WEBAPP',
              [IMAGEIFD_DATETIME]: basicExifInfo.date || new Date().toISOString()
            },
            "Exif": {
              [EXIFIFD_DATETIMEORIGINAL]: basicExifInfo.date || new Date().toISOString()
            },
            "GPS": {
              latitude: basicExifInfo.GPSLatitude?.toFixed(6),
              longitude: basicExifInfo.GPSLongitude?.toFixed(6)
            },
            "Interop": {},
            "1st": {},
            "thumbnail": undefined
          } };
        }
        return { keyValueExif: [], exifData: {} };
      }
    }
    // If URL
    try {
      const keyValueExif = await BrowserImageUtils.extractExifData(imageSrc);
      return { keyValueExif, exifData: {} };
    } catch (error) {
      if (basicExifInfo) {
        const result: ExifKeyValue[] = [
          { key: 'Make', value: basicExifInfo.make || 'Ecos' },
          { key: 'Model', value: basicExifInfo.model || 'WEBAPP' },
          { key: 'DateTime', value: basicExifInfo.date || new Date().toISOString() }
        ];
        if (
          typeof basicExifInfo.GPSLatitude === 'number' &&
          typeof basicExifInfo.GPSLongitude === 'number'
        ) {
          result.push({
            key: 'GPS',
            value: {
              latitude: basicExifInfo.GPSLatitude.toFixed(6),
              longitude: basicExifInfo.GPSLongitude.toFixed(6)
            }
          });
        }
        return { keyValueExif: result, exifData: {
          "0th": {
            [IMAGEIFD_MAKE]: basicExifInfo.make || 'Ecos',
            [IMAGEIFD_MODEL]: basicExifInfo.model || 'WEBAPP',
            [IMAGEIFD_DATETIME]: basicExifInfo.date || new Date().toISOString()
          },
          "Exif": {
            [EXIFIFD_DATETIMEORIGINAL]: basicExifInfo.date || new Date().toISOString()
          },
          "GPS": {
            latitude: basicExifInfo.GPSLatitude?.toFixed(6),
            longitude: basicExifInfo.GPSLongitude?.toFixed(6)
          },
          "Interop": {},
          "1st": {},
          "thumbnail": undefined
        } };
      }
      return { keyValueExif: [], exifData: {} };
    }
  }

  /**
   * Modifies EXIF data in an image
   * @param imageData - Image data in base64 format
   * @param exifData - New EXIF data to insert
   * @returns Image with new EXIF data in base64 format
   */
  static modifyExif(imageData: string, exifData: ExifData): string {
    try {
      const exifStr = piexif.dump(exifData);
      const newImageData = piexif.insert(exifStr, imageData);
      return newImageData;
    } catch (error: any) {
      throw new Error(`Error modifying EXIF data: ${error.message}`);
    }
  }

  /**
   * Removes all EXIF data from an image
   * @param imageData - Image data in base64 format
   * @returns Image without EXIF data in base64 format
   */
  static removeExif(imageData: string): string {
    try {
      const exifData = piexif.load(imageData);
      const emptyExif = {
        "0th": {},
        "Exif": {},
        "GPS": {},
        "1st": {},
        "thumbnail": undefined
      };
      const exifStr = piexif.dump(emptyExif);
      const newImageData = piexif.insert(exifStr, imageData);
      return newImageData;
    } catch (error: any) {
      throw new Error(`Error removing EXIF data: ${error.message}`);
    }
  }

  /**
   * Gets GPS coordinates from GPS data
   * @param gpsData - GPS data in any supported format
   * @returns GPS coordinates or null if invalid
   */
  static getGPSCoordinates(gpsData: any) {
    return GPSUtils.getGPSCoordinates(gpsData);
  }

  /**
   * Generates a base EXIF structure
   */
  static generateBaseExif({
    make = 'Ecos',
    model = 'WEBAPP',
    date = new Date().toISOString(),
  }: { make?: string; model?: string; date?: string } = {}): ExifData {
    return {
      "0th": {
        [IMAGEIFD_MAKE]: make,
        [IMAGEIFD_MODEL]: model,
        [IMAGEIFD_DATETIME]: date
      },
      "Exif": {
        [EXIFIFD_DATETIMEORIGINAL]: date
      },
      "GPS": {},
      "Interop": {},
      "1st": {},
      "thumbnail": undefined
    };
  }



  /**
   * Adds or updates user comments in an EXIF object
   */
  static setUserComments(exifData: ExifData, userComments: Record<string, any>): ExifData {
    if (!exifData.Exif) exifData.Exif = {};
    exifData.Exif[USER_COMMENT_TAG] = JSON.stringify(userComments, null, 2);
    return exifData;
  }
}

// Export types
export * from './types';
export { ExifHandler }; 