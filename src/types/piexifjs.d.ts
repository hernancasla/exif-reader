declare module 'piexifjs' {
  export interface IExif {
    "0th"?: { [key: number]: any };
    "Exif"?: { [key: number]: any };
    "GPS"?: { [key: number]: any };
    "Interop"?: { [key: number]: any };
    "1st"?: { [key: number]: any };
    "thumbnail"?: string | undefined;
  }

  export function load(dataURL: string): IExif;
  export function dump(exifObj: IExif): string;
  export function insert(exifStr: string, dataURL: string): string;
} 