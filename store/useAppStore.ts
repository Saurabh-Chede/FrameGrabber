import { create } from 'zustand';
import { Screenshot, VideoMeta } from '../types';

interface AppState {
  videoMeta: VideoMeta | null;
  screenshots: Screenshot[];
  selectedScreenshotId: string | null;
  
  // Actions
  setVideoMeta: (meta: VideoMeta | null) => void;
  addScreenshot: (blob: Blob, timestamp: number, width: number, height: number) => void;
  updateScreenshot: (id: string, blob: Blob, width: number, height: number) => void;
  deleteScreenshot: (id: string) => void;
  clearGallery: () => void;
  selectScreenshot: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  videoMeta: null,
  screenshots: [],
  selectedScreenshotId: null,

  setVideoMeta: (meta) => {
    const currentMeta = get().videoMeta;
    // Cleanup old video URL to prevent memory leaks
    if (currentMeta && currentMeta.url !== meta?.url) {
      URL.revokeObjectURL(currentMeta.url);
    }
    set({ videoMeta: meta });
  },

  addScreenshot: (blob, timestamp, width, height) => {
    // Create an ObjectURL from the blob. This is much more memory efficient
    // than storing large Base64 strings in the JS heap.
    const url = URL.createObjectURL(blob);
    const id = crypto.randomUUID();
    const videoName = get().videoMeta?.name || 'video';
    const cleanName = videoName.replace(/\.[^/.]+$/, "");
    
    const newScreenshot: Screenshot = { 
      id, 
      timestamp, 
      url,
      width,
      height,
      fileName: `${cleanName}_${timestamp.toFixed(2)}s.png`
    };
    
    set((state) => ({
      screenshots: [newScreenshot, ...state.screenshots],
      selectedScreenshotId: id // Auto-select new screenshot
    }));
  },

  updateScreenshot: (id, blob, width, height) => {
    const url = URL.createObjectURL(blob);
    
    set((state) => {
      const index = state.screenshots.findIndex(s => s.id === id);
      if (index === -1) return state;

      const oldScreenshot = state.screenshots[index];
      
      // Revoke old URL to free memory
      URL.revokeObjectURL(oldScreenshot.url);

      const updatedScreenshot = {
        ...oldScreenshot,
        url,
        width,
        height
      };

      const newScreenshots = [...state.screenshots];
      newScreenshots[index] = updatedScreenshot;

      return { screenshots: newScreenshots };
    });
  },

  deleteScreenshot: (id) => {
    set((state) => {
      const shot = state.screenshots.find(s => s.id === id);
      if (shot) {
          // Critical: Revoke the URL to free up memory
          URL.revokeObjectURL(shot.url);
      }
      
      const newScreenshots = state.screenshots.filter((s) => s.id !== id);
      const isSelected = state.selectedScreenshotId === id;
      
      return {
        screenshots: newScreenshots,
        selectedScreenshotId: isSelected ? null : state.selectedScreenshotId
      };
    });
  },

  clearGallery: () => {
    const { screenshots } = get();
    // Revoke all URLs at once
    screenshots.forEach(s => URL.revokeObjectURL(s.url));
    set({ screenshots: [], selectedScreenshotId: null });
  },

  selectScreenshot: (id) => set({ selectedScreenshotId: id }),
}));