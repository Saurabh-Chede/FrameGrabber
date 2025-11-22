import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './icons';
import { useAppStore } from '../store/useAppStore';

type AspectRatio = 'original' | '16:9' | '4:3' | '1:1' | '9:16' | '21:9';

export const ScreenshotDetail: React.FC = () => {
  const screenshots = useAppStore((state) => state.screenshots);
  const selectedId = useAppStore((state) => state.selectedScreenshotId);
  const deleteScreenshot = useAppStore((state) => state.deleteScreenshot);
  const selectScreenshot = useAppStore((state) => state.selectScreenshot);
  const updateScreenshot = useAppStore((state) => state.updateScreenshot);

  const screenshot = screenshots.find(s => s.id === selectedId) || null;
  
  // Refs
  const imageRef = useRef<HTMLImageElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // View State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  // Layout State for Responsive Crop Box
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [cropBoxSize, setCropBoxSize] = useState({ w: 0, h: 0 });

  // Crop State
  const [isCropping, setIsCropping] = useState(false);
  const [cropRatio, setCropRatio] = useState<AspectRatio>('16:9');

  // Reset view when switching images
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsCropping(false);
  }, [selectedId]);

  // Reset view when entering crop mode
  useEffect(() => {
    if (isCropping) {
       setZoom(1);
       setPan({ x: 0, y: 0 });
    }
  }, [isCropping, cropRatio]);

  // Measure container for responsive crop box
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
       for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
          }
       }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Measure Crop Box strictly for the Preview Window calculations
  useEffect(() => {
    if (!isCropping || !cropBoxRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
       for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setCropBoxSize(prev => {
             // Debounce/Check to avoid unnecessary renders
             if (Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1) return prev;
             return { w: width, h: height };
          });
       }
    });
    
    observer.observe(cropBoxRef.current);
    return () => observer.disconnect();
  }, [isCropping, cropRatio, containerSize]);

  // Global Drag Handling (Window level)
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          e.preventDefault();
           setPan({
              x: e.clientX - dragStart.current.x,
              y: e.clientY - dragStart.current.y
          });
        }
    };
    
    if (isDragging) {
        window.addEventListener('mouseup', handleGlobalMouseUp);
        window.addEventListener('mousemove', handleGlobalMouseMove);
    }
    
    return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging]);

  if (!screenshot) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-transparent text-zinc-600 p-8">
        <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 border border-zinc-800/50">
            <Icons.Image className="w-10 h-10 opacity-20 text-white" />
        </div>
        <h3 className="text-lg font-bold text-zinc-300 mb-2">No Selection</h3>
        <p className="text-sm text-center max-w-[200px] text-zinc-500">Select a frame from the gallery to inspect.</p>
      </div>
    );
  }

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = screenshot.url;
    link.download = screenshot.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- INTERACTION HANDLERS ---
  
  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.5, Math.min(5, z + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      // Store the offset between mouse and current pan position
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleResetCrop = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // --- CROP LOGIC ---

  const applyCrop = async () => {
    if (!imageRef.current || !cropBoxRef.current) return;

    try {
      const img = imageRef.current;
      const cropBox = cropBoxRef.current;
      
      // 1. Get visual coordinates
      const imgRect = img.getBoundingClientRect();
      const cropRect = cropBox.getBoundingClientRect();

      // 2. Calculate scaling factor (Physical Pixels / Visual Pixels)
      // Using naturalWidth ensures we crop from full resolution source
      const scaleX = img.naturalWidth / imgRect.width;
      const scaleY = img.naturalHeight / imgRect.height;

      // 3. Calculate crop coordinates relative to natural image
      const cropX = (cropRect.left - imgRect.left) * scaleX;
      const cropY = (cropRect.top - imgRect.top) * scaleY;
      const cropW = cropRect.width * scaleX;
      const cropH = cropRect.height * scaleY;

      // 4. Draw to canvas
      const canvas = document.createElement('canvas');
      // Ensure valid dimensions
      canvas.width = Math.max(1, cropW);
      canvas.height = Math.max(1, cropH);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      ctx.drawImage(
        img, 
        cropX, cropY, cropW, cropH, // Source (Natural coords)
        0, 0, cropW, cropH          // Destination (Canvas coords)
      );

      // 5. Save
      canvas.toBlob((blob) => {
        if (blob) {
          updateScreenshot(screenshot.id, blob, cropW, cropH);
          setIsCropping(false);
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }
      }, 'image/png', 1.0);

    } catch (error) {
      console.error("Crop failed", error);
    }
  };

  const ratios: { label: string, value: AspectRatio }[] = [
    { label: 'Free', value: 'original' },
    { label: '16:9', value: '16:9' },
    { label: '9:16', value: '9:16' },
    { label: '4:3', value: '4:3' },
    { label: '1:1', value: '1:1' },
    { label: '21:9', value: '21:9' },
  ];

  // --- RESPONSIVE SIZING LOGIC ---

  // 1. Determine the aspect ratio of the crop target
  let targetRatio = screenshot.width / (screenshot.height || 1);
  if (cropRatio !== 'original') {
     const [w, h] = cropRatio.split(':').map(Number);
     targetRatio = w / h;
  }

  // 2. Determine Crop Box Style
  // It should maximize size within container while respecting aspect ratio
  const containerAspect = containerSize.w / (containerSize.h || 1);
  const cropBoxStyle: React.CSSProperties = {
     aspectRatio: `${targetRatio}`,
  };

  // If target is wider than container (relative to height), constrain by width
  if (targetRatio > containerAspect) {
      cropBoxStyle.width = '100%';
      cropBoxStyle.height = 'auto';
  } else {
      cropBoxStyle.height = '100%';
      cropBoxStyle.width = 'auto';
  }

  // 3. Determine Image Style ("Cover" Logic)
  // We want the image to always fill the crop box without distortion.
  // If Image is wider than Box: Fit Height, Width overflows (auto)
  // If Image is taller than Box: Fit Width, Height overflows (auto)
  const imgRatio = screenshot.width / (screenshot.height || 1);
  
  const imageBaseStyle: React.CSSProperties = imgRatio > targetRatio 
      ? { height: '100%', width: 'auto' } 
      : { width: '100%', height: 'auto' };


  // --- PREVIEW LOGIC ---
  // Use a bounding box max size to prevent portrait previews from being too tall
  const PREVIEW_MAX_SIZE = 220; 
  const cropAspect = cropBoxSize.w / (cropBoxSize.h || 1);
  
  let previewWidth = PREVIEW_MAX_SIZE;
  let previewHeight = PREVIEW_MAX_SIZE;

  if (cropAspect >= 1) {
     // Landscape or Square: Maximize width, calc height
     previewWidth = PREVIEW_MAX_SIZE;
     previewHeight = PREVIEW_MAX_SIZE / cropAspect;
  } else {
     // Portrait: Maximize height, calc width
     previewHeight = PREVIEW_MAX_SIZE;
     previewWidth = PREVIEW_MAX_SIZE * cropAspect;
  }

  const previewScaleRatio = cropBoxSize.w > 0 ? previewWidth / cropBoxSize.w : 0;


  return (
    <div className="flex flex-col w-full h-full bg-transparent overflow-hidden">
        
        {/* Editor Header */}
        <div className="p-3 lg:p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30 shrink-0 z-20 relative">
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded transition-colors ${isCropping ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                  {isCropping ? <Icons.Crop className="w-4 h-4" /> : <Icons.ZoomIn className="w-4 h-4" />}
                </div>
                <h2 className="text-sm font-bold text-zinc-100">
                   {isCropping ? 'Crop Mode' : 'Editor'}
                </h2>
                
                {!isCropping && (
                  <>
                    <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                    <span className="font-mono text-xs text-zinc-400 hidden sm:inline">
                        {screenshot.timestamp.toFixed(2)}s
                    </span>
                    <span className="text-[10px] text-zinc-500 border border-zinc-800 px-1.5 rounded bg-zinc-900 hidden sm:inline">
                        {Math.round(screenshot.width)} x {Math.round(screenshot.height)}
                    </span>
                  </>
                )}
            </div>
            
            {/* Mobile Close */}
            {!isCropping && (
               <button onClick={() => selectScreenshot(null)} className="lg:hidden p-2 text-zinc-400 hover:text-white">
                  <Icons.Close className="w-4 h-4" />
               </button>
            )}
        </div>

        {/* Main Canvas Area */}
        <div 
           ref={containerRef}
           className="flex-1 relative bg-zinc-950 overflow-hidden flex items-center justify-center select-none p-8"
           onWheel={handleWheel}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 to-zinc-950 pointer-events-none"></div>
            
            {isCropping ? (
                <>
                    {/* --- CROP VIEW --- */}
                    {/* The container centers the crop box */}
                    <div 
                        ref={cropBoxRef}
                        className="relative border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.75)] z-10 overflow-hidden transition-all duration-300"
                        style={cropBoxStyle}
                        onMouseDown={handleMouseDown}
                    >
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col pointer-events-none opacity-50 z-20">
                            <div className="flex-1 border-b border-white/30 border-dashed"></div>
                            <div className="flex-1 border-b border-white/30 border-dashed"></div>
                            <div className="flex-1"></div>
                        </div>
                        <div className="absolute inset-0 flex pointer-events-none opacity-50 z-20">
                            <div className="flex-1 border-r border-white/30 border-dashed"></div>
                            <div className="flex-1 border-r border-white/30 border-dashed"></div>
                            <div className="flex-1"></div>
                        </div>

                        {/* The Image being cropped */}
                        <img 
                            ref={imageRef}
                            src={screenshot.url}
                            alt="Crop Target"
                            draggable={false}
                            className={`absolute max-w-none origin-center will-change-transform ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                            style={{
                                ...imageBaseStyle,
                                left: '50%',
                                top: '50%',
                                transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            }}
                        />
                        
                        {/* Instructions Overlay */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[9px] text-zinc-400 pointer-events-none z-30 border border-white/10 whitespace-nowrap">
                            Drag & Zoom to adjust
                        </div>
                    </div>

                    {/* --- LIVE PREVIEW WINDOW --- */}
                    {previewScaleRatio > 0 && (
                        <div className="absolute bottom-4 right-4 z-40 flex flex-col gap-1.5 animate-fade-in pointer-events-none lg:pointer-events-auto">
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shadow-black drop-shadow-md">Output Preview</span>
                            </div>
                            <div className="p-1 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-lg shadow-2xl">
                                <div 
                                    className="overflow-hidden relative bg-black border border-zinc-800 rounded-sm"
                                    style={{
                                        width: previewWidth,
                                        height: previewHeight
                                    }}
                                >
                                    <img 
                                        src={screenshot.url}
                                        className="absolute max-w-none origin-center will-change-transform"
                                        style={{
                                            ...imageBaseStyle,
                                            left: '50%',
                                            top: '50%',
                                            // Magic: Scale the pan translation by the ratio of PreviewWidth / CropBoxWidth
                                            transform: `translate(-50%, -50%) translate(${pan.x * previewScaleRatio}px, ${pan.y * previewScaleRatio}px) scale(${zoom})`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                // --- STANDARD VIEWER ---
                <div 
                    className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                >
                    <img 
                        src={screenshot.url} 
                        className="max-w-full max-h-full object-contain transition-transform duration-75 ease-out will-change-transform shadow-2xl" 
                        alt="Detail" 
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        }}
                        draggable={false}
                    />
                    
                    {/* Zoom Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-full p-1.5 shadow-2xl z-20 transition-opacity hover:opacity-100 opacity-80">
                        <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 hover:text-white">
                            <Icons.ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-zinc-300 min-w-[3rem] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button onClick={() => setZoom(z => Math.min(5, z + 0.5))} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 hover:text-white">
                            <Icons.ZoomIn className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-zinc-700 mx-1"></div>
                        <button onClick={() => { setZoom(1); setPan({x:0, y:0}); }} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 hover:text-orange-500">
                            <Icons.Reset className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Action Bar */}
        <div className="p-3 lg:p-4 border-t border-zinc-800 bg-zinc-900/30 flex flex-col gap-3 shrink-0 z-20 relative">
           
           {isCropping ? (
             // --- CROP CONTROLS ---
             <div className="flex flex-col gap-3 animate-fade-in">
                {/* Aspect Ratio Row */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {ratios.map(r => (
                        <button
                           key={r.label}
                           onClick={() => setCropRatio(r.value)}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                             cropRatio === r.value 
                               ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/20' 
                               : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                           }`}
                        >
                           {r.label}
                        </button>
                    ))}
                </div>

                {/* Zoom Slider Controller */}
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800/50 rounded-lg px-3 py-2">
                   <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                      <Icons.ZoomOut className="w-3.5 h-3.5" />
                   </button>
                   <input
                      type="range"
                      min={0.5}
                      max={5}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform"
                   />
                   <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                      <Icons.ZoomIn className="w-3.5 h-3.5" />
                   </button>
                   <div className="w-px h-3 bg-zinc-700 mx-1"></div>
                   <span className="text-[10px] font-mono font-bold text-zinc-400 w-8 text-right">{Math.round(zoom * 100)}%</span>
                </div>

                {/* Button Row */}
                <div className="flex gap-2">
                    <button
                      onClick={handleResetCrop}
                      className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm rounded-lg transition-colors border border-zinc-700"
                      title="Reset Zoom/Pan"
                    >
                      <Icons.Reset className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsCropping(false)}
                      className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm rounded-lg transition-colors border border-zinc-700"
                    >
                       Cancel
                    </button>
                    <button 
                      onClick={applyCrop}
                      className="flex-[2] py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                       <Icons.Check className="w-4 h-4" /> Apply Crop
                    </button>
                </div>
             </div>
           ) : (
             // --- STANDARD ACTIONS ---
             <div className="flex gap-3">
                <button 
                  onClick={() => setIsCropping(true)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-200 font-bold text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                   <Icons.Crop className="w-4 h-4" /> <span className="hidden sm:inline">Crop</span>
                </button>
                
                <button 
                    onClick={downloadImage}
                    className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black text-sm font-bold transition-colors flex items-center justify-center gap-2 rounded-lg shadow-lg shadow-white/5"
                >
                    <Icons.Download className="w-4 h-4" /> 
                    <span>Save</span>
                </button>
                
                <button 
                    onClick={() => deleteScreenshot(screenshot.id)}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-red-500/10 border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-500 transition-colors rounded-lg"
                    title="Delete"
                >
                    <Icons.Trash2 className="w-5 h-5" />
                </button>
             </div>
           )}
        </div>
    </div>
  );
};