
import React from 'react';
import { AgentConfig } from '../types';
import { Settings2, User, Cpu, Zap, Brain } from 'lucide-react';

interface AgentConfigCardProps {
  agent: AgentConfig;
  onChange: (id: number, field: keyof AgentConfig, value: string | number) => void;
}

const colorMap: Record<string, string> = {
  emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
  rose: 'border-rose-500/30 bg-rose-500/5 text-rose-400',
  amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
  blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
  purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
};

const inputFocusMap: Record<string, string> = {
  emerald: 'focus:border-emerald-500 focus:ring-emerald-500/20',
  rose: 'focus:border-rose-500 focus:ring-rose-500/20',
  amber: 'focus:border-amber-500 focus:ring-amber-500/20',
};

export const AgentConfigCard: React.FC<AgentConfigCardProps> = ({ agent, onChange }) => {
  const themeClass = colorMap[agent.color] || colorMap.blue;
  const focusClass = inputFocusMap[agent.color] || 'focus:border-indigo-500 focus:ring-indigo-500/20';

  // Helper to handle budget change (allows empty string to reset)
  const handleBudgetChange = (val: string) => {
      if (val === '') {
          onChange(agent.id, 'thinkingBudget', 0); // Reset or 0
      } else {
          onChange(agent.id, 'thinkingBudget', parseInt(val));
      }
  };

  return (
    <div className={`rounded-xl border p-4 transition-all duration-300 ${themeClass} backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-md bg-slate-900/50 border border-white/10`}>
            <User className="w-4 h-4" />
            </div>
            <h3 className="font-semibold uppercase tracking-wider text-xs opacity-90">{agent.name}</h3>
        </div>
        <div className="text-[10px] font-mono opacity-60">ID: {agent.id}</div>
      </div>

      <div className="space-y-4">
        {/* Name / Role Config */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Agent Identity</label>
          <input
            type="text"
            value={agent.name}
            onChange={(e) => onChange(agent.id, 'name', e.target.value)}
            className={`w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 ${focusClass} transition-all`}
            placeholder="Agent Name"
          />
        </div>

        {/* Model Intelligence Config */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-3.5 h-3.5 opacity-70" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Model Intelligence</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] text-slate-500 mb-1">Base Model</label>
                    <select
                        value={agent.modelName || 'default'}
                        onChange={(e) => onChange(agent.id, 'modelName', e.target.value === 'default' ? '' : e.target.value)}
                        className={`w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-300 focus:outline-none ${focusClass}`}
                    >
                        <option value="default">Use Global Default</option>
                        <option value="gemini-3-flash-preview">Gemini 3.0 Flash (Fast)</option>
                        <option value="gemini-3-pro-preview">Gemini 3.0 Pro (Deep)</option>
                    </select>
                </div>
                
                 <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] text-slate-500 mb-1 flex justify-between">
                        <span>Thinking Budget</span>
                        <span className="text-white font-mono">{agent.thinkingBudget ? `${agent.thinkingBudget}t` : 'Default'}</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <Brain className="w-3 h-3 text-slate-600" />
                        <input 
                            type="range"
                            min="0"
                            max="32768"
                            step="1024"
                            value={agent.thinkingBudget || 0}
                            onChange={(e) => onChange(agent.id, 'thinkingBudget', parseInt(e.target.value))}
                            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* System Instruction */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">System Instruction (Prompt)</label>
          <textarea
            value={agent.systemInstruction}
            onChange={(e) => onChange(agent.id, 'systemInstruction', e.target.value)}
            className={`w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 ${focusClass} transition-all resize-none h-24 custom-scrollbar leading-relaxed`}
            placeholder="Define how this agent should behave..."
          />
        </div>
      </div>
    </div>
  );
};
