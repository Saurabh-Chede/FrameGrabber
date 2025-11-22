import React from 'react';
import { Icons } from './icons';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  return (
    <div className="min-h-[100dvh] w-full bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-900 selection:text-orange-100">
      
      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="relative group">
                <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg border border-white/10">
                    <Icons.Camera className="w-5 h-5 text-white" />
                </div>
            </div>
            <span className="text-lg font-bold tracking-tight">FrameGrabber</span>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                <Icons.Github className="w-4 h-4" />
                <span>Star on GitHub</span>
                <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded ml-1">276</span>
            </div>
            <button 
                onClick={onLaunch}
                className="bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all flex items-center gap-2 group"
            >
                Editor
                <Icons.ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center relative overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Badge */}
        <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-full pl-1 pr-3 py-1 hover:border-orange-500/30 transition-colors cursor-default">
                <div className="bg-zinc-800 rounded-full px-2 py-0.5">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wide">Privacy First</span>
                </div>
                <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                    Runs 100% in browser
                    <Icons.ChevronRight className="w-3 h-3" />
                </span>
            </div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-8 relative z-10 max-w-5xl mx-auto leading-[0.9]">
          Extract perfect frames <br className="hidden md:block" />
          <span className="text-zinc-500 font-medium italic">with</span> <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600 relative">
             FrameGrabber
             <svg className="absolute w-full h-3 -bottom-1 left-0 text-orange-500 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.7509 9.36111 55.9359 9.39438 80.0002 7.99998C104.064 6.60558 132.5 4.50001 155.5 3.00002C168.333 2.16668 196 1.00002 198 1.00002" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed relative z-10">
          A professional in-browser tool to extract 4K screenshots from your videos. 
          Frame-by-frame control, instant cropping, and zero server uploads. 
          Built for creators and developers.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            <button 
                onClick={onLaunch}
                className="h-14 px-8 rounded-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(249,115,22,0.4)]"
            >
                Try Now It's Free
                <Icons.ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="h-14 px-8 rounded-full bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-lg transition-all hover:border-zinc-700">
                View Demo
            </button>
        </div>

        {/* Social Proof / Feature Strip */}
        <div className="mt-20 pt-10 border-t border-white/5 w-full max-w-4xl flex flex-wrap justify-center gap-x-12 gap-y-6 text-zinc-600 grayscale opacity-70">
            <div className="flex items-center gap-2">
                <Icons.Check className="w-5 h-5" />
                <span className="font-bold tracking-tight">No Uploads</span>
            </div>
            <div className="flex items-center gap-2">
                <Icons.Check className="w-5 h-5" />
                <span className="font-bold tracking-tight">4K Support</span>
            </div>
            <div className="flex items-center gap-2">
                <Icons.Check className="w-5 h-5" />
                <span className="font-bold tracking-tight">Frame Exact</span>
            </div>
            <div className="flex items-center gap-2">
                <Icons.Check className="w-5 h-5" />
                <span className="font-bold tracking-tight">Local Processing</span>
            </div>
        </div>

      </main>
    </div>
  );
};