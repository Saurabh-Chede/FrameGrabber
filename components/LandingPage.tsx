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
    <div className="min-h-[100dvh] w-full bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-900 selection:text-orange-100 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-24 flex items-center justify-between relative z-50 shrink-0">
        <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={onLaunch}>
                <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-1.5 sm:p-2 rounded-xl border border-white/10 shadow-lg shadow-orange-900/20">
                    <Icons.Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-100">FrameGrabber</span>
        </div>

        <div className="flex items-center gap-6">
            <a 
                href="https://github.com/Saurabh-Chede/FrameGrabber"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer group"
            >
                <Icons.Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Star on GitHub</span>
                <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md text-xs font-mono min-w-[2rem] text-center ml-1">
                    {starCount !== null ? starCount : '...'}
                </span>
            </a>
            <button 
                onClick={onLaunch}
                className="bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-bold px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-xl shadow-white/5"
            >
                Launch Editor
                <Icons.ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </nav>

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-4 sm:px-6 flex flex-col items-center text-center overflow-hidden min-h-[calc(100vh-6rem)] justify-center">
             {/* Background Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[900px] md:h-[900px] bg-orange-600/10 blur-[60px] sm:blur-[80px] md:blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none contrast-150 brightness-100"></div>

            {/* Badge */}
            <div className="mb-10 animate-fade-in relative z-10">
                <div className="inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/80 rounded-full pl-1.5 pr-4 py-1.5 hover:border-orange-500/30 hover:bg-zinc-900/80 transition-all cursor-default backdrop-blur-md shadow-lg shadow-black/20 group">
                    <div className="bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full px-2.5 py-0.5 border border-white/5">
                        <span className="text-[10px] font-bold text-zinc-100 uppercase tracking-wide">v1.0</span>
                    </div>
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium flex items-center gap-1">
                        Privacy-first video tools
                        <Icons.ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-orange-500 transition-colors" />
                    </span>
                </div>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-10 relative z-10 max-w-6xl mx-auto leading-[0.95] sm:leading-[0.9] md:leading-[0.85] drop-shadow-2xl">
                Extract perfect frames <br className="hidden sm:block" />
                <span className="text-zinc-500 font-medium italic tracking-tight">with</span> <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600 relative inline-block pb-2">
                FrameGrabber
                <svg className="absolute w-full h-2 sm:h-3 bottom-0 left-0 text-orange-500 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.7509 9.36111 55.9359 9.39438 80.0002 7.99998C104.064 6.60558 132.5 4.50001 155.5 3.00002C168.333 2.16668 196 1.00002 198 1.00002" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed relative z-10 font-light tracking-wide px-2">
                A professional in-browser tool to extract 4K screenshots from your videos. 
                Frame-by-frame control, instant cropping, and zero server uploads.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 relative z-10 w-full sm:w-auto">
                <button 
                    onClick={onLaunch}
                    className="h-14 sm:h-16 w-full sm:w-auto px-10 rounded-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_50px_-10px_rgba(249,115,22,0.5)] ring-4 ring-orange-500/20"
                >
                    Start Creating
                    <Icons.ArrowRight className="w-5 h-5" />
                </button>
                
                <button className="h-14 sm:h-16 w-full sm:w-auto px-10 rounded-full bg-zinc-900/30 border border-zinc-700/50 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-lg transition-all hover:border-zinc-500 flex items-center justify-center backdrop-blur-sm">
                    View Demo
                </button>
            </div>
            
             {/* Footer-ish info */}
            <div className="mt-16 opacity-40 hover:opacity-100 transition-opacity duration-500 relative z-10">
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest">
                    PRESS <span className="border border-zinc-700 px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300">SPACE</span> TO PLAY &bull; <span className="border border-zinc-700 px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300">S</span> TO SNAPSHOT
                </p>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-24 md:py-32 relative z-10 bg-zinc-950/50 border-t border-zinc-900">
             <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for Creators</h2>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">Everything you need to grab the perfect still from your footage, designed for speed and privacy.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="group p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 hover:border-orange-500/30 hover:bg-zinc-900/50 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                           <Icons.Camera className="w-24 h-24 text-orange-500 rotate-12 transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:border-orange-500/50 group-hover:shadow-lg group-hover:shadow-orange-900/20">
                            <Icons.MonitorPlay className="w-6 h-6 text-orange-500" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-3">Frame-by-Frame</h3>
                        <p className="text-zinc-400 leading-relaxed">
                            Navigate your video with extreme precision. Scrub through footage millisecond by millisecond to find the exact moment you need.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="group p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 hover:border-orange-500/30 hover:bg-zinc-900/50 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                           <Icons.Check className="w-24 h-24 text-orange-500 rotate-12 transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:border-orange-500/50 group-hover:shadow-lg group-hover:shadow-orange-900/20">
                             {/* Using a generic icon here since Lock might not be exported, assuming Check or similar availability */}
                             <div className="text-orange-500 font-bold text-lg">
                                <Icons.Check className="w-6 h-6" />
                             </div>
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-3">100% Private</h3>
                        <p className="text-zinc-400 leading-relaxed">
                            Your videos never leave your browser. All processing happens locally on your device using the WebCodecs API. Secure by design.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="group p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 hover:border-orange-500/30 hover:bg-zinc-900/50 transition-all duration-300 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                           <Icons.Crop className="w-24 h-24 text-orange-500 rotate-12 transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:border-orange-500/50 group-hover:shadow-lg group-hover:shadow-orange-900/20">
                            <Icons.Crop className="w-6 h-6 text-orange-500" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-3">Instant Crop</h3>
                        <p className="text-zinc-400 leading-relaxed">
                            Crop screenshots instantly to common aspect ratios (16:9, 9:16, 1:1) or freehand. Export in full 4K resolution without quality loss.
                        </p>
                    </div>
                </div>
             </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-16 relative z-20">
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
                    <a href="https://twitter.com" target="_blank" className="text-zinc-400 hover:text-orange-500 text-sm transition-colors">Twitter</a>
                </div>
            </div>

         </div>
      </footer>
    </div>
  );
};