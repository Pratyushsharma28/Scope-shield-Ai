import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle, AlertCircle, RefreshCw, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface BackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendConfigModal: React.FC<BackendConfigModalProps> = ({ isOpen, onClose }) => {
  const { backendConfig, updateBackendConfig, testBackendConnection, showToast } = useApp();
  const [urlInput, setUrlInput] = useState(backendConfig.baseUrl);
  const [apiKeyInput, setApiKeyInput] = useState(backendConfig.apiKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ isAlive: boolean; latencyMs?: number; message?: string } | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'contract_schema' | 'quickstart'>('settings');

  if (!isOpen) return null;

  const handleSave = () => {
    updateBackendConfig({
      baseUrl: urlInput.trim(),
      apiKey: apiKeyInput.trim() || undefined,
    });
    showToast({
      type: 'success',
      title: 'Backend Settings Saved',
      message: `Configured endpoint: ${urlInput.trim()}`,
    });
  };

  const handleTest = async () => {
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

  const samplePayload = `contract: <PDF or TXT file>
clientRequest: "Please implement the requested change."
estimatedExtraHours: 12
hourlyRate: 8500`;

  const sampleResponseJson = `{
  "status": "needs_review",
  "summary": "Review the request against the cited contract language.",
  "evidence": [
    {
      "clause": "Exact clause text extracted from the uploaded contract.",
      "explanation": "How the clause relates to the client request."
    }
  ],
  "uncertaintyReasons": ["A human should review the scope interpretation."],
  "requiresHumanReview": true,
  "estimatedExtraHours": 12,
  "hourlyRate": 8500,
  "estimatedExtraCost": 102000,
  "currency": "INR"
}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Backend & API Integration Console</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Coordinate Member 1 (Frontend) and Member 2 (Backend AI Service)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-white gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Connection Settings
          </button>
          <button
            onClick={() => setActiveTab('contract_schema')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'contract_schema'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            API Schema Contracts
          </button>
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'quickstart'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Backend Developer Spec
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Engine Mode Toggle */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900">Analysis Engine Mode</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Toggle between local sample test-cases and real backend HTTP endpoints.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
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

              {/* Endpoint configuration */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Backend API Base URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="http://localhost:3000 or https://api.yourdomain.com"
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Pinging...' : 'Test /api/health'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Expected health endpoint: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">{urlInput.replace(/\/$/, '')}/api/health</code>
                </p>

                {/* Test results banner */}
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
                        {testResult.isAlive ? 'Backend Online & Reachable' : 'Connection Failed'}
                        {testResult.latencyMs !== undefined && ` (${testResult.latencyMs}ms)`}
                      </div>
                      <div className="mt-0.5">{testResult.message}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Bearer Token */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Optional Authorization Token (Bearer)
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Optional authorization token if backend uses auth"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          )}

          {activeTab === 'contract_schema' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">POST /api/analyze</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload one PDF or TXT contract with the request and pricing fields shown below.
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700">Request Body (multipart/form-data)</span>
                <pre className="mt-1.5 p-3 rounded-lg bg-slate-900 text-slate-100 text-xs overflow-x-auto">
                  {samplePayload}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Response Schema Example (not a live analysis)</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sampleResponseJson);
                      setCopiedSnippet(true);
                      setTimeout(() => setCopiedSnippet(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet ? 'Copied' : 'Copy Response Schema'}</span>
                  </button>
                </div>
                <pre className="mt-1.5 p-3 rounded-lg bg-slate-900 text-slate-100 text-xs overflow-x-auto max-h-56">
                  {sampleResponseJson}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'quickstart' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900">
                <span className="font-bold">ScopeShield API:</span> The integrated service uses <code>GET /api/health</code> and <code>POST /api/analyze</code>. Configure <code>VITE_BACKEND_API_URL</code> in the frontend and <code>FRONTEND_ORIGIN</code> in the backend. Keep <code>GEMINI_API_KEY</code> server-side only.
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-slate-600" />
                  Local Setup:
                </h5>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto">
{`Frontend:  http://localhost:5173
Backend:   http://localhost:3000

Frontend .env:
VITE_BACKEND_API_URL=http://localhost:3000

Backend .env:
FRONTEND_ORIGIN=http://localhost:5173
GEMINI_API_KEY=<server-side secret>`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
