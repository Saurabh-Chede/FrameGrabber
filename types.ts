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
  crossOrigin?: "anonymous";
  type?: 'native' | 'youtube';
  youtubeId?: string;
}

export enum CaptureMode {
  MANUAL = 'MANUAL',
  INTERVAL = 'INTERVAL',
}