
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentResult, ModelSettings } from '../types';
import { Trophy, Gavel, AlertTriangle, Users, Terminal, Cpu, Brain } from 'lucide-react';

interface FinalVerdictCardProps {
  result: AgentResult;
  globalSettings: ModelSettings;
  isGodMode: boolean;
}

export const FinalVerdictCard: React.FC<FinalVerdictCardProps> = ({ result, globalSettings, isGodMode }) => {
  const [showPrompt, setShowPrompt] = useState(false);

  // Verdict often uses specialized god mode settings
  const effectiveModel = isGodMode ? 'gemini-3-pro-preview' : globalSettings.modelName;
  const effectiveBudget = isGodMode ? 32768 : Math.min(globalSettings.thinkingBudget * 5, 32768);
  const modelShortName = effectiveModel.includes('pro') ? '3.0 Pro' : '3.0 Flash';

  if (result.status === 'idle') return null;

  const markdownComponents = {
    table: ({node, ...props}: any) => (
        <div className="overflow-x-auto my-6 rounded-xl border border-yellow-500/20 bg-slate-950/60 shadow-lg">
            <table className="w-full text-sm text-left text-slate-200" {...props} />
        </div>
    ),
    thead: ({node, ...props}: any) => (
        <thead className="text-xs uppercase bg-yellow-950/30 text-yellow-500 font-bold tracking-wider" {...props} />
    ),
    th: ({node, ...props}: any) => (
        <th className="px-5 py-4 border-b border-yellow-500/20 whitespace-nowrap" {...props} />
    ),
    tr: ({node, ...props}: any) => (
        <tr className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors" {...props} />
    ),
    td: ({node, ...props}: any) => (
        <td className="px-5 py-4 whitespace-pre-wrap leading-relaxed min-w-[150px]" {...props} />
    ),
    h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 mt-8 mb-4 border-b border-yellow-500/20 pb-2" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-xl font-bold text-yellow-100 mt-6 mb-3 flex items-center gap-2 before:content-[''] before:w-1 before:h-6 before:bg-yellow-500 before:mr-2" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-lg font-bold text-yellow-400/80 mt-5 mb-2" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-bold text-yellow-300" {...props} />,
    a: ({node, ...props}: any) => <a className="text-yellow-400 hover:text-yellow-200 underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 space-y-1 my-3 text-slate-200 marker:text-yellow-500" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 space-y-1 my-3 text-slate-200 marker:text-yellow-500" {...props} />,
  };

  return (
    <div className="relative rounded-2xl border border-yellow-500/20 bg-slate-900/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700 backdrop-blur-xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      {/* Header */}
      <div className="relative px-8 py-6 border-b border-yellow-500/10 flex items-center justify-between bg-yellow-950/10">
        <div className="flex items-center space-x-5">
            <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
            <Gavel className="w-8 h-8 text-yellow-100" />
            </div>
            <div>
            <h2 className="text-2xl font-bold text-white tracking-tight font-sci">BOARD CONSENSUS</h2>
            <p className="text-xs text-yellow-500/70 font-mono flex items-center gap-2 uppercase tracking-widest mt-1">
                <Users className="w-3 h-3" />
                Investment Committee Resolution (1500+ Words)
            </p>
            </div>
        </div>
        {/* Toggle Prompt Button */}
        {result.status === 'success' && (
             <button 
                onClick={() => setShowPrompt(!showPrompt)}
                className={`p-2 rounded-lg transition-all duration-200 border ${showPrompt ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800 hover:text-slate-300'}`}
                title={showPrompt ? "Show Report" : "Show Debate Instructions"}
             >
                 <Terminal className="w-5 h-5" />
             </button>
        )}
      </div>

      {/* Metadata Bar */}
      <div className="flex items-center gap-6 px-8 py-2 bg-yellow-900/10 border-b border-yellow-500/10 text-[10px] font-mono tracking-widest uppercase">
          <div className="flex items-center gap-2 text-yellow-500">
              <Cpu className="w-3.5 h-3.5" />
              <span className="opacity-50">Consensus Engine:</span>
              <span className="text-yellow-100 px-1 rounded bg-yellow-500/10">{modelShortName}</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-500">
              <Brain className="w-3.5 h-3.5" />
              <span className="opacity-50">Cognitive Budget:</span>
              <span className="text-yellow-100">{effectiveBudget} tokens (5x Multiplier)</span>
          </div>
      </div>

      {/* Content */}
      <div className="p-8 min-h-[300px] relative">
        {result.status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-64 space-y-6">
             <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-2 border-yellow-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-yellow-500/50 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-yellow-500/50 animate-pulse" />
                </div>
             </div>
            <div className="text-center">
               <p className="text-lg text-yellow-100 font-light tracking-wide">Deliberating Board Consensus...</p>
               <p className="text-xs text-slate-500 mt-2 font-mono uppercase">Synthesizing 1500+ Word Executive Resolution</p>
            </div>
          </div>
        )}

         {result.status === 'error' && (
          <div className="flex items-center justify-center h-32 text-rose-400 bg-rose-950/10 rounded-lg border border-rose-500/20">
            <AlertTriangle className="w-6 h-6 mr-3" />
            <span className="text-lg">{result.errorMessage}</span>
          </div>
        )}

        {result.status === 'success' && (
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            {showPrompt ? (
                <div className="bg-slate-950 rounded-xl border border-yellow-500/30 overflow-hidden animate-in fade-in duration-300">
                     <div className="flex items-center px-4 py-2 border-b border-yellow-500/20 bg-yellow-950/20">
                         <Terminal className="w-4 h-4 text-yellow-400 mr-2" />
                         <span className="text-xs font-mono text-yellow-300 uppercase">Debate Instruction Source</span>
                     </div>
                     <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed custom-scrollbar max-h-[600px]">
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
                        <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest">Reference Citations</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {result.sources.slice(0, 8).map((source, idx) => (
                            <a 
                            key={idx}
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center space-x-2 text-[10px] text-slate-400 hover:text-yellow-400 transition-colors p-2 hover:bg-white/5 rounded-lg truncate border border-transparent hover:border-white/5"
                            >
                            <span className="text-yellow-500/50 font-mono">{idx + 1}.</span>
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
