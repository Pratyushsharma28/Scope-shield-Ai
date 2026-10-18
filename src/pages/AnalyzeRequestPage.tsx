import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  SearchCode,
  Upload,
  FileText,
  Sparkles,
  Zap,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import { SAMPLE_CLIENT_REQUESTS } from '../data/mockData';
import { analyzeScopeRequest } from '../services/api';
import { DemoDataNotice } from '../components/common/DemoDataNotice';
import { ClientRequestInput, Contract } from '../types';

export const AnalyzeRequestPage: React.FC = () => {
  const {
    contracts,
    activeContract,
    setActiveContract,
    addContract,
    setCurrentAnalysis,
    addAnalysisToHistory,
    setCurrentPage,
    backendConfig,
    showToast,
  } = useApp();

  // Form states
  const [selectedContractId, setSelectedContractId] = useState<string>(
    activeContract?.id || (contracts[0]?.id ?? '')
  );
  const [requestTitle, setRequestTitle] = useState('');
  const [requestText, setRequestText] = useState('');
  const [requestChannel, setRequestChannel] = useState<'SLACK' | 'EMAIL' | 'MEETING_NOTES' | 'JIRA' | 'WHATSAPP'>('SLACK');
  const [urgency, setUrgency] = useState<'STANDARD' | 'URGENT' | 'BLOCKER'>('STANDARD');
  const [customHourlyRate, setCustomHourlyRate] = useState<number>(
    activeContract?.hourlyRate || 125
  );

  // Analysis workflow states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Contract upload modal / inline tab
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newContractTitle, setNewContractTitle] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newContractContent, setNewContractContent] = useState('');
  const [newContractRate, setNewContractRate] = useState(125);

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || contracts[0];

  const handleContractChange = (id: string) => {
    setSelectedContractId(id);
    const found = contracts.find((c) => c.id === id);
    if (found) {
      setActiveContract(found);
      setCustomHourlyRate(found.hourlyRate);
    }
  };

  const handleApplyPreset = (presetIndex: number) => {
    const preset = SAMPLE_CLIENT_REQUESTS[presetIndex];
    if (preset) {
      setRequestTitle(preset.title);
      setRequestText(preset.text);
      setRequestChannel(preset.channel);
      setUrgency(preset.urgency);
      handleContractChange(preset.contractId);
      showToast({
        type: 'info',
        title: 'Sample Request Loaded',
        message: `Loaded "${preset.title}". Click "Analyze Scope" to evaluate.`,
      });
    }
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractTitle.trim() || !newContractContent.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing Details',
        message: 'Please provide a title and SOW text for the new contract.',
      });
      return;
    }

    const newContract: Contract = {
      id: `cnt_custom_${Date.now()}`,
      title: newContractTitle.trim(),
      clientName: newClientName.trim() || 'Client Partner',
      clientEmail: 'client@example.com',
      totalBudget: 10000,
      hourlyRate: Number(newContractRate) || 125,
      currency: 'USD',
      startDate: new Date().toISOString().split('T')[0],
      targetEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      deliverables: [
        'Milestone deliverables as detailed in attached agreement',
        'Standard design & development review cycles',
      ],
      exclusions: [
        'Unbudgeted architectural refactors or third-party enterprise integrations',
        'Out-of-scope feature additions exceeding agreed milestones',
      ],
      revisionPolicy: 'Up to two revision rounds included per milestone.',
      content: newContractContent.trim(),
    };

    addContract(newContract);
    setSelectedContractId(newContract.id);
    setIsUploadOpen(false);
    setNewContractTitle('');
    setNewContractContent('');
    setNewClientName('');
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim()) {
      showToast({
        type: 'warning',
        title: 'Empty Request Text',
        message: 'Please paste the client request text (Slack, email, or meeting note).',
      });
      return;
    }

    if (!selectedContract) {
      showToast({
        type: 'error',
        title: 'No Contract Selected',
        message: 'Please select or upload a baseline contract to compare against.',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStep(1);

    // Multi-stage visual progress updates for UX clarity
    const stepTimer1 = setTimeout(() => setAnalysisStep(2), 350);
    const stepTimer2 = setTimeout(() => setAnalysisStep(3), 800);
    const stepTimer3 = setTimeout(() => setAnalysisStep(4), 1200);

    try {
      const input: ClientRequestInput = {
        contractId: selectedContract.id,
        requestTitle: requestTitle.trim() || 'Client Feature Request',
        requestText: requestText.trim(),
        requestChannel,
        urgency,
        customHourlyRate: Number(customHourlyRate) || selectedContract.hourlyRate,
      };

      const response = await analyzeScopeRequest(input, selectedContract);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Scope analysis failed. Please verify your connection.');
      }

      addAnalysisToHistory(response.data);
      setCurrentAnalysis(response.data);

      showToast({
        type: 'success',
        title: 'Scope Analysis Completed',
        message: `Classification: ${response.data.classification.replace(/_/g, ' ')} (${response.data.confidenceScore}% confidence)`,
      });

      // Navigate to results page
      setCurrentPage('results');
    } catch (err: any) {
      setAnalysisError(err.message || 'An error occurred during analysis.');
      showToast({
        type: 'error',
        title: 'Analysis Error',
        message: err.message || 'Failed to complete analysis.',
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
          <span>Workflow Step 1 of 3</span>
          <span aria-hidden="true">·</span>
          <span>Scope Comparison Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Analyze Client Request
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Paste an incoming email, Slack message, or ticket. ScopeShield compares it against your contract deliverables and exclusions to calculate scope drift and pricing.
        </p>
      </div>

      {/* Backend Engine Status Banner */}
      <DemoDataNotice
        isDemoData={!backendConfig.useLiveBackend}
        onOpenBackendSettings={() => {}}
      />

      {/* Main Analysis Form */}
      <form onSubmit={handleAnalyze} className="space-y-6">
        {/* Step 1: Baseline Contract Selection */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Step 1: Baseline Contract (SOW)
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Select or Upload Signed Agreement
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsUploadOpen(!isUploadOpen)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isUploadOpen ? 'Cancel Upload' : 'Upload / Paste Custom SOW'}</span>
            </button>
          </div>

          {/* New Contract Inline Creator */}
          {isUploadOpen && (
            <div className="p-4 bg-slate-50 border border-indigo-200 rounded-xl space-y-4 animate-in fade-in duration-150">
              <div className="font-bold text-sm text-slate-900">
                Index New Statement of Work (SOW)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project / SOW Title
                  </label>
                  <input
                    type="text"
                    value={newContractTitle}
                    onChange={(e) => setNewContractTitle(e.target.value)}
                    placeholder="e.g. Acme Web Application Redesign SOW"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Name / Org
                  </label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Acme Software Inc."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contract Text / SOW Clauses
                </label>
                <textarea
                  rows={4}
                  value={newContractContent}
                  onChange={(e) => setNewContractContent(e.target.value)}
                  placeholder="Paste your SOW clauses, deliverables, and exclusions here..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700">Contract Hourly Rate ($):</label>
                  <input
                    type="number"
                    value={newContractRate}
                    onChange={(e) => setNewContractRate(Number(e.target.value))}
                    className="w-24 px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateContract}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Save & Select Contract
                </button>
              </div>
            </div>
          )}

          {/* Select from existing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {contracts.map((c) => {
              const isSelected = c.id === selectedContractId;
              return (
                <div
                  key={c.id}
                  onClick={() => handleContractChange(c.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      {c.title}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Client: <span className="font-medium text-slate-700">{c.clientName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>${c.hourlyRate}/hr</span>
                    <span>·</span>
                    <span>{c.exclusions.length} exclusions indexed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Incoming Client Request Input */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Step 2: Incoming Client Request
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Paste Client Message or Use Test Scenario
              </h2>
            </div>

            {/* Quick Demo Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Load Preset:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset(0)}
                className="px-2 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                title="Out of scope NetSuite ERP integration"
              >
                NetSuite ERP
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(1)}
                className="px-2 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                title="Ambiguous cohort retention charts"
              >
                Cohort Charts
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(2)}
                className="px-2 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                title="In-scope Safari responsiveness glitch"
              >
                Safari Bug Fix
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Request Summary / Topic
              </label>
              <input
                type="text"
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                placeholder="e.g. Add NetSuite two-way reconciliation pipeline"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Communication Channel
              </label>
              <select
                value={requestChannel}
                onChange={(e) => setRequestChannel(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="SLACK">Slack Channel / DM</option>
                <option value="EMAIL">Email Thread</option>
                <option value="JIRA">Jira / Linear Ticket</option>
                <option value="MEETING_NOTES">Zoom Meeting Notes</option>
                <option value="WHATSAPP">WhatsApp / SMS</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Client Message Text</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Include the exact wording from the client
              </span>
            </label>
            <textarea
              rows={5}
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="Paste raw email, Slack excerpt, or ticket request here..."
              className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Pricing & Urgency Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Freelancer Billing Rate ($/hr)
              </label>
              <input
                type="number"
                value={customHourlyRate}
                onChange={(e) => setCustomHourlyRate(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Used to compute estimated extra billing impact if out of scope.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Stated Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="STANDARD">Standard Sprint Pace</option>
                <option value="URGENT">Urgent (Before Next Launch Demo)</option>
                <option value="BLOCKER">Blocker (Immediate Priority)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Urgent requests factor in timeline compression and rush rates.
              </p>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {analysisError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Analysis Failed:</span> {analysisError}
            </div>
          </div>
        )}

        {/* Analysis Progress / Loading State */}
        {isAnalyzing && (
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-5 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
              <div>
                <h4 className="font-bold text-xs text-indigo-900">
                  Cross-Referencing Scope Boundaries...
                </h4>
                <p className="text-[11px] text-indigo-700">
                  {analysisStep === 1 && 'Indexing SOW deliverable schedule and specific exclusions...'}
                  {analysisStep === 2 && 'Deconstructing requested requirements & identifying ERP/CRM dependencies...'}
                  {analysisStep === 3 && 'Evaluating contract conflict score & calculating hour deviations...'}
                  {analysisStep === 4 && 'Synthesizing contract evidence & proposal parameters...'}
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-indigo-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${analysisStep * 25}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setRequestTitle('');
              setRequestText('');
            }}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Clear Fields
          </button>

          <button
            type="submit"
            disabled={isAnalyzing || !requestText.trim()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all hover:shadow"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Scope...</span>
              </>
            ) : (
              <>
                <SearchCode className="w-4 h-4" />
                <span>Submit for Scope Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
