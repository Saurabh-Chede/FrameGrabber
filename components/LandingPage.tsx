import React, { useState, useEffect } from 'react';
import { Icons } from './icons';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const [starCount, setStarCount] = useState<number | null>(null);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);

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
    <div className="min-h-[100dvh] w-full bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-900 selection:text-orange-100 overflow-x-hidden perspective-1000">
      
      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 h-24 flex items-center justify-between relative z-50 animate-slide-down">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onMouseEnter={() => setIsHoveringLogo(true)}
          onMouseLeave={() => setIsHoveringLogo(false)}
        >
            <div className="relative">
                <div className={`absolute inset-0 bg-orange-500 blur-lg rounded-full transition-opacity duration-500 ${isHoveringLogo ? 'opacity-60' : 'opacity-0'}`}></div>
                <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl border border-white/10 shadow-lg shadow-orange-900/20 group-hover:scale-110 transition-transform duration-300 ease-out">
                    <Icons.Camera className={`w-5 h-5 text-white transition-transform duration-500 ${isHoveringLogo ? 'rotate-12' : 'rotate-0'}`} />
                </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">FrameGrabber</span>
        </div>

        <div className="flex items-center gap-6">
            <a 
                href="https://github.com/Saurabh-Chede/FrameGrabber"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer group/github"
            >
                <Icons.Github className="w-4 h-4 group-hover/github:scale-110 group-hover/github:rotate-12 transition-all duration-300" />
                <span>Star on GitHub</span>
                <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md text-xs font-mono min-w-[2rem] text-center ml-1 group-hover/github:border-zinc-700 transition-colors">
                    {starCount !== null ? starCount : '...'}
                </span>
            </a>
            <button 
                onClick={onLaunch}
                className="bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-bold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-xl shadow-white/5 group overflow-hidden relative"
            >
                <span className="relative z-10">Launch Editor</span>
                <Icons.ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite] z-0"></div>
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-32 pt-10 sm:pt-0 text-center relative w-full max-w-[100vw] overflow-hidden">
        
        {/* Background Gradients - Animated */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[1000px] sm:h-[1000px] bg-orange-600/10 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none contrast-150 brightness-100"></div>
        
        {/* Floating Elements (Subtle) */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-500/20 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-red-500/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>

        {/* Badge */}
        <div className="mb-8 sm:mb-12 relative z-10 opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/80 rounded-full pl-1.5 pr-4 py-1.5 hover:border-orange-500/30 hover:bg-zinc-900/80 transition-all duration-300 cursor-default backdrop-blur-md shadow-lg shadow-black/20 group hover:scale-105 hover:-translate-y-0.5">
                <div className="bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full px-2.5 py-0.5 border border-white/5">
                    <span className="text-[10px] font-bold text-zinc-100 uppercase tracking-wide">v1.0</span>
                </div>
                <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium flex items-center gap-1">
                    Privacy-first video tools
                    <Icons.ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-orange-500 transition-colors group-hover:translate-x-0.5" />
                </span>
            </div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-white mb-8 sm:mb-12 relative z-10 max-w-6xl mx-auto leading-[0.95] sm:leading-[0.9] drop-shadow-2xl opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Extract perfect frames <br className="hidden md:block" />
          <span className="text-zinc-500 font-medium italic tracking-tight">with</span> <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600 relative inline-block pb-2 hover:from-orange-300 hover:to-orange-500 transition-all duration-500 cursor-default">
             FrameGrabber
             <svg className="absolute w-full h-3 bottom-0 left-0 text-orange-500 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.7509 9.36111 55.9359 9.39438 80.0002 7.99998C104.064 6.60558 132.5 4.50001 155.5 3.00002C168.333 2.16668 196 1.00002 198 1.00002" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 sm:mb-16 leading-relaxed relative z-10 px-4 font-light tracking-wide opacity-0 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          A professional in-browser tool to extract 4K screenshots from your videos. 
          Frame-by-frame control, instant cropping, and zero server uploads.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 w-full sm:w-auto px-4 opacity-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <button 
                onClick={onLaunch}
                className="group h-14 sm:h-16 w-full sm:w-auto px-10 rounded-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_50px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_0_60px_-5px_rgba(249,115,22,0.6)] ring-4 ring-orange-500/20 hover:ring-orange-500/40"
            >
                Start Creating
                <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="group h-14 sm:h-16 w-full sm:w-auto px-10 rounded-full bg-zinc-900/30 border border-zinc-700/50 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-lg transition-all duration-300 hover:border-zinc-500 flex items-center justify-center backdrop-blur-sm hover:scale-105 active:scale-95">
                <Icons.Play className="w-4 h-4 mr-2 fill-current opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all duration-300" />
                View Demo
            </button>
        </div>

        {/* Footer-ish info */}
        <div className="absolute bottom-8 left-0 w-full text-center z-10 hidden sm:block opacity-0 animate-fade-in" style={{ animationDelay: '1s' }}>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest hover:text-zinc-400 transition-colors cursor-default">
                PRESS <span className="border border-zinc-700 px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 shadow-sm">SPACE</span> TO PLAY/PAUSE &bull; <span className="border border-zinc-700 px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 shadow-sm">S</span> TO SNAPSHOT
            </p>
        </div>

      </main>
    </div>
  );
};
