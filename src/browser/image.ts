import { ExifKeyValue, ImageInfo } from '../types';
import { GPSUtils } from '../utils/gps';
import * as piexif from 'piexifjs';

export class BrowserImageUtils {
  /**
   * Formats file size in bytes to human readable format
   * @param sizeInBytes - Size in bytes
   * @returns Formatted size string
   */
  private static formatFileSize(sizeInBytes: number): string {
    if (sizeInBytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const size = (sizeInBytes / Math.pow(1024, i)).toFixed(2);
    return `${size} ${units[i]}`;
  }

  /**
   * Gets image information from a Blob
   * @param blob - Image blob
   * @param width - Image width
   * @param height - Image height
   * @returns Image information
   */
  private static getImageInfo(blob: Blob, width: number | string, height: number | string): ImageInfo {
    return {
      size: this.formatFileSize(blob.size),
      type: blob.type,
      width,
      height
    };
  }

  /**
   * Converts image information to key-value pairs
   * @param info - Image information
   * @returns Array of key-value pairs
   */
  private static imageInfoToKeyValue(info: ImageInfo): ExifKeyValue[] {
    return [
      { key: "Size", value: info.size },
      { key: "Type", value: info.type },
      { key: "Width", value: `${info.width}px` },
      { key: "Height", value: `${info.height}px` },
    ];
  }

  /**
   * Extracts EXIF data from an image URL
   * @param imageSrc - Image URL or base64 string
   * @returns Array of EXIF key-value pairs
   */
  static async extractExifData(imageSrc: string): Promise<ExifKeyValue[]> {
    try {
      // Step 1: Fetch the image
      const response = await fetch(imageSrc);
      if (!response.ok) {
        throw new Error("Failed to fetch the image.");
      }

      const blob = await response.blob();

      // Step 2: Get image dimensions
      const imageElement = new Image();
      imageElement.src = imageSrc;

      await new Promise((resolve) => {
        imageElement.onload = resolve;
        imageElement.onerror = () => resolve(null);
      });

      const width = imageElement.naturalWidth || "Unknown";
      const height = imageElement.naturalHeight || "Unknown";

      // Step 3: Convert Blob to Data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject("Error reading Blob.");
        reader.readAsDataURL(blob);
      });

      // Step 4: Extract EXIF data
      let exifData;
      try {
        exifData = piexif.load(dataUrl);
      } catch (e) {
        exifData = {};
      }

      // Step 5: Transform EXIF data into key-value pairs
      const keyValueExif: ExifKeyValue[] = [];
      const imageInfo = this.getImageInfo(blob, width, height);
      keyValueExif.push(...this.imageInfoToKeyValue(imageInfo));

      for (const section in exifData) {
        if (section === "thumbnail") continue;

        const sectionData = (exifData as any)[section];
        if (section === "GPS" && sectionData && Object.keys(sectionData).length > 0) {
          const gpsCoordinates = GPSUtils.getGPSCoordinates(sectionData);
          if (gpsCoordinates !== null) {
            keyValueExif.push({ key: "GPS", value: JSON.stringify(gpsCoordinates) });
          }
        } else {
          for (const tagNumber in sectionData) {
            try {
              const tagName = `Tag ${tagNumber}`;
              let tagValue = sectionData[tagNumber];
              
              if (typeof tagValue === "object" && tagValue.length) {
                tagValue = tagValue.join(", ");
              } else if (typeof tagValue === "undefined" || tagValue === null) {
                tagValue = "N/A";
              }
              
              keyValueExif.push({ key: tagName, value: tagValue });
            } catch (error) {
              console.error(error);
            }
          }
        }
      }

      return keyValueExif;
    } catch (error) {
      console.error("Error extracting image and EXIF info:", error);
      return [];
    }
  }
} 