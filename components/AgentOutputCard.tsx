
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentConfig, AgentResult, ModelSettings } from '../types';
import { Loader2, AlertCircle, Quote, ExternalLink, Maximize2, X, Terminal, Cpu, Brain, ChevronRight, Crown, ShieldCheck } from 'lucide-react';

interface AgentOutputCardProps {
  agent: AgentConfig;
  result?: AgentResult;
  globalSettings: ModelSettings;
}

const themeMap: Record<string, { border: string; bg: string; title: string; icon: string; accent: string; glow: string }> = {
  emerald: { border: 'group-hover:border-emerald-500/30', bg: 'bg-emerald-500/5', title: 'group-hover:text-emerald-300', icon: 'text-emerald-500', accent: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
  rose: { border: 'group-hover:border-rose-500/30', bg: 'bg-rose-500/5', title: 'group-hover:text-rose-300', icon: 'text-rose-500', accent: 'text-rose-400', glow: 'shadow-rose-500/10' },
  amber: { border: 'group-hover:border-amber-500/30', bg: 'bg-amber-500/5', title: 'group-hover:text-amber-300', icon: 'text-amber-500', accent: 'text-amber-400', glow: 'shadow-amber-500/10' },
  blue: { border: 'group-hover:border-blue-500/30', bg: 'bg-blue-500/5', title: 'group-hover:text-blue-300', icon: 'text-blue-500', accent: 'text-blue-400', glow: 'shadow-blue-500/10' },
  purple: { border: 'group-hover:border-purple-500/30', bg: 'bg-purple-500/5', title: 'group-hover:text-purple-300', icon: 'text-purple-500', accent: 'text-purple-400', glow: 'shadow-purple-500/10' },
  orange: { border: 'group-hover:border-orange-500/30', bg: 'bg-orange-500/5', title: 'group-hover:text-orange-300', icon: 'text-orange-500', accent: 'text-orange-400', glow: 'shadow-orange-500/10' },
  slate: { border: 'group-hover:border-slate-500/30', bg: 'bg-slate-500/5', title: 'group-hover:text-slate-300', icon: 'text-slate-500', accent: 'text-slate-400', glow: 'shadow-slate-500/10' },
  teal: { border: 'group-hover:border-teal-500/30', bg: 'bg-teal-500/5', title: 'group-hover:text-teal-300', icon: 'text-teal-500', accent: 'text-teal-400', glow: 'shadow-teal-500/10' },
  lime: { border: 'group-hover:border-lime-500/30', bg: 'bg-lime-500/5', title: 'group-hover:text-lime-300', icon: 'text-lime-500', accent: 'text-lime-400', glow: 'shadow-lime-500/10' },
  cyan: { border: 'group-hover:border-cyan-500/30', bg: 'bg-cyan-500/5', title: 'group-hover:text-cyan-300', icon: 'text-cyan-500', accent: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
  pink: { border: 'group-hover:border-pink-500/30', bg: 'bg-pink-500/5', title: 'group-hover:text-pink-300', icon: 'text-pink-500', accent: 'text-pink-400', glow: 'shadow-pink-500/10' },
  violet: { border: 'group-hover:border-violet-500/30', bg: 'bg-violet-500/5', title: 'group-hover:text-violet-300', icon: 'text-violet-500', accent: 'text-violet-400', glow: 'shadow-violet-500/10' },
  fuchsia: { border: 'group-hover:border-fuchsia-500/30', bg: 'bg-fuchsia-500/5', title: 'group-hover:text-fuchsia-300', icon: 'text-fuchsia-500', accent: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/10' },
};

export const AgentOutputCard: React.FC<AgentOutputCardProps> = ({ agent, result, globalSettings }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const theme = themeMap[agent?.color] || themeMap.emerald;

  // Handle missing result safely
  if (!result || !agent) {
    return (
      <div className="rounded-xl border border-white/5 bg-slate-900/40 p-5 flex items-center justify-center text-[10px] text-slate-600 uppercase font-mono tracking-widest min-h-[220px]">
        Initializing Neural Weights...
      </div>
    );
  }

  const effectiveModel = agent.modelName || globalSettings.modelName;
  const effectiveBudget = (agent.thinkingBudget !== undefined && agent.thinkingBudget > 0) 
      ? agent.thinkingBudget 
      : globalSettings.thinkingBudget;

  const modelShortName = effectiveModel.includes('pro') ? 'Gemini 3 Pro' : 'Gemini 3 Flash';
  const isTier3 = agent.id >= 100;

  const markdownComponents = {
    h1: ({node, ...props}: any) => <h1 className={`text-base font-bold mt-4 mb-2 pb-1 border-b border-white/10 ${theme.accent}`} {...props} />,
    h2: ({node, ...props}: any) => <h2 className={`text-sm font-bold mt-3 mb-1 ${theme.accent} opacity-90`} {...props} />,
    strong: ({node, ...props}: any) => <strong className={`font-bold ${theme.accent}`} {...props} />,
    a: ({node, ...props}: any) => <a className={`${theme.accent} hover:underline underline-offset-2`} target="_blank" rel="noopener noreferrer" {...props} />,
  };

  const Content = () => (
    <div className={`relative p-5 h-full overflow-y-auto custom-scrollbar`}>
        {result.status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-[10px] font-mono uppercase tracking-widest opacity-50">
            {isTier3 ? "Board Member Standing By" : "Agent Standing By"}
          </div>
        )}

        {result.status === 'loading' && (
          <div className="flex flex-col h-full items-center justify-center space-y-4">
             <div className="relative">
                <Loader2 className={`w-8 h-8 animate-spin ${theme.icon}`} />
                {isTier3 ? <Crown className="w-3.5 h-3.5 text-yellow-500 absolute inset-0 m-auto" /> : <Terminal className="w-3 h-3 text-slate-400 absolute inset-0 m-auto" />}
             </div>
             <div className="w-full max-w-[280px] bg-black/60 border border-white/10 rounded-lg p-3 font-mono text-[9px] space-y-1 shadow-2xl overflow-hidden max-h-[120px] overflow-y-auto">
                {result.logs?.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 animate-in fade-in slide-in-from-left-1 duration-200">
                        <ChevronRight className={`w-2 h-2 mt-1 shrink-0 ${theme.icon}`} />
                        <span className={i === (result.logs?.length || 0) - 1 ? 'text-white' : 'text-slate-500'}>{log}</span>
                    </div>
                ))}
                <div className="flex items-center gap-1 pt-1">
                    <span className={`w-1 h-2 ${theme.icon.replace('text-', 'bg-')} animate-pulse`}></span>
                </div>
             </div>
          </div>
        )}

        {result.status === 'error' && (
          <div className="flex flex-col items-center justify-center h-full text-rose-400 space-y-2">
            <AlertCircle className="w-6 h-6" />
            <p className="text-[10px] text-center px-4 opacity-80">{result.errorMessage || "Request Failed"}</p>
          </div>
        )}

        {result.status === 'success' && (
          <div className="prose prose-invert prose-sm max-w-none text-slate-300">
             {showPrompt ? (
               <div className="bg-slate-950 rounded-lg border border-white/5 overflow-hidden animate-in fade-in duration-300 h-full">
                  <div className="flex items-center px-3 py-1.5 border-b border-white/5 bg-white/5">
                      <Terminal className="w-3 h-3 text-slate-400 mr-2" />
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Input Context & Instruction</span>
                  </div>
                  <pre className="p-3 text-[10px] font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[400px] custom-scrollbar">
                      {result.prompt}
                  </pre>
               </div>
             ) : (
               <>
                 <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {result.output || ''}
                 </ReactMarkdown>
                 {result.sources && result.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
                        {result.sources.slice(0, 3).map((s, idx) => (
                            <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="block text-[9px] text-slate-500 hover:text-white truncate">
                               [{idx+1}] {s.title || s.uri}
                            </a>
                        ))}
                    </div>
                 )}
               </>
             )}
          </div>
        )}
      </div>
  );

  return (
    <div className={`group flex flex-col h-full rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-sm overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl ${theme.border} ${theme.glow}`}>
        <div className={`px-4 py-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-between`}>
          <div className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full ${theme.icon} bg-current shadow-[0_0_8px_currentColor]`}></div>
            <h3 className={`font-bold text-[11px] text-slate-300 tracking-wide uppercase flex items-center gap-1.5`}>
                {isTier3 && <ShieldCheck className="w-3 h-3 text-yellow-500" />}
                {agent.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
             <div className="hidden sm:flex items-center gap-1.5 border-r border-white/5 pr-2 mr-0.5">
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/30 border border-white/5 shadow-inner">
                    <Cpu className="w-2.5 h-2.5 text-slate-500" />
                    <span className="text-[8px] font-mono text-slate-400 font-bold">{modelShortName}</span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    <Brain className="w-2.5 h-2.5 text-indigo-400" />
                    <span className="text-[8px] font-mono text-indigo-300 font-bold">{effectiveBudget}t</span>
                </div>
             </div>
             
             {result.status === 'success' && (
               <button 
                  onClick={() => setShowPrompt(!showPrompt)}
                  className={`p-1.5 rounded-md transition-all duration-200 border ${showPrompt ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800 hover:text-slate-300'}`}
                  title={showPrompt ? "Show Analysis" : "Show Prompt"}
               >
                  <Terminal className="w-3.5 h-3.5" />
               </button>
             )}
          </div>
        </div>
        <div className="flex-1 min-h-[240px] relative bg-slate-950/20">
           <Content />
        </div>
    </div>
  );
};
