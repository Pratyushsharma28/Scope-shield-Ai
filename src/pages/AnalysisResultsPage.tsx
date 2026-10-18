import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileText,
  DollarSign,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Calculator,
  Sliders,
  Scale,
  ExternalLink,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { ClassificationBadge } from '../components/common/ClassificationBadge';
import { DemoDataNotice } from '../components/common/DemoDataNotice';
import { createChangeProposal } from '../services/api';

export const AnalysisResultsPage: React.FC = () => {
  const {
    currentAnalysis,
    activeContract,
    contracts,
    addProposal,
    setActiveProposal,
    setCurrentPage,
    showToast,
  } = useApp();

  const [copiedResponse, setCopiedResponse] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

  // Interactive Cost Estimator adjustments
  const [customHours, setCustomHours] = useState<number>(
    currentAnalysis
      ? Math.round((currentAnalysis.costEstimate.estimatedHoursMin + currentAnalysis.costEstimate.estimatedHoursMax) / 2)
      : 30
  );
  const [customRate, setCustomRate] = useState<number>(
    currentAnalysis?.costEstimate.recommendedHourlyRate || activeContract?.hourlyRate || 125
  );

  if (!currentAnalysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Analysis Results Yet</h2>
        <p className="text-xs text-slate-500">
          Upload a contract and paste an incoming client request to generate an automated scope evaluation.
        </p>
        <button
          onClick={() => setCurrentPage('analyze')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
        >
          Go to Request Analyzer
        </button>
      </div>
    );
  }

  const contract = contracts.find((c) => c.id === currentAnalysis.contractId) || activeContract || contracts[0];
  const calculatedTotal = customHours * customRate;

  // Generate polite, professional email / Slack response template
  const clientResponseTemplate = currentAnalysis.classification === 'IN_SCOPE'
    ? `Hi ${currentAnalysis.clientName.split(' ')[0]},\n\nThanks for reaching out! I checked this against our Statement of Work (${currentAnalysis.contractTitle}), and this item is fully covered under our contracted QA and revision deliverables. I will have this addressed in our current sprint deploy.\n\nBest,\nAlex`
    : `Hi ${currentAnalysis.clientName.split(' ')[0]},\n\nThanks for sharing this request regarding "${currentAnalysis.requestTitle}".\n\nI reviewed our signed Statement of Work (${currentAnalysis.contractTitle}). Per Section 2.2 / Deliverables Schedule, direct two-way integrations and additions outside our core agreed views constitute out-of-scope work that requires a Change Order.\n\nTo ensure we deliver this safely without impacting our upcoming milestone launch, I have drafted an electronic Change Order estimating approximately ${customHours} engineering hours ($${calculatedTotal.toLocaleString()}).\n\nI will send over the formal approval link shortly for your review and sign-off.\n\nBest regards,\nAlex`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(clientResponseTemplate);
    setCopiedResponse(true);
    showToast({
      type: 'success',
      title: 'Response Copied to Clipboard',
      message: 'Paste this polite boundary pushback directly into Slack or email.',
    });
    setTimeout(() => setCopiedResponse(false), 2500);
  };

  const handleGenerateProposal = async () => {
    setIsGeneratingProposal(true);
    try {
      const result = await createChangeProposal(currentAnalysis, contract, {
        totalAmount: calculatedTotal,
        items: [
          {
            id: `item_${Date.now()}`,
            title: currentAnalysis.requestTitle,
            description: currentAnalysis.executiveSummary,
            estimatedHours: customHours,
            rate: customRate,
            subtotal: calculatedTotal,
          },
        ],
      });

      if (result.success && result.data) {
        addProposal(result.data);
        setActiveProposal(result.data);
        showToast({
          type: 'success',
          title: 'Proposal Generated',
          message: `Change Order ${result.data.proposalNumber} is ready for client review.`,
        });
        setCurrentPage('proposal');
      }
    } catch (e: any) {
      showToast({
        type: 'error',
        title: 'Proposal Error',
        message: e.message || 'Failed to create proposal.',
      });
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Workflow Step 2 of 3</span>
            <span aria-hidden="true">·</span>
            <span>Evaluation Report</span>
            <span aria-hidden="true">·</span>
            <span>{currentAnalysis.contractTitle}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scope Analysis & Evidence Report
          </h1>
        </div>

        {/* Action Button: Generate Proposal */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyTemplate}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:border-slate-400 rounded-lg inline-flex items-center gap-1.5 transition-colors"
          >
            {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedResponse ? 'Copied Template' : 'Copy Client Reply'}</span>
          </button>

          {currentAnalysis.classification !== 'IN_SCOPE' && (
            <button
              type="button"
              onClick={handleGenerateProposal}
              disabled={isGeneratingProposal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm inline-flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>{isGeneratingProposal ? 'Generating...' : 'Generate Change Order Proposal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Demo vs Live Notice */}
      <DemoDataNotice
        isDemoData={currentAnalysis.isDemoData}
        onOpenBackendSettings={() => {}}
      />

      {/* Primary Classification & Executive Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">Evaluation Outcome</div>
            <div className="mt-1">
              <ClassificationBadge classification={currentAnalysis.classification} size="lg" />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400">Model Confidence:</span>{' '}
              <span className="font-extrabold text-slate-900">{currentAnalysis.confidenceScore}%</span>
            </div>
            <div>
              <span className="text-slate-400">Action:</span>{' '}
              <span className="font-bold text-indigo-700">
                {currentAnalysis.suggestedAction.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Request Subject & Quote */}
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Incoming Client Message
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {currentAnalysis.requestTitle}
          </h3>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 italic leading-relaxed">
            "{currentAnalysis.requestText}"
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold text-slate-900">Executive Analysis:</div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {currentAnalysis.executiveSummary}
          </p>

          <div className="mt-3 space-y-1.5">
            {currentAnalysis.detailedFindings.map((finding, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                <span>{finding}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Freelancer Tactical Advice */}
        <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs space-y-1">
          <div className="font-bold text-indigo-900 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tactical Freelancer Recommendation</span>
          </div>
          <p className="text-indigo-800 leading-relaxed">
            {currentAnalysis.freelancerRecommendation}
          </p>
        </div>
      </div>

      {/* Contract Evidence Explorer & Extra Cost Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Contract Evidence Clauses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Contractual Evidence</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact clauses extracted from "{contract.title}" relevant to this request
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {currentAnalysis.evidence.length} clauses referenced
            </span>
          </div>

          <div className="space-y-3">
            {currentAnalysis.evidence.map((ev) => (
              <div
                key={ev.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-900">{ev.clauseTitle}</div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-mono text-slate-400">{ev.sectionNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-indigo-700">{ev.relevanceScore}% match</span>
                  </div>
                </div>

                {/* Exact contract snippet */}
                <div className="p-3 bg-slate-50 border-l-3 border-indigo-600 rounded-r-lg font-mono text-xs text-slate-800 leading-relaxed">
                  "{ev.contractSnippet}"
                </div>

                {/* Analysis note */}
                <div className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="font-semibold text-slate-700 shrink-0">Legal Note:</span>
                  <span>{ev.analysisNote}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Cost Estimator */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Cost & Timeline Estimator</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tune parameters before generating the client Change Order
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            {/* Total Highlight */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Recommended Change Order Value
              </span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">
                ${calculatedTotal.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {customHours} hrs @ ${customRate}/hr
              </div>
            </div>

            {/* Slider / Input for Estimated Hours */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Estimated Hours:</span>
                <span className="font-mono font-bold text-slate-900">{customHours} hours</span>
              </div>
              <input
                type="range"
                min="2"
                max="80"
                step="1"
                value={customHours}
                onChange={(e) => setCustomHours(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Min: {currentAnalysis.costEstimate.estimatedHoursMin} hrs</span>
                <span>Max: {currentAnalysis.costEstimate.estimatedHoursMax} hrs</span>
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Billing Rate ($/hr)
              </label>
              <input
                type="number"
                value={customRate}
                onChange={(e) => setCustomRate(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Timeline Impact */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Timeline Impact:</span>
              <span className="font-bold text-slate-900">
                +{currentAnalysis.costEstimate.timelineImpactDays} business days
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Architecture Complexity:</span>
              <span className="font-bold text-indigo-700">
                {currentAnalysis.costEstimate.complexity}
              </span>
            </div>

            {/* CTA */}
            {currentAnalysis.classification !== 'IN_SCOPE' ? (
              <button
                type="button"
                onClick={handleGenerateProposal}
                disabled={isGeneratingProposal}
                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Create Change Proposal (${calculatedTotal.toLocaleString()})</span>
              </button>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 text-center font-medium">
                No extra charge needed. This item is included in your current contract scope.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
