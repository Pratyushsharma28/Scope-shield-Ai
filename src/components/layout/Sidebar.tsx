import React from 'react';
import { useApp, PageId } from '../../context/AppContext';
import {
  LayoutDashboard,
  SearchCode,
  FileCheck2,
  FileText,
  KanbanSquare,
  CreditCard,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Zap,
  FolderOpen,
  Settings
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    currentPage,
    setCurrentPage,
    loadDemoScenario,
    analysisHistory,
    proposals
  } = useApp();

  const mainNavItems: { id: PageId; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Request', icon: SearchCode },
    { id: 'proposal', label: 'Proposals', icon: FileText, count: proposals.length },
    { id: 'tracking', label: 'Approval Tracking', icon: KanbanSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const secondaryNavItems: { id: PageId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'login', label: 'Demo Access & Auth', icon: UserCheck },
    { id: 'pricing', label: 'Pricing Plans', icon: CreditCard },
  ];

  const handleNavClick = (page: PageId) => {
    setCurrentPage(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          <div>
            <div className="text-[11px] font-bold text-slate-400 px-3 mb-2 uppercase tracking-wider">
              Scope Protection
            </div>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-400 px-3 mb-2 uppercase tracking-wider">
              Account & System
            </div>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Demo Scenarios (Hackathon Evaluator Shortcut) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
              <span>1-Click Test Scenarios</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Instantly inspect realistic analysis test cases:
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  loadDemoScenario('out_of_scope');
                  onCloseMobile();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-rose-50 text-rose-800 border border-slate-200 hover:border-rose-300 transition-colors flex items-center justify-between"
              >
                <span>Out of Scope (NetSuite)</span>
                <span className="text-[10px] text-rose-600 font-mono">-$4,200</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  loadDemoScenario('scope_creep_risk');
                  onCloseMobile();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-amber-50 text-amber-800 border border-slate-200 hover:border-amber-300 transition-colors flex items-center justify-between"
              >
                <span>Creep Risk (Cohort)</span>
                <span className="text-[10px] text-amber-600 font-mono">-$1,650</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  loadDemoScenario('in_scope');
                  onCloseMobile();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-colors flex items-center justify-between"
              >
                <span>In Scope (Safari Fix)</span>
                <span className="text-[10px] text-emerald-600 font-mono">$0</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 text-[11px] text-slate-500 bg-slate-50/50">
          <div className="flex items-center justify-between font-medium">
            <span>ScopeShield AI</span>
            <span>v1.0.0</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Member 1 Frontend Architecture
          </div>
        </div>
      </aside>
    </>
  );
};
