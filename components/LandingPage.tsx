import React, { useState, useEffect } from 'react';
import { Icons } from './icons';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const [starCount, setStarCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/Saurabh-Chede/FrameGrabber')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.stargazers_count === 'number') {
          setStarCount(data.stargazers_count);
        }
      })
      .catch((err) => console.error('Failed to fetch GitHub stars:', err));
  }, []);

  return (
    <div className="h-[100dvh] w-full bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-900 selection:text-orange-100 overflow-x-hidden overflow-y-auto">
      
      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between relative z-50 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative group cursor-pointer" onClick={onLaunch}>
                <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-1.5 sm:p-2 rounded-lg border border-white/10">
                    <Icons.Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight">FrameGrabber</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
            <a 
                href="https://github.com/Saurabh-Chede/FrameGrabber"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
                <Icons.Github className="w-4 h-4" />
                <span>Star on GitHub</span>
                <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded ml-1 min-w-[2rem] text-center">
                    {starCount !== null ? starCount : '...'}
                </span>
            </a>
            <button 
                onClick={onLaunch}
                className="bg-orange-500 hover:bg-orange-600 text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider px-4 py-2 sm:px-5 sm:py-2.5 rounded-full transition-all flex items-center gap-2 group"
            >
                Editor
                <Icons.ArrowRight className="w-3 h-3 sm:w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-32 pb-24 sm:pt-40 sm:pb-32 lg:pt-48 lg:pb-40 text-center relative w-full max-w-[100vw]">
        
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] bg-orange-600/10 blur-[60px] sm:blur-[100px] lg:blur-[120px] rounded-full pointer-events-none"></div>

        {/* Badge */}
        <div className="mb-8 sm:mb-10 animate-fade-in relative z-10">
            <div className="inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-full pl-1 pr-3 py-1 hover:border-orange-500/30 transition-colors cursor-default backdrop-blur-sm">
                <div className="bg-zinc-800 rounded-full px-2 py-0.5">
                    <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wide">Privacy First</span>
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-400 font-medium flex items-center gap-1">
                    Runs 100% in browser
                    <Icons.ChevronRight className="w-3 h-3" />
                </span>
            </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-8 sm:mb-10 relative z-10 max-w-5xl mx-auto leading-[0.95] sm:leading-[0.9]">
          Extract perfect frames <br className="hidden sm:block" />
          <span className="text-zinc-500 font-medium italic">with</span> <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600 relative inline-block">
             FrameGrabber
             <svg className="absolute w-full h-2 sm:h-3 -bottom-1 left-0 text-orange-500 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.7509 9.36111 55.9359 9.39438 80.0002 7.99998C104.064 6.60558 132.5 4.50001 155.5 3.00002C168.333 2.16668 196 1.00002 198 1.00002" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 sm:mb-14 leading-relaxed relative z-10 px-2">
          A professional in-browser tool to extract 4K screenshots from your videos. 
          Frame-by-frame control, instant cropping, and zero server uploads. 
          Built for creators and developers.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 relative z-10 w-full sm:w-auto">
            <button 
                onClick={onLaunch}
                className="h-12 sm:h-14 w-full sm:w-auto px-8 rounded-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-base sm:text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(249,115,22,0.4)]"
            >
                Try Now It's Free
                <Icons.ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button className="h-12 sm:h-14 w-full sm:w-auto px-8 rounded-full bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-base sm:text-lg transition-all hover:border-zinc-700 flex items-center justify-center">
                View Demo
            </button>
        </div>

        <div className="mt-20 opacity-40 hover:opacity-100 transition-opacity duration-500 relative z-10">
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest">
                PRESS <span className="border border-zinc-700 px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300">SPACE</span> TO PLAY &bull; <span className="border border-zinc-700 px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300">S</span> TO SNAPSHOT
            </p>
        </div>
      </main>

      <footer className="border-t border-zinc-900 bg-zinc-950 py-16 relative z-20 shrink-0">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            
            <div className="flex flex-col gap-4 w-full md:w-auto">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20 rounded-full"></div>
                        <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-1.5 rounded-lg border border-white/10">
                            <Icons.Camera className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-zinc-100">FrameGrabber</span>
                </div>
                <p className="text-zinc-500 text-sm max-w-xs">
                    The privacy-first video screenshot tool for content creators, developers, and designers.
                </p>
                <div className="text-zinc-600 text-xs mt-4">
                    © {new Date().getFullYear()} FrameGrabber. MIT License.
                </div>
            </div>

            <div className="flex gap-12 w-full md:w-auto justify-start md:justify-end">
                <div className="flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Product</h4>
                    <a href="#" onClick={(e) => { e.preventDefault(); onLaunch(); }} className="text-zinc-400 hover:text-orange-500 text-sm transition-colors">Launch Editor</a>
                    <a href="https://github.com/Saurabh-Chede/FrameGrabber" target="_blank" className="text-zinc-400 hover:text-orange-500 text-sm transition-colors">Source Code</a>
                    <span className="text-zinc-600 text-sm cursor-not-allowed">Changelog</span>
                </div>
                <div className="flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Connect</h4>
                    <a href="https://github.com/Saurabh-Chede/FrameGrabber" target="_blank" className="text-zinc-400 hover:text-orange-500 text-sm transition-colors flex items-center gap-2">
                        <Icons.Github className="w-4 h-4" /> GitHub
                    </a>
                    <a href="https://twitter.com" target="_blank" className="text-zinc-400 hover:text-orange-500 text-sm transition-colors flex items-center gap-2">
                        <Icons.Twitter className="w-4 h-4" /> Twitter
                    </a>
                </div>
            </div>

         </div>
      </footer>
    </div>
  );
}