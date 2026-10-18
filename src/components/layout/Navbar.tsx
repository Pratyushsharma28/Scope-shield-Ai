import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  ChevronDown,
  PlugZap,
  User,
  PlusCircle,
  Check,
  Menu,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { BackendConfigModal } from '../backend-modal/BackendConfigModal';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    contracts,
    activeContract,
    setActiveContract,
    currentUser,
    backendConfig,
    setCurrentPage,
  } = useApp();

  const [isContractDropdownOpen, setIsContractDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  ScopeShield
                </span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Freelance Scope Protection
              </p>
            </div>
          </div>
        </div>

        {/* Center: Active Contract Selector */}
        <div className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setIsContractDropdownOpen(!isContractDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors max-w-sm"
          >
            <span className="text-slate-400">Active Contract:</span>
            <span className="font-semibold text-slate-900 truncate max-w-[200px]">
              {activeContract ? activeContract.title : 'No contract selected'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isContractDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Select SOW / Agreement
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {contracts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveContract(c);
                      setIsContractDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      activeContract?.id === c.id
                        ? 'bg-indigo-50 text-indigo-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="truncate font-medium">{c.title}</div>
                      <div className="text-[10px] text-slate-400">
                        {c.clientName} · ₹{c.hourlyRate.toLocaleString('en-IN')}/hr
                      </div>
                    </div>
                    {activeContract?.id === c.id && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 mt-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsContractDropdownOpen(false);
                    setCurrentPage('analyze');
                  }}
                  className="w-full py-1.5 px-2 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg font-medium flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Upload / Add New Contract</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions, Backend Status, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status indicator & modal trigger */}
          <button
            type="button"
            onClick={() => setIsBackendModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              backendConfig.useLiveBackend
                ? backendConfig.isConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Configure connection to Member 2's backend"
          >
            <PlugZap className={`w-3.5 h-3.5 ${backendConfig.isConnected ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">
              {backendConfig.useLiveBackend
                ? backendConfig.isConnected
                  ? 'Live API (Connected)'
                  : 'Live API (Offline)'
                : 'Demo Engine'}
            </span>
            <span className="sm:hidden text-[10px]">
              {backendConfig.useLiveBackend ? 'Live' : 'Demo'}
            </span>
          </button>

          {/* Quick Pricing link */}
          <button
            type="button"
            onClick={() => setCurrentPage('pricing')}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pricing</span>
          </button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="text-left hidden xl:block">
                <div className="text-xs font-bold text-slate-900 leading-none">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 leading-none mt-1">
                  {currentUser.companyName}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-indigo-700 font-semibold">
                    <span>{currentUser.plan} PLAN</span>
                    <span>·</span>
                    <span>₹{currentUser.defaultHourlyRate.toLocaleString('en-IN')}/hr</span>
                  </div>
                </div>

                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      setCurrentPage('dashboard');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 rounded-md"
                  >
                    Dashboard Overview
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage('settings');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 rounded-md"
                  >
                    Account & Backend Settings
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage('login');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-indigo-700 hover:bg-indigo-50 rounded-md flex items-center justify-between font-semibold"
                  >
                    <span>Demo Access Personas</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">Demo</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsBackendModalOpen(true);
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 rounded-md flex items-center justify-between"
                  >
                    <span>Backend Developer API</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Team</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1 text-xs">
                  <button
                    onClick={() => {
                      setCurrentPage('login');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-md font-medium"
                  >
                    Switch User / Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Backend API Configuration Modal */}
      <BackendConfigModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
    </>
  );
};
