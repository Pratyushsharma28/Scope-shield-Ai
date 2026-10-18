import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Briefcase,
  Layers,
  KeyRound,
  CheckCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';

export const LoginPage: React.FC = () => {
  const { currentUser, setCurrentUser, setCurrentPage, loginAsDemoUser, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

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
      role: 'Freelance Software Consultant',
      companyName: companyName.trim() || 'Independent Studio',
      defaultHourlyRate: 125,
      currency: 'USD',
      plan: 'SOLO',
      isDemoUser: false,
    };

    setCurrentUser(newUser);
    localStorage.setItem('scopeshield_user', JSON.stringify(newUser));
    showToast({
      type: 'success',
      title: isRegisterMode ? 'Account Created' : 'Session Started',
      message: `Signed in as ${newUser.name}. Welcome to ScopeShield AI!`,
    });
    setCurrentPage('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in duration-150">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          ScopeShield AI Access Portal
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Sign in to safeguard your freelance deliverables, analyze contracts, and bill for scope expansions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: 1-Click Fast Demo Roles */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Hackathon Evaluation
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Instant Demo Access
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Skip typing credentials. Click any persona below to pre-load sample contracts and approval records.
            </p>
          </div>

          <div className="space-y-3">
            {/* Persona 1: Solo Freelancer */}
            <div
              onClick={() => loginAsDemoUser('Senior Fullstack Engineer')}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-600 bg-slate-50/60 hover:bg-indigo-50/30 cursor-pointer transition-all group"
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
                    <div className="text-[11px] text-slate-500">
                      Rivera Studio LLC · $125/hr
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-2 text-[11px] text-slate-600">
                Pre-loaded with Acme SaaS SOW, NetSuite out-of-scope test cases, and active proposals.
              </div>
            </div>

            {/* Persona 2: Studio Director */}
            <div
              onClick={() => loginAsDemoUser('Creative Tech Director')}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-600 bg-slate-50/60 hover:bg-indigo-50/30 cursor-pointer transition-all group"
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
                    <div className="text-[11px] text-slate-500">
                      Apex Digital Agency · Multi-seat Pro
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-2 text-[11px] text-slate-600">
                Multiple client contracts, team margin protection, and client approval tracking.
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs text-indigo-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              All demo sessions run in an isolated client-side state without altering production databases.
            </span>
          </div>
        </div>

        {/* Right Column: Standard Authentication Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isRegisterMode ? 'Create Freelancer Account' : 'Freelancer Sign In'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRegisterMode
                ? 'Join thousands of freelancers protecting their hourly rate.'
                : 'Enter your credentials to access your contracts and change orders.'}
            </p>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-4">
            {isRegisterMode && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
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
                    Studio / Business Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Rivera Studio LLC"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="freelancer@example.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              {isRegisterMode ? 'Register & Start Free' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-xs text-indigo-700 hover:text-indigo-800 font-semibold"
            >
              {isRegisterMode
                ? 'Already have an account? Sign In'
                : "Don't have an account? Register free"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
