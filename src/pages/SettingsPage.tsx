import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings as SettingsIcon,
  User,
  PlugZap,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Shield,
  Trash2,
  Save,
  RotateCcw,
  Sliders,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { DemoDataNotice } from '../components/common/DemoDataNotice';

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    backendConfig,
    updateBackendConfig,
    testBackendConnection,
    resetToDemoData,
    showToast,
  } = useApp();

  // Profile Form state
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [companyName, setCompanyName] = useState(currentUser.companyName);
  const [defaultHourlyRate, setDefaultHourlyRate] = useState(currentUser.defaultHourlyRate);
  const [currency, setCurrency] = useState(currentUser.currency);

  // Backend config form state
  const [backendUrl, setBackendUrl] = useState(backendConfig.baseUrl);
  const [apiKey, setApiKey] = useState(backendConfig.apiKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ isAlive: boolean; latencyMs?: number; message?: string } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      companyName: companyName.trim(),
      defaultHourlyRate: Number(defaultHourlyRate) || 125,
      currency,
    };
    setCurrentUser(updated);
    localStorage.setItem('scopeshield_user', JSON.stringify(updated));
    showToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Freelancer consultant settings saved successfully.',
    });
  };

  const handleSaveBackend = (e: React.FormEvent) => {
    e.preventDefault();
    updateBackendConfig({
      baseUrl: backendUrl.trim(),
      apiKey: apiKey.trim() || undefined,
    });
    showToast({
      type: 'success',
      title: 'Backend Configuration Saved',
      message: `Set API base URL to ${backendUrl.trim()}`,
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testBackendConnection();
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ isAlive: false, message: e.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
          <span>System & Preferences</span>
          <span aria-hidden="true">·</span>
          <span>ScopeShield Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Backend Integration
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage your consultant profile, configure Member 2's backend API endpoint, and control demo data state.
        </p>
      </div>

      <DemoDataNotice
        isDemoData={!backendConfig.useLiveBackend}
      />

      <div className="space-y-6">
        {/* Section 1: Freelancer Profile & Billing */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Freelancer Profile & Rates</h2>
              <p className="text-xs text-slate-500">
                Default rates applied when generating Change Order pricing
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Principal
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Studio Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Standard Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    value={defaultHourlyRate}
                    onChange={(e) => setDefaultHourlyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Backend AI Developer Integration */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <PlugZap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Backend AI Service (Member 2)</h2>
              <p className="text-xs text-slate-500">
                Configure live server endpoint for automated scope comparison
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveBackend} className="space-y-4">
            {/* Mode Selector */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-900">Analysis Engine Mode</div>
                <div className="text-[11px] text-slate-500">
                  Switch between offline verified test datasets and real HTTP inference server.
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => updateBackendConfig({ useLiveBackend: false })}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    !backendConfig.useLiveBackend
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Demo Engine
                </button>
                <button
                  type="button"
                  onClick={() => updateBackendConfig({ useLiveBackend: true })}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    backendConfig.useLiveBackend
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Live Backend API
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Backend Base URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Pinging...' : 'Test /health'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Endpoint tested: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">{backendUrl.replace(/\/$/, '')}/health</code>
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  testResult.isAlive
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.isAlive ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">
                    {testResult.isAlive ? 'Backend Server Online' : 'Connection Failed'}
                    {testResult.latencyMs !== undefined && ` (${testResult.latencyMs}ms)`}
                  </div>
                  <div className="mt-0.5">{testResult.message}</div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Optional Bearer Authorization Token
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Optional token for secured backend routes"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Backend Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Demo Data & State Reset */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Demo Data & Sandbox State</h2>
              <p className="text-xs text-slate-500">
                Manage pre-loaded hackathon sample contracts, proposals, and history
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900">Reset Demo Environment</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Restores the 3 sample contracts, pre-analyzed records, and change orders.
              </div>
            </div>
            <button
              type="button"
              onClick={resetToDemoData}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 inline-flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
