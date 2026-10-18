import React from 'react';
import { Database, PlugZap, ArrowRight } from 'lucide-react';

interface DemoDataNoticeProps {
  isDemoData: boolean;
  onOpenBackendSettings?: () => void;
  compact?: boolean;
}

export const DemoDataNotice: React.FC<DemoDataNoticeProps> = ({
  isDemoData,
  onOpenBackendSettings,
  compact = false,
}) => {
  if (!isDemoData) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50/80 border border-emerald-200 px-3 py-1.5 rounded-md">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Connected to Live Backend AI Service</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/90 border border-slate-200 px-2 py-0.5 rounded">
        <Database className="w-3 h-3 text-slate-600" />
        <span>Demo Data</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-100/90 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
          <Database className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-slate-900">Demo Engine Dataset</span>
          <span className="text-slate-500 ml-1.5">
            This analysis uses pre-indexed contract test cases. Real AI inference ready for Member 2's backend.
          </span>
        </div>
      </div>

      {onOpenBackendSettings && (
        <button
          type="button"
          onClick={onOpenBackendSettings}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-800 shrink-0 hover:underline"
        >
          <PlugZap className="w-3.5 h-3.5" />
          <span>Connect Backend API</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
