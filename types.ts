export interface Screenshot {
  id: string;
  timestamp: number;
  url: string; // Blob URL for better performance & memory usage
  fileName: string;
  width: number;
  height: number;
}

export interface VideoMeta {
  name: string;
  duration: number;
  url: string;
  width: number;
  height: number;
}

export enum CaptureMode {
  MANUAL = 'MANUAL',
  INTERVAL = 'INTERVAL',
}