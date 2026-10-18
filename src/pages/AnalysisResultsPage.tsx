import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Scale,
  LayoutDashboard,
  RotateCcw,
  Info,
  Sliders,
  DollarSign,
  AlertCircle
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

  // If no analysis is in state or API returned empty/error
  if (!currentAnalysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 my-8 shadow-xs animate-in fade-in">
        <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
          <FileText className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">No Analysis Results Available</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Please submit a project contract and client request to generate an automated scope evaluation.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setCurrentPage('dashboard')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage('analyze')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-2"
          >
            <span>Go to Request Analyzer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Values directly synchronized with the typed backend response
  const contract = contracts.find((c) => c.id === currentAnalysis.contractId) || activeContract || contracts[0];
  const backendHours = (
    (currentAnalysis.costEstimate.estimatedHoursMin + currentAnalysis.costEstimate.estimatedHoursMax) / 2
  );
  const backendRateINR = currentAnalysis.costEstimate.recommendedHourlyRate;

  // Editable overrides for proposal drafting
  const [adjustedHours, setAdjustedHours] = useState<number>(backendHours);
  const [adjustedRateINR, setAdjustedRateINR] = useState<number>(backendRateINR);

  const calculatedTotalINR = adjustedHours * adjustedRateINR;

  // Determine if this case needs human review warning
  const isNeedsReview =
    currentAnalysis.classification === 'SCOPE_CREEP_RISK' ||
    (currentAnalysis.confidenceScore !== undefined && currentAnalysis.confidenceScore < 90) ||
    currentAnalysis.suggestedAction === 'REQUEST_CLARIFICATION';

  // Format currency in Indian Rupees (INR)
  const formatINR = (val: number): string => {
    return '₹' + Math.round(val).toLocaleString('en-IN');
  };

  // Generate diplomatic client reply template
  const clientResponseTemplate = currentAnalysis.classification === 'IN_SCOPE'
    ? `Hi ${currentAnalysis.clientName.split(' ')[0]},\n\nThank you for sharing this request regarding "${currentAnalysis.requestTitle}".\n\nI checked this against our agreement deliverables. This item is fully covered within our agreed scope, so I will have it incorporated in our current sprint without extra charge.\n\nBest regards,\nAlex`
    : currentAnalysis.suggestedAction === 'REQUEST_CLARIFICATION'
      ? `Hi ${currentAnalysis.clientName.split(' ')[0]},\n\nThank you for reaching out regarding "${currentAnalysis.requestTitle}".\n\nI reviewed the request against our agreement, but it needs further scope review before I can confirm whether it is covered or estimate any additional work. I will follow up once we have clarified the relevant contract details.\n\nBest regards,\nAlex`
      : `Hi ${currentAnalysis.clientName.split(' ')[0]},\n\nThank you for reaching out regarding "${currentAnalysis.requestTitle}".\n\nI reviewed our signed agreement. The requested capability introduces items outside our agreed deliverables schedule. To deliver this with dedicated engineering and QA, I estimate approximately ${adjustedHours} additional hours (${formatINR(calculatedTotalINR)}).\n\nI have prepared an electronic Change Order proposal for your authorization:\nhttps://scopeshield.app/proposals\n\nPlease let me know if you would like to proceed or prioritize this in the next release.\n\nBest regards,\nAlex`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(clientResponseTemplate);
    setCopiedResponse(true);
    showToast({
      type: 'success',
      title: 'Reply Template Copied',
      message: 'Client boundary pushback text copied to your clipboard.',
    });
    setTimeout(() => setCopiedResponse(false), 2500);
  };

  const handleGenerateProposal = async () => {
    setIsGeneratingProposal(true);
    try {
      const result = await createChangeProposal(currentAnalysis, contract, {
        totalAmount: calculatedTotalINR,
        currency: 'INR',
        items: [
          {
            id: `item_${Date.now()}`,
            title: currentAnalysis.requestTitle,
            description: currentAnalysis.executiveSummary,
            estimatedHours: adjustedHours,
            rate: adjustedRateINR,
            subtotal: calculatedTotalINR,
          },
        ],
      });

      if (result.success && result.data) {
        addProposal(result.data);
        setActiveProposal(result.data);
        showToast({
          type: 'success',
          title: 'Proposal Drafted',
          message: `Change Order ${result.data.proposalNumber} is ready for client review.`,
        });
        setCurrentPage('proposal');
      }
    } catch (e: any) {
      showToast({
        type: 'error',
        title: 'Proposal Creation Error',
        message: e.message || 'Unable to generate change proposal.',
      });
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-5xl mx-auto">
      {/* Top Header & Navigation Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Workflow Step 2 of 3</span>
            <span aria-hidden="true">·</span>
            <span>Evaluation Report</span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[200px]">{currentAnalysis.contractTitle}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scope Analysis & Evidence Report
          </h1>
        </div>

        {/* Top Buttons: Return to Dashboard & Create Proposal */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCurrentPage('dashboard')}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </button>

          <button
            type="button"
            onClick={handleCopyTemplate}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{copiedResponse ? 'Copied Template' : 'Copy Client Reply'}</span>
          </button>

          {currentAnalysis.classification !== 'IN_SCOPE' && (
            <button
              type="button"
              onClick={handleGenerateProposal}
              disabled={isGeneratingProposal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2 transition-all hover:shadow"
            >
              <FileText className="w-4 h-4" />
              <span>{isGeneratingProposal ? 'Generating...' : 'Create Proposal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Advisory Distinction Banner: Clearly distinguish AI assessment from final human decision */}
      <div className="p-3.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <Scale className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">AI Advisory Assessment:</span>
            <span className="text-slate-600 ml-1.5">
              This report provides an automated preliminary classification based on contract cross-referencing. The final business and legal determination rests with you and your client.
            </span>
          </div>
        </div>
      </div>

      {/* Demo Notice if Demo/Mock Data */}
      {currentAnalysis.isDemoData && (
        <DemoDataNotice isDemoData={true} onOpenBackendSettings={() => setCurrentPage('settings')} />
      )}

      {/* Human-Review Warning for Uncertain or Ambiguous Cases */}
      {isNeedsReview && (
        <div
          role="alert"
          className="p-5 bg-amber-50/90 border-2 border-amber-300 rounded-2xl text-xs text-amber-900 space-y-2 shadow-2xs animate-in fade-in"
        >
          <div className="flex items-center gap-2 font-extrabold text-amber-900 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Human Review Required — Uncertain Scope Boundary</span>
          </div>
          <p className="leading-relaxed text-amber-800">
            This request introduces deliverables that do not map directly to an explicit contractual exclusion nor a guaranteed deliverable.
            <strong> Missing contract evidence must NOT be treated as proof that work is out of scope.</strong> Many project agreements omit routine adjustments.
          </p>
          <div className="pt-1 text-[11px] font-semibold text-amber-900 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Recommendation: Schedule a brief 10-minute scope alignment discussion with the client before issuing a Change Order or refusing work.</span>
          </div>
        </div>
      )}

      {/* Primary Classification & Short Explanation Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Classification Assessment
            </span>
            <div className="mt-1.5 flex items-center gap-3">
              <ClassificationBadge classification={currentAnalysis.classification} size="lg" />
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {currentAnalysis.confidenceScore !== undefined
                  ? `${currentAnalysis.confidenceScore}% Confidence`
                  : 'Confidence not provided'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Recommended Action
              </span>
              <span className="font-bold text-indigo-700 text-xs">
                {currentAnalysis.suggestedAction.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Incoming Client Request Recap */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Evaluated Client Request
          </span>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 italic leading-relaxed">
            "{currentAnalysis.requestText}"
          </div>
        </div>

        {/* Short Explanation of the Result */}
        <div className="space-y-2 pt-1">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Short Explanation of Result
          </h2>
          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            {currentAnalysis.executiveSummary}
          </p>

          {currentAnalysis.detailedFindings && currentAnalysis.detailedFindings.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              {currentAnalysis.detailedFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" aria-hidden="true" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Freelancer Tactical Advice */}
        {currentAnalysis.freelancerRecommendation && (
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-700" />
              <span>Consultant Boundary Strategy</span>
            </div>
            <p className="leading-relaxed text-indigo-800">
              {currentAnalysis.freelancerRecommendation}
            </p>
          </div>
        )}
      </div>

      {/* Grid: Supporting Contract Clauses & Cost Estimator in INR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Supporting Contract Clauses and Explanations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Supporting Contract Clauses</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact clauses extracted from the uploaded contract and their analysis
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {currentAnalysis.evidence ? currentAnalysis.evidence.length : 0} clauses cited
            </span>
          </div>

          {/* DO NOT FABRICATE EVIDENCE: Check if evidence exists */}
          {!currentAnalysis.evidence || currentAnalysis.evidence.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2">
              <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800">No Specific Contract Clauses Cited</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                The backend did not locate an exact verbatim clause governing this item.
              </p>
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-[11px] text-slate-600">
                <span className="font-bold text-slate-700">Important Legal Context:</span> Missing contractual evidence does not automatically confirm that an item is out of scope. Freelancers should review initial emails or discuss intent directly with the client.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {currentAnalysis.evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-bold text-slate-900">{ev.clauseTitle}</div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="font-mono text-slate-400">{ev.sectionNumber}</span>
                      {ev.relevanceScore !== undefined && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-indigo-700">{ev.relevanceScore}% match</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Verbatim snippet */}
                  <blockquote className="p-3 bg-slate-50 border-l-3 border-indigo-600 rounded-r-xl font-mono text-xs text-slate-800 leading-relaxed">
                    "{ev.contractSnippet}"
                  </blockquote>

                  {/* Backend Explanation of Clause */}
                  <div className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-900 shrink-0">Explanation:</span>
                    <span>{ev.analysisNote}</span>
                  </div>
                </div>
              ))}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
                <span className="font-bold text-slate-700">Contract Evidence Integrity:</span> Only authentic clauses returned by the backend analysis engine are displayed. No artificial clauses are synthesized.
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Estimated Extra Hours, Rate (INR), and Extra Cost (INR) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Estimated Effort & Cost (INR)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Synchronized with backend response in Indian Rupees (₹)
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            {/* Main Calculated Cost Highlight */}
            <div className="p-5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-center space-y-1">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                Estimated Extra Cost (INR)
              </span>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {formatINR(calculatedTotalINR)}
              </div>
              <div className="text-xs text-slate-600 font-medium">
                {adjustedHours} hrs @ {formatINR(adjustedRateINR)}/hr
              </div>
            </div>

            {/* Metric 1: Estimated Extra Hours */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Estimated Extra Hours:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {adjustedHours} hours
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={adjustedHours}
                onChange={(e) => setAdjustedHours(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
                aria-label="Adjust estimated extra hours"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Min: {currentAnalysis.costEstimate.estimatedHoursMin} hrs</span>
                <span>Max: {currentAnalysis.costEstimate.estimatedHoursMax} hrs</span>
              </div>
            </div>

            {/* Metric 2: Hourly Rate in INR */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Hourly Rate (INR):</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatINR(adjustedRateINR)}/hr
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400 font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={adjustedRateINR}
                  onChange={(e) => setAdjustedRateINR(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  aria-label="Adjust hourly rate in INR"
                />
              </div>
            </div>

            {/* Reset to Backend Defaults button */}
            {(adjustedHours !== backendHours || adjustedRateINR !== backendRateINR) && (
              <button
                type="button"
                onClick={() => {
                  setAdjustedHours(backendHours);
                  setAdjustedRateINR(backendRateINR);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Backend Response Values</span>
              </button>
            )}

            {/* Timeline & Complexity metadata */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Timeline Impact:</span>
                <span className="font-bold text-slate-900">
                  {currentAnalysis.costEstimate.timelineImpactDays !== undefined
                    ? `+${currentAnalysis.costEstimate.timelineImpactDays} business days`
                    : 'Not provided by backend'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Technical Complexity:</span>
                <span className="font-bold text-indigo-700">
                  {currentAnalysis.costEstimate.complexity || 'Not provided by backend'}
                </span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 space-y-2">
              {currentAnalysis.classification !== 'IN_SCOPE' ? (
                <button
                  type="button"
                  onClick={handleGenerateProposal}
                  disabled={isGeneratingProposal}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all hover:shadow"
                >
                  <FileText className="w-4 h-4" />
                  <span>Create Proposal ({formatINR(calculatedTotalINR)})</span>
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-center font-medium">
                  Covered by project contract. No Change Order needed.
                </div>
              )}

              <button
                type="button"
                onClick={() => setCurrentPage('dashboard')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
