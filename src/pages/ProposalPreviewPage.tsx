import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Send,
  CheckCircle,
  Copy,
  Printer,
  Download,
  Clock,
  ShieldCheck,
  Check,
  User,
  Building,
  Mail,
  Scale,
  RotateCcw,
  Info,
  XCircle,
  LayoutDashboard,
  Calculator,
  ChevronDown,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { ProposalStatus, ContractEvidence } from '../types';
import { DemoDataNotice } from '../components/common/DemoDataNotice';

export const ProposalPreviewPage: React.FC = () => {
  const {
    activeProposal,
    proposals,
    setActiveProposal,
    updateProposalStatus,
    updateProposalDetails,
    currentAnalysis,
    setCurrentPage,
    currentUser,
    showToast,
  } = useApp();

  // Local editable state initialized from activeProposal
  const [projectTitle, setProjectTitle] = useState(activeProposal?.projectTitle || '');
  const [clientName, setClientName] = useState(activeProposal?.clientName || '');
  const [clientCompany, setClientCompany] = useState(activeProposal?.clientCompany || '');
  const [clientEmail, setClientEmail] = useState(activeProposal?.clientEmail || '');
  const [workTitle, setWorkTitle] = useState(
    activeProposal?.title || 'Scope Adjustment: Additional Deliverables'
  );
  const [workDescription, setWorkDescription] = useState(
    activeProposal?.items?.[0]?.description ||
    activeProposal?.whyOutOfScopeReason ||
    'Implementation, testing, and integration of requested additional capabilities.'
  );

  // Extra hours & hourly rate in INR
  const initialHours = activeProposal?.items?.[0]?.estimatedHours || 24;
  const initialRate = activeProposal?.items?.[0]?.rate || 8500;
  const [extraHours, setExtraHours] = useState<number>(initialHours);
  const [hourlyRateINR, setHourlyRateINR] = useState<number>(initialRate);

  // Editable cover message and terms
  const [coverMessage, setCoverMessage] = useState(
    activeProposal?.executiveSummary ||
    'Per our project agreement, the requested features represent unbudgeted out-of-scope work. This proposal details the estimated hours, timeline, and fee schedule required to deliver these items without compromising ongoing sprint milestones.'
  );
  const [terms, setTerms] = useState(
    activeProposal?.terms ||
    'Payment terms: 50% deposit upon acceptance, 50% upon milestone delivery. Delivery timeline commences upon receipt of required access.'
  );

  // Approval status: Draft, Sent, Approved, or Rejected (Default is DRAFT)
  const [status, setStatus] = useState<ProposalStatus>(activeProposal?.status || 'DRAFT');

  // Interactive UI states
  const [copiedText, setCopiedText] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sync state whenever activeProposal selection changes
  useEffect(() => {
    if (activeProposal) {
      setProjectTitle(activeProposal.projectTitle);
      setClientName(activeProposal.clientName);
      setClientCompany(activeProposal.clientCompany || 'Client Organization');
      setClientEmail(activeProposal.clientEmail || 'client@example.com');
      setWorkTitle(activeProposal.title);
      setWorkDescription(
        activeProposal.items?.[0]?.description ||
        activeProposal.whyOutOfScopeReason ||
        'Implementation and testing of requested capabilities.'
      );
      setExtraHours(activeProposal.items?.[0]?.estimatedHours || 24);
      setHourlyRateINR(activeProposal.items?.[0]?.rate || 8500);
      setCoverMessage(activeProposal.executiveSummary);
      setTerms(activeProposal.terms);
      setStatus(activeProposal.status || 'DRAFT');
    }
  }, [activeProposal?.id]);

  if (!activeProposal) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 my-8 shadow-xs animate-in fade-in">
        <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
          <FileText className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Proposal Selected</h2>
        <p className="text-xs text-slate-500">
          Run a scope analysis to generate a Change Order proposal, or choose an existing draft from your records.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setCurrentPage('tracking')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Approval Tracking
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage('analyze')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Analyze Request
          </button>
        </div>
      </div>
    );
  }

  // Cost calculation: estimated extra hours multiplied by hourly rate
  const safeHours = Math.max(0, Number(extraHours) || 0);
  const safeRate = Math.max(0, Number(hourlyRateINR) || 0);
  const totalCostINR = safeHours * safeRate;

  // Format currency helper in INR (Indian Rupee format)
  const formatINR = (amount: number): string => {
    return '₹' + Math.round(amount).toLocaleString('en-IN');
  };

  // Helper to persist changes into AppContext
  const saveChanges = (overrides?: {
    projectTitle?: string;
    clientName?: string;
    clientCompany?: string;
    clientEmail?: string;
    workTitle?: string;
    workDescription?: string;
    extraHours?: number;
    hourlyRateINR?: number;
    coverMessage?: string;
    terms?: string;
    status?: ProposalStatus;
  }) => {
    const finalProjectTitle = overrides?.projectTitle ?? projectTitle;
    const finalClientName = overrides?.clientName ?? clientName;
    const finalClientCompany = overrides?.clientCompany ?? clientCompany;
    const finalClientEmail = overrides?.clientEmail ?? clientEmail;
    const finalWorkTitle = overrides?.workTitle ?? workTitle;
    const finalWorkDesc = overrides?.workDescription ?? workDescription;
    const finalHours = overrides?.extraHours ?? safeHours;
    const finalRate = overrides?.hourlyRateINR ?? safeRate;
    const finalCost = finalHours * finalRate;
    const finalCover = overrides?.coverMessage ?? coverMessage;
    const finalTerms = overrides?.terms ?? terms;
    const finalStatus = overrides?.status ?? status;

    updateProposalDetails(activeProposal.id, {
      projectTitle: finalProjectTitle,
      clientName: finalClientName,
      clientCompany: finalClientCompany,
      clientEmail: finalClientEmail,
      title: finalWorkTitle,
      executiveSummary: finalCover,
      terms: finalTerms,
      totalAmount: finalCost,
      currency: 'INR',
      status: finalStatus,
      items: [
        {
          id: activeProposal.items?.[0]?.id || `item_${Date.now()}`,
          title: finalWorkTitle,
          description: finalWorkDesc,
          estimatedHours: finalHours,
          rate: finalRate,
          subtotal: finalCost,
        },
      ],
    });
  };

  // Explicit status change handler (Draft, Sent, Approved, Rejected)
  const handleStatusChange = (newStatus: ProposalStatus) => {
    setStatus(newStatus);
    updateProposalStatus(activeProposal.id, newStatus, `Status updated to ${newStatus}`);
    saveChanges({ status: newStatus });
    showToast({
      type: 'info',
      title: 'Status Updated',
      message: `Proposal ${activeProposal.proposalNumber} marked as ${newStatus}.`,
    });
  };

  // Extract supporting contract evidence from analysis without fabricating
  const evidenceList: ContractEvidence[] =
    currentAnalysis && currentAnalysis.contractId === activeProposal.contractId
      ? currentAnalysis.evidence
      : [];

  // Compile formatted proposal text for clipboard and download
  const compileProposalText = (): string => {
    const evidenceSection =
      evidenceList.length > 0
        ? evidenceList
            .map(
              (ev, idx) =>
                `[Evidence Citation #${idx + 1}]
Clause: ${ev.clauseTitle} (${ev.sectionNumber})
Snippet: "${ev.contractSnippet}"
Analysis Explanation: ${ev.analysisNote}`
            )
            .join('\n\n')
        : `SUPPORTING CONTRACT BASELINE:
${activeProposal.whyOutOfScopeReason || 'This request introduces deliverables not specified in the signed deliverables schedule.'}
(Note: Work is classified as outside the primary agreed deliverables schedule. Missing clause evidence is not treated as proof of out-of-scope work; it reflects tasks absent from the agreed statement of work.)`;

    return `=====================================================
CHANGE ORDER PROPOSAL: ${activeProposal.proposalNumber}
ScopeShield AI — Freelance Scope Adjustment Notice
Approval Status: ${status} | Date: ${activeProposal.createdAt.split('T')[0]}
=====================================================

1. PROJECT & CLIENT DETAILS:
Project Title: ${projectTitle}
Client Organization: ${clientCompany}
Client Contact: ${clientName} (${clientEmail})
Contractor / Studio: ${currentUser.companyName} (${currentUser.name})

2. SUMMARY OF REQUESTED ADDITIONAL WORK:
${workTitle}
Description & Deliverables:
${workDescription}

3. SUPPORTING CONTRACT EVIDENCE:
${evidenceSection}

4. SCOPE & FEE CALCULATION (INR):
Estimated Extra Hours: ${safeHours} hrs
Hourly Billing Rate: ${formatINR(safeRate)} / hr
Total Estimated Cost: ${formatINR(totalCostINR)} INR (${safeHours} hrs × ${formatINR(safeRate)}/hr)

5. PROPOSAL MESSAGE / COVER NOTE:
${coverMessage}

6. PROPOSED TERMS & MILESTONES:
${terms}

COMMERCIAL DISCLAIMER:
Notice: This document is a commercial Change Order proposal and fee estimate for client review. It is not a legally binding contract or substitute for licensed legal counsel.
=====================================================`;
  };

  // Copy proposal using Clipboard API
  const handleCopyProposal = async () => {
    try {
      const text = compileProposalText();
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      showToast({
        type: 'success',
        title: 'Proposal Copied to Clipboard',
        message: 'Complete Change Order proposal and fee schedule copied.',
      });
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Clipboard Copy Failed',
        message: 'Unable to access clipboard. Please select and copy manually.',
      });
    }
  };

  // Reliable file download
  const handleDownloadProposal = () => {
    setIsDownloading(true);
    try {
      const text = compileProposalText();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Change_Order_${activeProposal.proposalNumber}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        title: 'Proposal Downloaded',
        message: `Saved Change_Order_${activeProposal.proposalNumber}.txt`,
      });
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Unable to initiate file download.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Reliable print using window.print()
  const handlePrintProposal = () => {
    saveChanges();
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-4xl mx-auto">
      {/* Top Header & Proposal Selector (Hidden during Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Workflow Step 3 of 3</span>
            <span aria-hidden="true">·</span>
            <span>Change Proposal Preview</span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={activeProposal.id}
              onChange={(e) => {
                const found = proposals.find((p) => p.id === e.target.value);
                if (found) setActiveProposal(found);
              }}
              className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight bg-transparent border-b-2 border-indigo-600 focus:outline-none cursor-pointer pr-4"
              aria-label="Select proposal to view"
            >
              {proposals.map((p) => (
                <option key={p.id} value={p.id} className="text-sm font-normal">
                  {p.proposalNumber} — {p.clientCompany} ({formatINR(p.totalAmount)})
                </option>
              ))}
            </select>

            {/* Approval Status Badge */}
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                status === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : status === 'REJECTED' || status === 'DECLINED'
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : status === 'SENT'
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              {status === 'DRAFT' && '[Draft] '}
              Status: {status === 'DECLINED' ? 'Rejected' : status}
            </span>
          </div>
        </div>

        {/* Action Buttons: Copy, Download, Print, Dashboard */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Proposal Button using Clipboard API */}
          <button
            type="button"
            onClick={handleCopyProposal}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Copy formatted proposal to clipboard"
          >
            {copiedText ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Proposal'}</span>
          </button>

          {/* Download Text Proposal */}
          <button
            type="button"
            onClick={handleDownloadProposal}
            disabled={isDownloading}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Download Change Order text document"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download .txt</span>
          </button>

          {/* Print Proposal */}
          <button
            type="button"
            onClick={handlePrintProposal}
            className="p-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Print proposal document"
            aria-label="Print proposal document"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage('dashboard')}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Demo Data Notice (Strictly labeled when viewing demo proposals) */}
      {activeProposal.isDemoData && (
        <div className="print:hidden">
          <DemoDataNotice
            isDemoData={true}
            onOpenBackendSettings={() => setCurrentPage('settings')}
          />
        </div>
      )}

      {/* Legal Boundary Notice (Do not describe this as a legally binding contract) */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 print:hidden">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Commercial Proposal Notice:</span> This document represents a commercial Change Order proposal and fee estimate for client review. It is not a legally binding contract or substitute for licensed legal counsel.
        </div>
      </div>

      {/* Approval Status Selector: Draft, Sent, Approved, or Rejected */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <span className="text-xs font-bold text-slate-900 block">Approval Status</span>
          <span className="text-[11px] text-slate-500">
            Proposals are created as Drafts and remain labeled as Draft until you explicitly change status.
          </span>
        </div>

        {/* 4 Explicit Statuses: Draft, Sent, Approved, Rejected */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleStatusChange('DRAFT')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              status === 'DRAFT'
                ? 'bg-amber-100 text-amber-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('SENT')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              status === 'SENT'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Sent</span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('APPROVED')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              status === 'APPROVED'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Approved</span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('REJECTED')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              status === 'REJECTED' || status === 'DECLINED'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </button>
        </div>
      </div>

      {/* Main Printable Change Order Document */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-lg">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <span>{currentUser.companyName}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
              <div>Consultant: {currentUser.name}</div>
              <div>Email: {currentUser.email}</div>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">CHANGE ORDER PROPOSAL</h1>
            <div className="text-xs font-mono font-bold text-slate-500">{activeProposal.proposalNumber}</div>
            <div className="text-xs text-slate-500">
              Date: <span className="font-semibold text-slate-700">{activeProposal.createdAt.split('T')[0]}</span>
            </div>
            <div className="text-xs text-slate-500">
              Current Status:{' '}
              <span
                className={`font-bold uppercase ${
                  status === 'APPROVED'
                    ? 'text-emerald-700'
                    : status === 'REJECTED' || status === 'DECLINED'
                    ? 'text-rose-700'
                    : status === 'SENT'
                    ? 'text-indigo-700'
                    : 'text-amber-700'
                }`}
              >
                {status === 'DRAFT' ? '[DRAFT]' : status === 'DECLINED' ? 'REJECTED' : status}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Editable Project & Client Fields */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Project & Client Details</span>
              <span className="text-[10px] font-normal text-slate-400 print:hidden">(Editable)</span>
            </h2>
            <span className="text-[11px] text-slate-400 print:hidden">Click to customize</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            {/* Project Title */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600">
                Project Title / Agreement Ref
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => {
                  const val = e.target.value;
                  setProjectTitle(val);
                  saveChanges({ projectTitle: val });
                }}
                className="w-full px-3 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Client Organization */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600">
                Client Organization / Company
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => {
                  const val = e.target.value;
                  setClientCompany(val);
                  saveChanges({ clientCompany: val });
                }}
                className="w-full px-3 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Client Contact Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600">
                Client Primary Contact
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => {
                  const val = e.target.value;
                  setClientName(val);
                  saveChanges({ clientName: val });
                }}
                className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Client Contact Email */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600">
                Client Contact Email
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => {
                  const val = e.target.value;
                  setClientEmail(val);
                  saveChanges({ clientEmail: val });
                }}
                className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Summary of Requested Additional Work */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span>2. Summary of Requested Additional Work</span>
            <span className="text-[10px] font-normal text-slate-400 print:hidden">(Editable)</span>
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              value={workTitle}
              onChange={(e) => {
                const val = e.target.value;
                setWorkTitle(val);
                saveChanges({ workTitle: val });
              }}
              placeholder="Title of requested feature or capability"
              className="w-full px-3.5 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              rows={3}
              value={workDescription}
              onChange={(e) => {
                const val = e.target.value;
                setWorkDescription(val);
                saveChanges({ workDescription: val });
              }}
              placeholder="Itemize the exact tasks, deliverables, and technical implementation..."
              className="w-full p-3 text-xs text-slate-700 leading-relaxed bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 3. Supporting Contract Evidence from Analysis */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              3. Supporting Contract Evidence (Analysis Citation)
            </h2>
            <span className="text-[10px] text-slate-400">Strictly ground in contract text</span>
          </div>

          {evidenceList.length > 0 ? (
            <div className="space-y-3">
              {evidenceList.map((ev, index) => (
                <div
                  key={ev.id || index}
                  className="p-4 bg-slate-50 border-l-4 border-indigo-600 rounded-r-2xl space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span>{ev.clauseTitle}</span>
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">{ev.sectionNumber}</span>
                  </div>
                  <blockquote className="text-xs font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                    "{ev.contractSnippet}"
                  </blockquote>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-800">Analysis Explanation: </span>
                    {ev.analysisNote}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Scale className="w-4 h-4 text-slate-500" />
                <span>Scope Baseline Reference:</span>
              </div>
              <p>
                {activeProposal.whyOutOfScopeReason ||
                  'The requested work is classified as outside the primary agreed deliverables schedule.'}
              </p>
              <p className="text-[11px] text-slate-400 italic">
                Note: Missing explicit clause citation indicates tasks not enumerated in the statement of work; missing evidence is not treated as proof of out-of-scope work on its own.
              </p>
            </div>
          )}
        </div>

        {/* 4. Estimated Extra Hours, Hourly Rate (INR) & Cost Calculation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>4. Scope Calculation: Extra Hours & Hourly Rate (INR)</span>
              <span className="text-[10px] font-normal text-slate-400 print:hidden">(Editable)</span>
            </h2>
            <span className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" />
              <span>Recalculates automatically</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Input: Extra Hours */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600">
                Estimated Extra Hours
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={extraHours}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setExtraHours(val);
                    saveChanges({ extraHours: val });
                  }}
                  className="w-full px-3 py-1.5 text-sm font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500 font-semibold">hrs</span>
              </div>
            </div>

            {/* Input: Hourly Rate in INR */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600">
                Hourly Rate (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1.5 text-sm font-bold text-slate-400 font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  min="100"
                  step="500"
                  value={hourlyRateINR}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setHourlyRateINR(val);
                    saveChanges({ hourlyRateINR: val });
                  }}
                  className="w-full pl-7 pr-3 py-1.5 text-sm font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Cost Calculation Display: Hours × Rate in INR */}
            <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200 text-right space-y-1 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
                Total Calculated Cost (INR)
              </span>
              <div className="text-2xl font-extrabold text-indigo-950 font-mono">
                {formatINR(totalCostINR)}
              </div>
              <div className="text-[11px] text-indigo-700 font-medium font-mono">
                {safeHours} hrs × {formatINR(safeRate)}/hr
              </div>
            </div>
          </div>
        </div>

        {/* 5. Editable Proposal Message (Cover Letter to Client) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span>5. Proposal Message / Client Cover Letter</span>
            <span className="text-[10px] font-normal text-slate-400 print:hidden">(Editable)</span>
          </h2>
          <textarea
            rows={4}
            value={coverMessage}
            onChange={(e) => {
              const val = e.target.value;
              setCoverMessage(val);
              saveChanges({ coverMessage: val });
            }}
            placeholder="Executive note explaining why this proposal is needed..."
            className="w-full p-3.5 text-xs text-slate-700 leading-relaxed bg-white border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 6. Terms & Conditions (Editable) */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span>6. Proposed Terms & Milestones</span>
            <span className="text-[10px] font-normal text-slate-400 print:hidden">(Editable)</span>
          </h2>
          <textarea
            rows={2}
            value={terms}
            onChange={(e) => {
              const val = e.target.value;
              setTerms(val);
              saveChanges({ terms: val });
            }}
            className="w-full p-3 text-xs text-slate-700 leading-relaxed bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Bottom Commercial Disclaimer (Non-binding commercial fee estimate) */}
        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 text-center leading-relaxed space-y-1">
          <div className="font-semibold text-slate-700">Commercial Estimate Notice</div>
          <p>
            Notice: This document is a commercial Change Order proposal and fee estimate for client review. It is not a formal legally binding contract or substitute for licensed legal counsel.
          </p>
        </div>
      </div>
    </div>
  );
};
