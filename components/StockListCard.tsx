import React from 'react';
import { Stock } from '../types';
import { CheckCircle2, CircleDashed, Building2 } from 'lucide-react';

interface StockListCardProps {
  stocks: Stock[];
  analyses: any;
  currentProcessingCode: string | null;
}

export const StockListCard: React.FC<StockListCardProps> = ({ stocks, analyses, currentProcessingCode }) => {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-700/50 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-300">Target Universe (10 Companies)</h3>
        <span className="text-xs text-slate-500">{stocks.length} Selected</span>
      </div>
      <div className="divide-y divide-slate-700/50 max-h-[300px] overflow-y-auto">
        {stocks.map((stock) => {
          const analysis = analyses[stock.code];
          const isComplete = analysis?.status === 'complete';
          const isProcessing = currentProcessingCode === stock.code;
          
          return (
            <div key={stock.code} className={`p-3 flex items-start space-x-3 transition-colors ${isProcessing ? 'bg-indigo-500/10' : 'hover:bg-slate-800/80'}`}>
              <div className="mt-0.5">
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : isProcessing ? (
                   <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                ) : (
                  <CircleDashed className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate">{stock.name}</p>
                  <span className="text-xs font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">{stock.code}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{stock.reason}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
