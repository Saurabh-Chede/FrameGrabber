import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Icons } from './icons';
import { useAppStore } from '../store/useAppStore';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const VideoWorkspace: React.FC = () => {
  const videoMeta = useAppStore((state) => state.videoMeta);
  const setVideoMeta = useAppStore((state) => state.setVideoMeta);
  const addScreenshot = useAppStore((state) => state.addScreenshot);
  const screenshots = useAppStore((state) => state.screenshots);

  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  // Local state for UI controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // URL Input State
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  
  // Auto capture state
  const [isAutoCapturing, setIsAutoCapturing] = useState(false);
  const [captureIntervalMs, setCaptureIntervalMs] = useState(2000);
  const lastCaptureTimeRef = useRef<number>(0);

  // Helper Panel State
  const [activeHelperTab, setActiveHelperTab] = useState<'shortcuts' | 'recent'>('shortcuts');

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YouTube Player when meta changes
  useEffect(() => {
    if (videoMeta?.type === 'youtube' && videoMeta.youtubeId) {
      const initPlayer = () => {
        if (window.YT && window.YT.Player) {
          youtubePlayerRef.current = new window.YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            videoId: videoMeta.youtubeId,
            playerVars: {
              'playsinline': 1,
              'controls': 0, // Custom controls
              'modestbranding': 1,
              'rel': 0
            },
            events: {
              'onReady': (event: any) => {
                 const dur = event.target.getDuration();
                 setVideoMeta({
                   ...videoMeta,
                   duration: dur,
                   width: 1280, // Default HD, user can verify
                   height: 720
                 });
              },
              'onStateChange': (event: any) => {
                 // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
                 if (event.data === 1) setIsPlaying(true);
                 if (event.data === 2 || event.data === 0) setIsPlaying(false);
                 if (event.data === 0) handleEnded();
              }
            }
          });
        } else {
          setTimeout(initPlayer, 100);
        }
      };
      initPlayer();
    } else {
      if (youtubePlayerRef.current) {
        try { youtubePlayerRef.current.destroy(); } catch(e) {}
        youtubePlayerRef.current = null;
      }
    }
  }, [videoMeta?.url, videoMeta?.type]);

  // Poll for YouTube time updates
  useEffect(() => {
    let interval: any;
    if (videoMeta?.type === 'youtube' && isPlaying) {
       interval = setInterval(() => {
          if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
             const time = youtubePlayerRef.current.getCurrentTime();
             if (Math.abs(time - currentTime) > 0.1) {
               setCurrentTime(time);
               updateScrubber(time, videoMeta.duration);
             }
          }
       }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, videoMeta, currentTime]);

  const updateScrubber = (time: number, duration: number) => {
      if (duration <= 0) return;
      const percent = (time / duration) * 100;
      if (progressBarRef.current) progressBarRef.current.style.width = `${percent}%`;
      if (scrubberRef.current) scrubberRef.current.style.left = `${percent}%`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.onloadedmetadata = () => {
        setVideoMeta({
          name: file.name,
          duration: tempVideo.duration,
          url: url,
          width: tempVideo.videoWidth,
          height: tempVideo.videoHeight,
          crossOrigin: undefined,
          type: 'native'
        });
        tempVideo.remove();
      };
      tempVideo.src = url;

      resetPlayerState();
    }
    if (event.target) event.target.value = '';
  };

  const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleUrlLoad = async () => {
    if (!urlInput.trim()) return;
    setIsLoadingUrl(true);

    // 1. Check for YouTube
    const ytId = getYouTubeID(urlInput);
    if (ytId) {
       setVideoMeta({
         name: `YouTube Video (${ytId})`,
         duration: 0, // Updated onReady
         url: urlInput,
         width: 1920, // Default assumption
         height: 1080,
         type: 'youtube',
         youtubeId: ytId
       });
       resetPlayerState();
       setUrlInput('');
       setIsLoadingUrl(false);
       return;
    }

    // 2. Standard Video Load
    let videoName = "Remote Video";
    try {
        const pathname = new URL(urlInput).pathname;
        const name = pathname.split('/').pop();
        if (name) videoName = name;
    } catch (e) { /* ignore */ }
    
    const loadAttempt = (url: string, cors?: "anonymous"): Promise<HTMLVideoElement> => {
        return new Promise((resolve, reject) => {
            const v = document.createElement('video');
            if (cors) v.crossOrigin = cors;
            v.preload = 'metadata';
            v.src = url;
            const onLoaded = () => { cleanup(); resolve(v); };
            const onError = () => { cleanup(); reject(new Error(`Failed cors=${cors}`)); };
            const cleanup = () => { v.removeEventListener('loadedmetadata', onLoaded); v.removeEventListener('error', onError); };
            v.addEventListener('loadedmetadata', onLoaded);
            v.addEventListener('error', onError);
        });
    };

    try {
      const vid = await loadAttempt(urlInput, "anonymous");
      setVideoMeta({
        name: videoName,
        duration: vid.duration,
        url: urlInput,
        width: vid.videoWidth,
        height: vid.videoHeight,
        crossOrigin: "anonymous",
        type: 'native'
      });
      vid.remove();
      resetPlayerState();
      setUrlInput('');
    } catch (error) {
      console.warn("CORS load failed, attempting fallback...", error);
      try {
          const vidFallback = await loadAttempt(urlInput, undefined);
          setVideoMeta({
            name: videoName,
            duration: vidFallback.duration,
            url: urlInput,
            width: vidFallback.videoWidth,
            height: vidFallback.videoHeight,
            crossOrigin: undefined,
            type: 'native'
          });
          vidFallback.remove();
          resetPlayerState();
          setUrlInput('');
      } catch (fallbackError) {
          alert("Failed to load video. Check URL or CORS permissions.");
      }
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const resetPlayerState = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setIsAutoCapturing(false);
      setPlaybackRate(1);
  };

  const captureYouTubeFrame = async () => {
    try {
        // Ask user to select the current tab to capture the iframe content
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: 'browser' },
            audio: false,
            // @ts-ignore - Experimental features
            preferCurrentTab: true,
            selfBrowserSurface: 'include'
        });

        const videoTrack = stream.getVideoTracks()[0];
        const captureVideo = document.createElement('video');
        captureVideo.srcObject = stream;
        captureVideo.muted = true;
        captureVideo.play(); // Start playing stream to get data

        // Wait for stream to provide a frame
        await new Promise<void>(resolve => {
            if (captureVideo.readyState >= 2) resolve();
            else captureVideo.oncanplay = () => resolve();
        });
        // Tiny delay to ensure frame is rendered
        await new Promise(r => setTimeout(r, 200));

        // --- CROPPING LOGIC TO GET ONLY THE PLAYER ---
        const playerElement = document.getElementById('youtube-player');
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (playerElement && ctx) {
            const rect = playerElement.getBoundingClientRect();
            
            // Calculate scale based on stream width vs window width (handles DPI scaling)
            const streamWidth = captureVideo.videoWidth;
            const windowWidth = window.innerWidth;
            
            // If user shares "This Tab", stream usually matches viewport (scaled by DPR)
            const scale = streamWidth / windowWidth;
            
            // Calculate crop coordinates
            const cropX = Math.max(0, rect.left * scale);
            const cropY = Math.max(0, rect.top * scale);
            const cropW = Math.min(streamWidth - cropX, rect.width * scale);
            const cropH = Math.min(captureVideo.videoHeight - cropY, rect.height * scale);

            // Set canvas to the specific crop size
            canvas.width = cropW;
            canvas.height = cropH;

            // Draw only the player portion
            ctx.drawImage(
                captureVideo, 
                cropX, cropY, cropW, cropH, // Source Crop
                0, 0, canvas.width, canvas.height // Destination
            );

            canvas.toBlob((blob) => {
               if (blob) {
                  addScreenshot(blob, currentTime, canvas.width, canvas.height);
               }
            }, 'image/png');
        } else {
            // Fallback if element not found (rare)
             canvas.width = captureVideo.videoWidth;
             canvas.height = captureVideo.videoHeight;
             ctx?.drawImage(captureVideo, 0, 0);
             canvas.toBlob((blob) => {
                if (blob) addScreenshot(blob, currentTime, canvas.width, canvas.height);
             }, 'image/png');
        }

        // Cleanup
        videoTrack.stop();
        captureVideo.remove();
        canvas.remove();

    } catch (e) {
        console.error("Screen capture cancelled or failed", e);
    }
  };

  const captureFrame = useCallback(() => {
    if (videoMeta?.type === 'youtube') {
        captureYouTubeFrame();
        return;
    }

    // Native Capture
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    const sWidth = video.videoWidth;
    const sHeight = video.videoHeight;

    canvas.width = sWidth;
    canvas.height = sHeight;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) {
      try {
        ctx.drawImage(video, 0, 0, sWidth, sHeight);
        canvas.toBlob((blob) => {
          if (blob) addScreenshot(blob, video.currentTime, sWidth, sHeight);
        }, 'image/png');
      } catch (e) {
        alert("Cannot capture: Video CORS policy blocked the screenshot.");
      }
    }
  }, [addScreenshot, videoMeta, currentTime]);

  const togglePlay = useCallback(() => {
    if (videoMeta?.type === 'youtube' && youtubePlayerRef.current) {
        if (isPlaying) youtubePlayerRef.current.pauseVideo();
        else youtubePlayerRef.current.playVideo();
        // State updates via event listener, but toggle immediately for UI responsiveness
        setIsPlaying(!isPlaying);
    } else if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, videoMeta]);

  const skip = useCallback((seconds: number) => {
    if (videoMeta?.type === 'youtube' && youtubePlayerRef.current) {
        const newTime = youtubePlayerRef.current.getCurrentTime() + seconds;
        youtubePlayerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    } else if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  }, [videoMeta]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!videoMeta) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-5);
          break;
        case 'arrowright':
          e.preventDefault();
          skip(5);
          break;
        case 's':
          e.preventDefault();
          captureFrame();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoMeta, togglePlay, skip, captureFrame]);

  // Native Video Loop
  useEffect(() => {
    if (videoMeta?.type === 'youtube') return; // Handled by polling
    const video = videoRef.current;
    if (!video) return;
    let frameId: number;

    const loop = () => {
      if (!video) return;
      const now = video.currentTime;
      const duration = video.duration || 1;
      updateScrubber(now, duration);

      if (Math.abs(now - currentTime) > 0.5 || now === 0 || now === duration) {
         setCurrentTime(now);
      }

      if (isAutoCapturing && !video.paused && !video.ended) {
         const timeSinceLastCapture = Date.now() - lastCaptureTimeRef.current;
         if (timeSinceLastCapture >= captureIntervalMs) {
            captureFrame();
            lastCaptureTimeRef.current = Date.now();
         }
      }

      if ('requestVideoFrameCallback' in video) {
        // @ts-ignore
        video.requestVideoFrameCallback(loop);
      } else {
        frameId = requestAnimationFrame(loop);
      }
    };

    if ('requestVideoFrameCallback' in video) {
       // @ts-ignore
       video.requestVideoFrameCallback(loop);
    } else {
       frameId = requestAnimationFrame(loop);
    }
    return () => { if (frameId) cancelAnimationFrame(frameId); };
  }, [videoMeta, isAutoCapturing, captureIntervalMs, currentTime, captureFrame]); 

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoMeta) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * videoMeta.duration;
    
    if (videoMeta.type === 'youtube' && youtubePlayerRef.current) {
        youtubePlayerRef.current.seekTo(newTime, true);
    } else if (videoRef.current) {
        videoRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
    updateScrubber(newTime, videoMeta.duration);
  };

  const togglePlaybackRate = () => {
    const rates = [0.5, 1, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (videoMeta?.type === 'youtube' && youtubePlayerRef.current) {
        youtubePlayerRef.current.setPlaybackRate(nextRate);
    } else if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (isAutoCapturing) setIsAutoCapturing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const intervals = [
    { label: '0.5s', value: 500 },
    { label: '1s', value: 1000 },
    { label: '2s', value: 2000 },
    { label: '5s', value: 5000 },
  ];
  
  return (
    <div className="flex flex-col w-full h-full bg-transparent overflow-hidden">
      {/* Video Player Area - Flexible when no video */}
      <div className={`relative bg-black w-full ${videoMeta ? 'aspect-video lg:shrink-0' : 'flex-1'} flex items-center justify-center group overflow-hidden border-b border-zinc-800`}>
        {!videoMeta ? (
          <div className="text-center p-8 z-10 animate-fade-in flex flex-col items-center max-w-md w-full">
            {/* File Upload Section */}
            <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-16 h-16 bg-zinc-900 hover:bg-zinc-800 rounded-full flex items-center justify-center mb-4 border border-zinc-800 hover:border-orange-500/50 shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group-hover:scale-105 active:scale-95 cursor-pointer group/btn"
               title="Select Video File"
            >
              <Icons.Upload className="w-6 h-6 text-zinc-500 group-hover/btn:text-orange-500 transition-colors" />
            </button>
            <h3 className="text-lg font-bold text-zinc-100 mb-1">Upload Video</h3>
            <p className="text-zinc-500 text-xs lg:text-sm mb-6">MP4, WebM, or Ogg supported</p>

            <div className="flex items-center w-full gap-3 mb-6 opacity-50">
                <div className="h-px bg-zinc-800 flex-1"></div>
                <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider">OR</span>
                <div className="h-px bg-zinc-800 flex-1"></div>
            </div>

            {/* URL Input Section */}
            <div className="flex w-full gap-2">
                <div className="flex-1 bg-zinc-900 rounded-lg border border-zinc-800 focus-within:border-orange-500/50 transition-colors flex items-center px-3">
                    <Icons.Link className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
                    <input 
                        type="text" 
                        placeholder="Paste video or YouTube URL..." 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUrlLoad()}
                        className="bg-transparent w-full h-10 text-xs sm:text-sm text-white focus:outline-none placeholder:text-zinc-600"
                    />
                </div>
                <button 
                    onClick={handleUrlLoad}
                    disabled={!urlInput || isLoadingUrl}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 rounded-lg font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[4rem]"
                >
                    {isLoadingUrl ? <Icons.Loader className="w-4 h-4 animate-spin text-orange-500" /> : 'Load'}
                </button>
            </div>
          </div>
        ) : (
          <>
            {videoMeta.type === 'youtube' ? (
                <div id="youtube-player" className="w-full h-full pointer-events-none" style={{ pointerEvents: 'none' }}></div>
            ) : (
                <video
                  ref={videoRef}
                  src={videoMeta.url}
                  crossOrigin={videoMeta.crossOrigin}
                  className="w-full h-full object-contain"
                  onEnded={handleEnded}
                  onClick={togglePlay}
                  playsInline
                  muted={false}
                />
            )}
            
            {/* Overlay Click to Play/Pause for YouTube since we disabled controls */}
            <div 
                className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center" 
                onClick={togglePlay}
            >
                {!isPlaying && (
                  <div className="w-20 h-20 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/10 shadow-2xl scale-100 transition-transform hover:scale-110">
                      <Icons.Play className="w-8 h-8 ml-1 fill-current" />
                  </div>
                )}
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/*" className="hidden" />
      </div>

      {/* Controls & Tools */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {videoMeta && (
          <>
            <div className="h-1.5 bg-zinc-800 cursor-pointer group/scrubber relative w-full overflow-hidden shrink-0" onClick={handleSeek}>
              <div ref={progressBarRef} className="absolute top-0 bottom-0 left-0 bg-orange-600 transition-none" style={{ width: '0%' }} />
              <div ref={scrubberRef} className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white rounded-full opacity-0 group-hover/scrubber:opacity-100 shadow transition-opacity pointer-events-none will-change-transform" style={{ left: '0%' }} />
            </div>

            <div className="px-3 py-2 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/30 shrink-0">
               <div className="flex items-center gap-1">
                  <button onClick={togglePlay} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-200 hover:text-white transition-colors">
                     {isPlaying ? <Icons.Pause className="w-4 h-4 fill-current" /> : <Icons.Play className="w-4 h-4 fill-current" />}
                  </button>
                  <button onClick={() => skip(-5)} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors">
                     <Icons.SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => skip(5)} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors">
                     <Icons.SkipForward className="w-3.5 h-3.5" />
                  </button>
               </div>
               
               <div className="flex items-center gap-2">
                 <div className="text-[10px] font-mono font-bold text-zinc-500">
                    <span className="text-zinc-200">{formatTime(currentTime)}</span> / {formatTime(videoMeta.duration)}
                 </div>
                 <button onClick={togglePlaybackRate} className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] font-bold text-zinc-300 min-w-[2.5rem] transition-colors">
                   {playbackRate}x
                 </button>
                 <div className="w-px h-3 bg-zinc-800 mx-1"></div>
                 <button onClick={() => setVideoMeta(null)} className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-red-500 rounded transition-colors" title="Close Video">
                    <Icons.Close className="w-3.5 h-3.5" />
                 </button>
               </div>
            </div>
          </>
        )}

        {videoMeta && (
        <div className="p-4 space-y-4 shrink-0">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={captureFrame}
                className="col-span-2 h-11 bg-zinc-100 hover:bg-white text-black font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] rounded-lg shadow-sm group"
              >
                <Icons.Camera className="w-4 h-4" />
                {videoMeta.type === 'youtube' ? 'Capture from Screen' : 'Take Snapshot'} 
                <span className="hidden xl:inline text-zinc-400 font-normal text-[10px] border border-zinc-300 px-1 rounded ml-1 group-hover:border-zinc-400">S</span>
              </button>

              {/* Auto Capture only available for native video for now */}
              {videoMeta.type === 'native' && (
              <div className={`col-span-2 p-2.5 rounded-lg border transition-all flex items-center gap-2 ${
                isAutoCapturing ? 'bg-orange-900/10 border-orange-500/30' : 'bg-zinc-950/50 border-zinc-800'
              }`}>
                 <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">
                   <Icons.Timer className={`w-4 h-4 ${isAutoCapturing ? 'text-orange-500' : 'text-zinc-500'}`} />
                 </div>
                 <div className="flex-1">
                   <select 
                     disabled={isAutoCapturing}
                     value={captureIntervalMs}
                     onChange={(e) => setCaptureIntervalMs(Number(e.target.value))}
                     className="w-full bg-transparent text-xs font-bold text-zinc-300 focus:outline-none cursor-pointer"
                   >
                     {intervals.map(int => (
                       <option key={int.value} value={int.value}>Every {int.label}</option>
                     ))}
                   </select>
                 </div>
                 <button
                    onClick={() => setIsAutoCapturing(!isAutoCapturing)}
                    className={`h-8 px-3 font-bold text-[10px] uppercase tracking-wider rounded transition-all ${
                      isAutoCapturing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                 >
                    {isAutoCapturing ? 'Stop' : 'Auto'}
                 </button>
              </div>
              )}
              
              {videoMeta.type === 'youtube' && (
                  <p className="col-span-2 text-[10px] text-zinc-500 text-center">
                      YouTube mode requires selecting "This Tab" in the screen share dialog.
                  </p>
              )}
            </div>
        </div>
        )}

        {/* Studio Extras Panel - Fills Empty Space */}
        <div className="flex-1 flex flex-col border-t border-zinc-800/50 bg-zinc-900/20 min-h-[200px]">
           <div className="flex items-center border-b border-zinc-800/50 px-2">
              <button 
                onClick={() => setActiveHelperTab('shortcuts')}
                className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                   activeHelperTab === 'shortcuts' ? 'border-orange-500 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                 Shortcuts
              </button>
              <button 
                onClick={() => setActiveHelperTab('recent')}
                className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                   activeHelperTab === 'recent' ? 'border-orange-500 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                 Recent ({screenshots.length})
              </button>
           </div>

           <div className="flex-1 p-4 overflow-y-auto">
              {activeHelperTab === 'shortcuts' ? (
                 <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] text-zinc-500 font-bold">Play / Pause</span>
                       <div className="flex gap-1">
                          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-mono text-zinc-300 border border-zinc-700">Space</kbd>
                          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-mono text-zinc-300 border border-zinc-700">K</kbd>
                       </div>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] text-zinc-500 font-bold">Snapshot</span>
                       <div>
                          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-mono text-zinc-300 border border-zinc-700">S</kbd>
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="space-y-2">
                    {screenshots.length === 0 ? (
                       <div className="text-center py-4">
                          <Icons.Camera className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                          <p className="text-[10px] text-zinc-600">No captures yet</p>
                       </div>
                    ) : (
                       screenshots.slice(0, 5).map(s => (
                          <div key={s.id} className="flex items-center gap-2 p-2 bg-zinc-900/50 rounded border border-zinc-800/50">
                             <div className="w-8 h-5 bg-black rounded overflow-hidden shrink-0">
                                <img src={s.url} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-mono text-zinc-300">{s.timestamp.toFixed(2)}s</div>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};