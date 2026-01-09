
import React from 'react';
import { Bot, Layers, Cpu, Download, Activity } from 'lucide-react';

interface HeaderProps {
  onDownload?: () => void;
  canDownload: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onDownload, canDownload }) => {
  return (
    <header className="border-b border-white/5 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-cyan-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-slate-900 p-1.5 rounded-lg border border-cyan-500/20">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white tracking-widest font-sci flex items-center leading-none">
              NEXUS
              <span className="ml-2 text-[8px] bg-cyan-950/50 text-cyan-400 px-1 rounded border border-cyan-900/50">V.4.0</span>
            </h1>
            <p className="text-[8px] text-cyan-500/40 uppercase tracking-[0.3em] font-medium leading-none mt-1">Omni-Stream Core</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4 text-[10px] font-mono font-bold text-slate-500 border-r border-slate-800 pr-4">
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>NEURAL MESH: ACTIVE</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Activity className="w-3 h-3 text-cyan-500/50" />
              <span>LATENCY: 12ms</span>
            </div>
          </div>

          <button
            onClick={onDownload}
            disabled={!canDownload}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold font-sci tracking-wide transition-all duration-300 border
              ${canDownload 
                ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/50 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                : 'bg-slate-900/50 text-slate-700 border-slate-800 cursor-not-allowed'}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>
    </header>
  );
};
