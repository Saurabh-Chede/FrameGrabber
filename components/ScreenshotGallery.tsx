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
    <div ref={imgRef} className="w-full h-full relative bg-zinc-900">
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

interface GalleryItemProps {
  screenshot: Screenshot;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ screenshot, isSelected, onSelect, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = screenshot.url;
    link.download = screenshot.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div 
      onClick={onSelect}
      className={`group relative aspect-video bg-zinc-900 rounded-lg border-2 transition-all cursor-pointer will-change-transform ${
        isSelected 
          ? 'border-orange-500 ring-2 ring-orange-500/20 z-10' 
          : 'border-zinc-800 hover:border-zinc-600'
      }`}
    >
      {/* Image Wrapper - Clipped */}
      <div className="absolute inset-0 rounded-[6px] overflow-hidden">
        <LazyImage 
          src={screenshot.url} 
          alt={`Frame at ${screenshot.timestamp}`} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Menu Trigger */}
      <div className="absolute top-1.5 right-1.5 z-30">
        <button 
          onClick={toggleMenu}
          className={`p-1 rounded-full backdrop-blur-md border transition-all shadow-sm ${
            isMenuOpen 
              ? 'bg-zinc-800 text-white border-zinc-600' 
              : 'bg-black/30 text-zinc-300 border-white/10 hover:bg-black/50 hover:text-white'
          }`}
        >
          <Icons.MoreVertical className="w-3.5 h-3.5" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div 
            ref={menuRef}
            className="absolute top-full right-0 mt-1 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-40 animate-fade-in"
          >
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs transition-colors text-left"
            >
              <Icons.Download className="w-3.5 h-3.5" /> Download
            </button>
            <div className="h-px bg-zinc-800 mx-1"></div>
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-red-900/20 text-zinc-300 hover:text-red-400 text-xs transition-colors text-left"
            >
              <Icons.Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Timestamp Tag */}
      <div className="absolute bottom-1 right-1 pointer-events-none z-20">
         <div className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-sm backdrop-blur-md shadow-sm ${
           isSelected ? 'bg-orange-600/90 text-white' : 'bg-black/60 text-zinc-300'
         }`}>
            {screenshot.timestamp.toFixed(2)}s
         </div>
      </div>
    </div>
  );
};

export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ onClear, onImageSelect }) => {
  const screenshots = useAppStore((state) => state.screenshots);
  const selectedId = useAppStore((state) => state.selectedScreenshotId);
  const selectScreenshot = useAppStore((state) => state.selectScreenshot);
  const deleteScreenshot = useAppStore((state) => state.deleteScreenshot);

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
            {screenshots.map((shot) => (
              <GalleryItem
                key={shot.id}
                screenshot={shot}
                isSelected={selectedId === shot.id}
                onSelect={() => handleSelect(shot.id)}
                onDelete={() => deleteScreenshot(shot.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};