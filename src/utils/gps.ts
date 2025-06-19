import { GPSCoordinates, GPSData } from '../types';

export class GPSUtils {
  /**
   * Converts a fraction to decimal
   * @param fraction - Array containing numerator and denominator
   * @returns Decimal value
   */
  private static fractionToDecimal(fraction: [number, number]): number {
    return fraction[0] / fraction[1];
  }

  /**
   * Converts DMS (Degrees, Minutes, Seconds) to decimal degrees
   * @param dms - Array containing degrees, minutes, seconds
   * @param ref - Reference direction (N/S/E/W)
   * @returns Decimal degrees
   */
  private static convertToDecimal(dms: [number, number, number], ref: string): number {
    const degrees = dms[0];
    const minutes = dms[1];
    const seconds = dms[2];
    let decimal = degrees + minutes / 60 + seconds / 3600;

    if (ref === "S" || ref === "W") {
      decimal = -decimal;
    }

    return decimal;
  }

  /**
   * Parses GPS coordinates in fractional format
   * @param gpsData - GPS data in fractional format
   * @returns GPS coordinates or null if invalid
   */
  static parseFractionalGPSCoordinates(gpsData: any): GPSCoordinates | null {
    try {
      const convertToDecimal = (dms: any[], ref: string) => {
        const degrees = this.fractionToDecimal(dms[0]);
        const minutes = this.fractionToDecimal(dms[1]);
        const seconds = this.fractionToDecimal(dms[2]);
        let decimal = degrees + minutes / 60 + seconds / 3600;

        if (ref === "S" || ref === "W") {
          decimal = -decimal;
        }

        return decimal;
      };

      const latitude = convertToDecimal(gpsData[2], gpsData[1]);
      const longitude = convertToDecimal(gpsData[4], gpsData[3]);

      if (isNaN(longitude)) {
        return null;
      }

      return {
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Parses GPS coordinates in standard format
   * @param gpsData - GPS data in standard format
   * @returns GPS coordinates or null if invalid
   */
  static parseStandardGPSCoordinates(gpsData: GPSData): GPSCoordinates | null {
    try {
      const latitude = this.convertToDecimal(
        gpsData.GPSLatitude as [number, number, number],
        gpsData.GPSLatitudeRef as string
      );
      const longitude = this.convertToDecimal(
        gpsData.GPSLongitude as [number, number, number],
        gpsData.GPSLongitudeRef as string
      );

      if (isNaN(longitude)) {
        return null;
      }

      return {
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Gets GPS coordinates from various GPS data formats
   * @param gpsData - GPS data in any supported format
   * @returns GPS coordinates or null if invalid
   */
  static getGPSCoordinates(gpsData: any): GPSCoordinates | null {
    // Case 1: Fractional format
    if (gpsData[1] && gpsData[2] && gpsData[3] && gpsData[4] && Array.isArray(gpsData[2][0])) {
      return this.parseFractionalGPSCoordinates(gpsData);
    }

    // Case 2: Standard format
    if (gpsData.GPSLatitude && gpsData.GPSLongitude) {
      return this.parseStandardGPSCoordinates(gpsData);
    }

    return null;
  }
} 