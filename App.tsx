import React, { useState } from 'react';
import { VideoWorkspace } from './components/VideoWorkspace';
import { ScreenshotGallery } from './components/ScreenshotGallery';
import { ScreenshotDetail } from './components/ScreenshotDetail';
import { LandingPage } from './components/LandingPage';
import { Icons } from './components/icons';
import { useAppStore } from './store/useAppStore';

type Tab = 'studio' | 'editor' | 'gallery';

const App: React.FC = () => {
  const [hasLaunched, setHasLaunched] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('studio');
  
  // Connect to Store
  const videoMeta = useAppStore((state) => state.videoMeta);
  const screenshots = useAppStore((state) => state.screenshots);
  const clearGallery = useAppStore((state) => state.clearGallery);
  const setVideoMeta = useAppStore((state) => state.setVideoMeta);

  const handleClearGallery = () => {
    if (screenshots.length === 0) return;
    setShowClearConfirm(true);
  };

  const confirmClearGallery = () => {
    clearGallery();
    setShowClearConfirm(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!hasLaunched) {
    return <LandingPage onLaunch={() => setHasLaunched(true)} />;
  }

  return (
    // Changed h-screen to h-[100dvh] to fix mobile address bar issue
    <div className="h-[100dvh] w-screen bg-black flex flex-col font-sans text-zinc-100 overflow-hidden">
      
      {/* HEADER */}
      <header className="h-14 lg:h-16 shrink-0 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6 relative z-50">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div 
            className="relative group cursor-pointer"
            onClick={() => setHasLaunched(false)}
          >
            <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
            <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-1.5 lg:p-2 rounded-lg shadow-lg border border-white/10">
              <Icons.Camera className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base lg:text-lg font-bold tracking-tight text-white leading-none">
              Frame<span className="text-orange-500">Grabber</span>
            </h1>
            <span className="hidden lg:block text-[10px] font-medium text-zinc-500 uppercase tracking-widest mt-0.5">Professional Edition</span>
          </div>
        </div>

        {/* Center: Active Video Status (Desktop only) */}
        <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
          {videoMeta ? (
            <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-full pl-3 pr-4 py-1.5 animate-fade-in max-w-[400px]">
              <div className="flex items-center gap-2 overflow-hidden">
                <Icons.MonitorPlay className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="text-xs font-medium text-zinc-200 truncate max-w-[200px]" title={videoMeta.name}>
                  {videoMeta.name}
                </span>
              </div>
              <div className="w-px h-3 bg-zinc-700 shrink-0"></div>
              <span className="text-[10px] font-mono font-bold text-zinc-500">
                {formatDuration(videoMeta.duration)}
              </span>
              <button 
                onClick={() => setVideoMeta(null)}
                className="ml-2 hover:bg-zinc-800 p-0.5 rounded-full text-zinc-500 hover:text-red-400 transition-colors"
                title="Eject Video"
              >
                <Icons.Close className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-600 bg-zinc-900/30 px-4 py-1.5 rounded-full border border-zinc-800/50 border-dashed">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
              <span className="text-xs font-medium">No Video Loaded</span>
            </div>
          )}
        </div>

        {/* Right: Actions & Stats */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end mr-2">
            <span className="hidden lg:block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Session</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
               <span>{screenshots.length}</span>
               <span className="text-zinc-600 font-normal hidden lg:inline">captured</span>
            </div>
          </div>

          <div className="h-6 lg:h-8 w-px bg-zinc-800 mx-1"></div>

          {screenshots.length > 0 && (
            <button
              onClick={handleClearGallery}
              className="flex items-center gap-2 px-2 lg:px-3 py-1.5 lg:py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-md transition-colors text-xs font-bold"
            >
              <Icons.Trash2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Clear</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full w-full lg:p-4">
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-4 bg-zinc-950 lg:bg-transparent">
            
            {/* Col 1: Video Input (Studio) */}
            {/* Mobile: Show only if studio tab. Desktop: Always show. */}
            <div className={`
                w-full h-full flex flex-col lg:col-span-3 lg:rounded-xl lg:border lg:border-zinc-800 lg:bg-zinc-900/50 lg:shadow-sm overflow-hidden
                ${activeTab === 'studio' ? 'flex' : 'hidden lg:flex'}
            `}>
              <VideoWorkspace />
            </div>

            {/* Col 2: Detail View (Editor) */}
            <div className={`
                w-full h-full flex flex-col lg:col-span-6 lg:rounded-xl lg:border lg:border-zinc-800 lg:bg-zinc-900/50 lg:shadow-sm overflow-hidden relative
                ${activeTab === 'editor' ? 'flex' : 'hidden lg:flex'}
            `}>
               <ScreenshotDetail />
            </div>

            {/* Col 3: Gallery Grid */}
            <div className={`
                w-full h-full flex flex-col lg:col-span-3 lg:rounded-xl lg:border lg:border-zinc-800 lg:bg-zinc-900/50 lg:shadow-sm overflow-hidden
                ${activeTab === 'gallery' ? 'flex' : 'hidden lg:flex'}
            `}>
              <ScreenshotGallery 
                onClear={handleClearGallery} 
                onImageSelect={() => setActiveTab('editor')} 
              />
            </div>
            
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden bg-zinc-950 border-t border-zinc-800 shrink-0 pb-[env(safe-area-inset-bottom)] z-50 relative shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-3 h-14">
          <button 
            onClick={() => setActiveTab('studio')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors active:bg-zinc-900 ${
              activeTab === 'studio' ? 'text-orange-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icons.Camera className="w-5 h-5" />
            <span className="text-[10px] font-bold">Studio</span>
          </button>

          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors active:bg-zinc-900 ${
              activeTab === 'editor' ? 'text-orange-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icons.Crop className="w-5 h-5" />
            <span className="text-[10px] font-bold">Editor</span>
          </button>

          <button 
            onClick={() => setActiveTab('gallery')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors active:bg-zinc-900 ${
              activeTab === 'gallery' ? 'text-orange-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className="relative">
              <Icons.Image className="w-5 h-5" />
              {screenshots.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-zinc-900"></span>
              )}
            </div>
            <span className="text-[10px] font-bold">Gallery</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm p-6 shadow-2xl rounded-xl relative transform scale-100 transition-all">
            <h3 className="text-lg font-bold text-zinc-100 mb-2 text-red-500 flex items-center gap-2">
              <Icons.Trash2 className="w-5 h-5" /> Clear Session?
            </h3>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              This will permanently delete all <span className="text-white font-bold">{screenshots.length}</span> captured screenshots from this session.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold text-sm rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmClearGallery}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;