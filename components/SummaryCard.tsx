
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentResult, ModelSettings } from '../types';
import { Sparkles, Loader2, FileText, AlertTriangle, ExternalLink, Terminal, PenLine, Cpu, Brain } from 'lucide-react';

interface SummaryCardProps {
  result: AgentResult;
  globalSettings: ModelSettings;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ result, globalSettings }) => {
  const [showPrompt, setShowPrompt] = useState(false);

  // Sector Manager always uses global model + 5x budget multiplier logic
  const modelShortName = globalSettings.modelName.includes('pro') ? '3.0 Pro' : '3.0 Flash';
  const effectiveBudget = globalSettings.thinkingBudget > 0 ? Math.min(globalSettings.thinkingBudget * 5, 32768) : 0;
  
  const markdownComponents = {
    table: ({node, ...props}: any) => (
        <div className="overflow-x-auto my-5 rounded-lg border border-indigo-500/20 bg-slate-950/50 shadow-sm">
            <table className="w-full text-sm text-left text-slate-300" {...props} />
        </div>
    ),
    thead: ({node, ...props}: any) => (
        <thead className="text-xs uppercase bg-indigo-500/10 text-indigo-300 font-bold tracking-wider" {...props} />
    ),
    th: ({node, ...props}: any) => (
        <th className="px-4 py-3 border-b border-indigo-500/20 whitespace-nowrap" {...props} />
    ),
    tr: ({node, ...props}: any) => (
        <tr className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors" {...props} />
    ),
    td: ({node, ...props}: any) => (
        <td className="px-4 py-3 whitespace-pre-wrap leading-relaxed min-w-[140px]" {...props} />
    ),
    h1: ({node, ...props}: any) => <h1 className="text-xl font-bold text-white mt-6 mb-3 flex items-center border-b border-indigo-500/30 pb-2" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-lg font-bold text-indigo-200 mt-5 mb-2" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-base font-bold text-indigo-300/80 mt-4 mb-2" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-bold text-indigo-100" {...props} />,
    a: ({node, ...props}: any) => <a className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 space-y-1 my-3 text-slate-300 marker:text-indigo-500" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 space-y-1 my-3 text-slate-300 marker:text-indigo-500" {...props} />,
  };

  if (result.status === 'idle') return null;

  return (
    <div className="relative rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/10 to-slate-900 shadow-2xl overflow-hidden backdrop-blur-sm transition-all duration-500 hover:shadow-indigo-500/10">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      {/* Header */}
      <div className="relative px-6 py-5 border-b border-indigo-500/20 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30 shadow-[0_0_15_rgba(99,102,241,0.2)]">
            <PenLine className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide font-sci">SECTOR MANAGER BRIEF</h3>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              <p className="text-[10px] text-indigo-400/80 uppercase tracking-widest font-medium">Synthesized Intelligence (2000+ Words)</p>
            </div>
          </div>
        </div>
        
        {/* Toggle Prompt Button */}
        {result.status === 'success' && (
             <button 
                onClick={() => setShowPrompt(!showPrompt)}
                className={`p-2 rounded-lg transition-all duration-200 border ${showPrompt ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800 hover:text-slate-300'}`}
                title={showPrompt ? "Show Report" : "Show Source Prompt"}
             >
                 <Terminal className="w-4 h-4" />
             </button>
        )}
      </div>

      {/* Metadata Bar */}
      <div className="flex items-center gap-4 px-6 py-2 bg-black/40 border-b border-white/5 text-[10px] font-mono tracking-tight">
          <div className="flex items-center gap-2 text-indigo-400">
              <Cpu className="w-3 h-3" />
              <span className="opacity-60 uppercase">System:</span>
              <span className="px-1.5 rounded bg-indigo-500/10 border border-indigo-500/20">{modelShortName}</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2 text-indigo-400">
              <Brain className="w-3 h-3" />
              <span className="opacity-60 uppercase">Cognitive Budget:</span>
              <span className="text-indigo-200">{effectiveBudget} tokens (5x Multiplier)</span>
          </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 min-h-[200px]">
        {result.status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-48 space-y-4">
             <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-500/30 rounded-full animate-spin border-t-indigo-400"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
                </div>
             </div>
            <div className="text-center">
                <p className="text-indigo-200 font-medium">Synthesizing High-Density Report...</p>
                <p className="text-xs text-slate-500 mt-1 font-mono">Aggregating Swarm Insights • 2000+ Word Target</p>
            </div>
          </div>
        )}

        {result.status === 'error' && (
          <div className="flex items-center justify-center h-32 text-rose-400 bg-rose-950/10 rounded-xl border border-rose-500/20">
            <AlertTriangle className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">{result.errorMessage || "Analysis Generation Failed"}</span>
          </div>
        )}

        {result.status === 'success' && (
          <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed">
            {showPrompt ? (
                 <div className="bg-slate-950 rounded-xl border border-indigo-500/30 overflow-hidden animate-in fade-in duration-300">
                     <div className="flex items-center px-4 py-2 border-b border-indigo-500/20 bg-indigo-950/20">
                         <Terminal className="w-4 h-4 text-indigo-400 mr-2" />
                         <span className="text-xs font-mono text-indigo-300 uppercase">System Instruction & Context</span>
                     </div>
                     <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed custom-scrollbar max-h-[500px]">
                         {result.prompt}
                     </pre>
                 </div>
            ) : (
                <>
                    <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                    >
                    {result.output || ''}
                    </ReactMarkdown>

                    {result.sources && result.sources.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Verified Sources
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.sources.map((source, idx) => (
                            <a 
                            key={idx}
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center space-x-2 text-xs text-slate-400 hover:text-indigo-400 transition-colors p-2 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 group"
                            >
                            <span className="text-slate-600 font-mono group-hover:text-indigo-500/70">[{idx + 1}]</span>
                            <span className="truncate">{source.title || source.uri}</span>
                            </a>
                        ))}
                        </div>
                    </div>
                    )}
                </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
