import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './icons';
import { Screenshot } from '../types';
import { useAppStore } from '../store/useAppStore';

interface ScreenshotGalleryProps {
  onClear: () => void;
  onImageSelect?: () => void;
}

const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="w-full h-full relative bg-zinc-900 overflow-hidden">
      {!isVisible ? (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
           <div className="w-full h-full animate-pulse bg-zinc-800/50" />
        </div>
      ) : (
        <>
            {!isLoaded && (
                <div className="absolute inset-0 bg-zinc-800 animate-pulse z-10" />
            )}
            <img
                src={src}
                alt={alt}
                className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                onLoad={() => setIsLoaded(true)}
                loading="lazy"
            />
        </>
      )}
    </div>
  );
};

export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ onClear, onImageSelect }) => {
  const screenshots = useAppStore((state) => state.screenshots);
  const selectedId = useAppStore((state) => state.selectedScreenshotId);
  const selectScreenshot = useAppStore((state) => state.selectScreenshot);
  const deleteScreenshot = useAppStore((state) => state.deleteScreenshot);

  const downloadImage = (e: React.MouseEvent, screenshot: Screenshot) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = screenshot.url;
    link.download = screenshot.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteScreenshot(id);
  };

  const handleSelect = (id: string) => {
    selectScreenshot(id);
    if (onImageSelect) {
      onImageSelect();
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-transparent overflow-hidden">
      {/* Gallery Header */}
      <div className="p-3 lg:p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30 shrink-0">
        <div className="flex items-center gap-3">
          <Icons.Image className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-bold text-zinc-100">Gallery</h2>
        </div>
        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-bold">
           {screenshots.length}
        </span>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 bg-transparent p-3 overflow-y-auto no-scrollbar">
        {screenshots.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 p-8">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <Icons.Image className="w-5 h-5 opacity-30 text-zinc-500" />
            </div>
            <p className="text-xs font-bold text-zinc-500 text-center">No screenshots yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
            {screenshots.map((shot) => {
              const isSelected = selectedId === shot.id;
              return (
                <div 
                  key={shot.id} 
                  onClick={() => handleSelect(shot.id)}
                  className={`group relative aspect-video bg-zinc-900 overflow-hidden rounded-lg border-2 transition-all cursor-pointer will-change-transform ${
                    isSelected 
                      ? 'border-orange-500 ring-2 ring-orange-500/20 z-10' 
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <LazyImage 
                    src={shot.url} 
                    alt={`Frame at ${shot.timestamp}`} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                    <button 
                      onClick={(e) => downloadImage(e, shot)}
                      className="p-1.5 bg-white text-black rounded hover:scale-110 transition-transform"
                      title="Download"
                    >
                      <Icons.Download className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, shot.id)}
                      className="p-1.5 bg-red-500 text-white rounded hover:scale-110 transition-transform"
                      title="Delete"
                    >
                      <Icons.Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Timestamp Tag */}
                  <div className="absolute bottom-1 right-1 pointer-events-none">
                     <div className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-sm backdrop-blur-md ${
                       isSelected ? 'bg-orange-600/90 text-white' : 'bg-black/60 text-zinc-300'
                     }`}>
                        {shot.timestamp.toFixed(2)}s
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};