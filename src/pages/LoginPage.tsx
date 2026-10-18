import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  ArrowRight,
  Briefcase,
  Layers,
  KeyRound,
  CheckCircle,
  Sparkles,
  Info,
  DollarSign,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { UserProfile } from '../types';

export const LoginPage: React.FC = () => {
  const { currentUser, setCurrentUser, setCurrentPage, loginAsDemoUser, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Senior Freelance Engineer');
  const [hourlyRateINR, setHourlyRateINR] = useState('8500');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast({ type: 'warning', title: 'Email required' });
      return;
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: fullName.trim() || email.split('@')[0],
      email: email.trim(),
      role: roleTitle.trim() || 'Freelance Software Consultant',
      companyName: companyName.trim() || 'Independent Studio',
      defaultHourlyRate: Number(hourlyRateINR) || 8500,
      currency: 'INR',
      plan: 'PRO',
      isDemoUser: true,
    };

    setCurrentUser(newUser);
    localStorage.setItem('scopeshield_user', JSON.stringify(newUser));
    showToast({
      type: 'success',
      title: 'Demo Session Active',
      message: `Simulated sign-in as ${newUser.name}. Welcome to ScopeShield AI!`,
    });
    setCurrentPage('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 animate-in fade-in duration-150">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          ScopeShield AI — Access Portal
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Safeguard your freelance deliverables, analyze client contracts, and bill for scope expansions with confidence.
        </p>
      </div>

      {/* Prominent Demo Mode & Firebase Inspection Disclosure Banner */}
      <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-2xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-amber-900 block">
              Demo Access Mode Active · Firebase Authentication Not Configured
            </span>
            <p className="text-amber-800 leading-relaxed">
              Firebase Authentication has been inspected and is <strong>not configured</strong> on this deployment (no Firebase credentials or server auth keys). All access below is provided via a <strong>clearly labeled Demo Access Mode</strong> in browser local state. It does not provide cryptographically verified production authentication.
            </p>
          </div>
        </div>

        <div className="px-3 py-1 bg-amber-200/80 text-amber-900 font-extrabold text-[11px] rounded-lg shrink-0 border border-amber-300 self-start sm:self-auto">
          Demo Mode Only
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: 1-Click Fast Demo Personas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                Evaluation Shortcuts
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Instant Demo Personas
              </h2>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2 py-0.5 rounded-full">
              1-Click Sign In
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click any demo profile to instantly populate active contracts, sample client change orders, and approval boards.
          </p>

          <div className="space-y-3">
            {/* Persona 1: Solo Freelancer */}
            <div
              onClick={() => {
                const user: UserProfile = {
                  id: 'usr_alex_rivera',
                  name: 'Alex Rivera',
                  email: 'alex@riverastudio.io',
                  role: 'Senior Fullstack Consultant',
                  companyName: 'Rivera Studio LLC',
                  defaultHourlyRate: 8500,
                  currency: 'INR',
                  plan: 'PRO',
                  isDemoUser: true,
                };
                setCurrentUser(user);
                localStorage.setItem('scopeshield_user', JSON.stringify(user));
                showToast({
                  type: 'success',
                  title: 'Demo Session Active',
                  message: `Logged in as Alex Rivera (₹8,500/hr · Solo Engineer).`,
                });
                setCurrentPage('dashboard');
              }}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-600 bg-slate-50/70 hover:bg-indigo-50/30 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    AR
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Alex Rivera (Solo Freelancer)
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Rivera Studio LLC · ₹8,500/hr (INR)
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-2 text-[11px] text-slate-600">
                Pre-configured with Acme SaaS SOW, NetSuite out-of-scope analysis, and drafted change orders.
              </div>
            </div>

            {/* Persona 2: Studio Director */}
            <div
              onClick={() => {
                const user: UserProfile = {
                  id: 'usr_jordan_chen',
                  name: 'Jordan Chen',
                  email: 'jordan@apexdigital.dev',
                  role: 'Technical Agency Lead',
                  companyName: 'Apex Digital Agency',
                  defaultHourlyRate: 12000,
                  currency: 'INR',
                  plan: 'AGENCY',
                  isDemoUser: true,
                };
                setCurrentUser(user);
                localStorage.setItem('scopeshield_user', JSON.stringify(user));
                showToast({
                  type: 'success',
                  title: 'Demo Session Active',
                  message: `Logged in as Jordan Chen (₹12,000/hr · Agency Lead).`,
                });
                setCurrentPage('dashboard');
              }}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-600 bg-slate-50/70 hover:bg-indigo-50/30 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    JC
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Jordan Chen (Agency Lead)
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Apex Digital Agency · ₹12,000/hr (INR)
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-2 text-[11px] text-slate-600">
                Multi-contract dashboard, high-value change orders, and agency margin protection.
              </div>
            </div>

            {/* Persona 3: UI/UX Architect */}
            <div
              onClick={() => {
                const user: UserProfile = {
                  id: 'usr_priya_sharma',
                  name: 'Priya Sharma',
                  email: 'priya@pixelcraft.studio',
                  role: 'Product & UX Architect',
                  companyName: 'PixelCraft Design',
                  defaultHourlyRate: 6500,
                  currency: 'INR',
                  plan: 'PRO',
                  isDemoUser: true,
                };
                setCurrentUser(user);
                localStorage.setItem('scopeshield_user', JSON.stringify(user));
                showToast({
                  type: 'success',
                  title: 'Demo Session Active',
                  message: `Logged in as Priya Sharma (₹6,500/hr · UX Architect).`,
                });
                setCurrentPage('dashboard');
              }}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-600 bg-slate-50/70 hover:bg-indigo-50/30 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    PS
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Priya Sharma (Design Architect)
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono">
                      PixelCraft Studio · ₹6,500/hr (INR)
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-2 text-[11px] text-slate-600">
                Design system contract reviews, revision limits enforcement, and client scope management.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Custom Profile Entry (Clearly Labeled Demo Mode) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Simulated Local Profile</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Simulate Custom Freelancer Session
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your own details to test ScopeShield with your personal hourly rate and studio name in demo mode. No password is stored or transmitted.
            </p>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Simulated Identity)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="freelancer@example.com"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Studio / Business Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. My Studio"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hourly Rate (INR ₹)
                </label>
                <input
                  type="number"
                  value={hourlyRateINR}
                  onChange={(e) => setHourlyRateINR(e.target.value)}
                  placeholder="8500"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professional Role Title
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Fullstack Engineer / Cloud Architect"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>Start Simulated Demo Session</span>
              </button>
            </div>
          </form>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              All profile data is persisted exclusively in local browser memory (`localStorage`). To reset, use the Reset Sample Data button in Settings.
            </span>
          </div>
        </div>
      </div>

      {/* Demo Features Documentation & Boundaries */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Documentation: Demo Features vs. Production Integrations</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 mb-1">Current Demo Features:</div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
              <li>Local Demo Access without external auth servers</li>
              <li>Proposed Pricing tiers with interactive Mock Checkout</li>
              <li>WhatsApp manual copy-paste text sanitizer and wa.me click-to-chat links</li>
              <li>Sample contracts and initial proposal records</li>
              <li>Local mock adapter when Member 2's backend API is offline</li>
            </ul>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 mb-1">Production Ready Integrations:</div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
              <li>Direct multipart FormData submission to Member 2's POST /api/analyze</li>
              <li>Configurable backend base URL with live health checks</li>
              <li>Real contract PDF and TXT file uploads up to 10MB</li>
              <li>Full change order generation and status transitions in INR</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
