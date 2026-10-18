import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Send,
  CheckCircle,
  Copy,
  Printer,
  Eye,
  Edit3,
  Calendar,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ProposalItem } from '../types';
import { DemoDataNotice } from '../components/common/DemoDataNotice';

export const ProposalPreviewPage: React.FC = () => {
  const {
    activeProposal,
    proposals,
    setActiveProposal,
    updateProposalStatus,
    updateProposalDetails,
    setCurrentPage,
    currentUser,
    showToast,
  } = useApp();

  const [viewMode, setViewMode] = useState<'FREELANCER_EDIT' | 'CLIENT_PREVIEW'>('FREELANCER_EDIT');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [clientSignerName, setClientSignerName] = useState('');

  if (!activeProposal) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Proposal Selected</h2>
        <p className="text-xs text-slate-500">
          Select an existing change order or run a scope analysis to generate a new proposal.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setCurrentPage('tracking')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
          >
            View All Proposals
          </button>
          <button
            onClick={() => setCurrentPage('analyze')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
          >
            Analyze Request
          </button>
        </div>
      </div>
    );
  }

  const shareableUrl = `https://scopeshield.app/p/${activeProposal.shareableToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    showToast({
      type: 'success',
      title: 'Review Link Copied',
      message: 'Share this link directly with the client for digital acceptance.',
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendToClient = () => {
    setIsSending(true);
    setTimeout(() => {
      updateProposalStatus(
        activeProposal.id,
        'SENT',
        `Dispatched electronic change order to ${activeProposal.clientEmail}`
      );
      setIsSending(false);
      showToast({
        type: 'success',
        title: 'Proposal Dispatched',
        message: `Change Order ${activeProposal.proposalNumber} sent to ${activeProposal.clientName} (${activeProposal.clientEmail}).`,
      });
    }, 700);
  };

  const handleSimulateClientApproval = () => {
    const signer = clientSignerName.trim() || activeProposal.clientName;
    updateProposalStatus(
      activeProposal.id,
      'APPROVED',
      `Digitally signed and accepted by ${signer}`
    );
    showToast({
      type: 'success',
      title: 'Proposal Approved!',
      message: `${signer} accepted Change Order ${activeProposal.proposalNumber} for $${activeProposal.totalAmount.toLocaleString()}.`,
    });
  };

  const handleSimulateClientDecline = () => {
    updateProposalStatus(
      activeProposal.id,
      'DECLINED',
      'Client decided to defer this feature to Phase 2.'
    );
    showToast({
      type: 'info',
      title: 'Proposal Declined',
      message: `Client declined ${activeProposal.proposalNumber}. Scope remains protected.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Workflow Step 3 of 3</span>
            <span aria-hidden="true">·</span>
            <span>Formal Change Order Document</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={activeProposal.id}
              onChange={(e) => {
                const found = proposals.find((p) => p.id === e.target.value);
                if (found) setActiveProposal(found);
              }}
              className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight bg-transparent border-b-2 border-indigo-600 focus:outline-none cursor-pointer pr-4"
            >
              {proposals.map((p) => (
                <option key={p.id} value={p.id} className="text-sm font-normal">
                  {p.proposalNumber} — {p.clientCompany} (${p.totalAmount.toLocaleString()})
                </option>
              ))}
            </select>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {activeProposal.status}
            </span>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Mode Control */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('FREELANCER_EDIT')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'FREELANCER_EDIT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Freelancer View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CLIENT_PREVIEW')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'CLIENT_PREVIEW'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Client Review Portal</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg inline-flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors"
            title="Print or Export as PDF"
          >
            <Printer className="w-4 h-4" />
          </button>

          {activeProposal.status === 'DRAFT' && (
            <button
              type="button"
              onClick={handleSendToClient}
              disabled={isSending}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Send to Client'}</span>
            </button>
          )}
        </div>
      </div>

      <DemoDataNotice
        isDemoData={activeProposal.isDemoData}
        onOpenBackendSettings={() => {}}
      />

      {/* Main Document Canvas */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-lg">
              <ShieldCheck className="w-6 h-6" />
              <span>{currentUser.companyName}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 leading-relaxed">
              <div>Contractor: {currentUser.name}</div>
              <div>Email: {currentUser.email}</div>
              <div>Consultancy: Web & Cloud Architecture</div>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="text-xl font-extrabold text-slate-900">CHANGE ORDER PROPOSAL</div>
            <div className="text-xs font-mono text-slate-500">{activeProposal.proposalNumber}</div>
            <div className="text-xs text-slate-500">
              Date: <span className="font-semibold text-slate-700">{activeProposal.createdAt.split('T')[0]}</span>
            </div>
            <div className="text-xs text-slate-500">
              Valid Until: <span className="font-semibold text-slate-700">{activeProposal.validUntil}</span>
            </div>
          </div>
        </div>

        {/* Client & Project Reference Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200/80 text-xs">
          <div>
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Prepared For
            </div>
            <div className="font-extrabold text-slate-900 text-sm mt-1">
              {activeProposal.clientCompany}
            </div>
            <div className="text-slate-600 mt-0.5">{activeProposal.clientName}</div>
            <div className="text-slate-500">{activeProposal.clientEmail}</div>
          </div>

          <div>
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Master Agreement Reference
            </div>
            <div className="font-extrabold text-slate-900 text-sm mt-1">
              {activeProposal.projectTitle}
            </div>
            <div className="text-slate-600 mt-0.5">
              Contract ID: <span className="font-mono">{activeProposal.contractId}</span>
            </div>
            <div className="text-indigo-700 font-medium mt-1">
              Estimated Delivery: {activeProposal.timelineEstimate}
            </div>
          </div>
        </div>

        {/* Executive Justification / Out-of-Scope Rationale */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            1. Scope Adjustment Justification
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {activeProposal.executiveSummary}
          </p>
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
            <span className="font-bold">Contractual Baseline: </span>
            {activeProposal.whyOutOfScopeReason}
          </div>
        </div>

        {/* Deliverables & Line Items Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            2. Proposed Deliverables & Fee Schedule
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3.5">Deliverable Description</th>
                  <th className="p-3.5 text-center">Hours</th>
                  <th className="p-3.5 text-right">Rate</th>
                  <th className="p-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeProposal.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                        {item.description}
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-mono text-slate-700">
                      {item.estimatedHours} hrs
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-700">
                      ${item.rate}/hr
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      ${item.subtotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-900">
                <tr>
                  <td colSpan={3} className="p-3.5 text-right uppercase tracking-wider text-xs">
                    Total Change Order Value ({activeProposal.currency}):
                  </td>
                  <td className="p-3.5 text-right text-base font-extrabold font-mono text-indigo-700">
                    ${activeProposal.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Terms & Payment Conditions */}
        <div className="space-y-2 text-xs text-slate-600">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            3. Terms & Conditions
          </h3>
          <p className="leading-relaxed text-slate-700">
            {activeProposal.terms}
          </p>
          <p className="text-[11px] text-slate-500">
            Work will begin immediately upon electronic acceptance. All intellectual property provisions of the original Master Agreement remain in full force.
          </p>
        </div>

        {/* Client Acceptance & Signature Portal */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              4. Client Acceptance & Authorization
            </h3>
            <span className="text-xs text-slate-500">
              Status: <span className="font-bold text-indigo-700">{activeProposal.status}</span>
            </span>
          </div>

          {activeProposal.status === 'APPROVED' ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Digitally Signed & Authorized</span>
              </div>
              <p className="text-xs text-emerald-700">
                Accepted by <span className="font-semibold">{activeProposal.clientName}</span> on{' '}
                {activeProposal.respondedAt ? activeProposal.respondedAt.split('T')[0] : 'today'}. Scope approved for delivery.
              </p>
              {activeProposal.clientFeedback && (
                <div className="mt-2 p-2.5 bg-white/80 rounded border border-emerald-200 text-xs italic text-emerald-900">
                  Client note: "{activeProposal.clientFeedback}"
                </div>
              )}
            </div>
          ) : activeProposal.status === 'DECLINED' ? (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Proposal Declined by Client</span>
              </div>
              <p className="text-xs text-rose-700">
                Client elected not to proceed with this scope extension. Your contracted timeline and project margin remain fully protected.
              </p>
            </div>
          ) : (
            /* Pending / Simulator for Evaluator */
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="text-xs text-slate-600">
                To authorize this change order, the client enters their name and clicks "Accept Proposal".
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={clientSignerName}
                  onChange={(e) => setClientSignerName(e.target.value)}
                  placeholder={`Authorized Signer (e.g. ${activeProposal.clientName})`}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={handleSimulateClientApproval}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Authorize & Sign ($ {activeProposal.totalAmount.toLocaleString()})</span>
                </button>
                <button
                  type="button"
                  onClick={handleSimulateClientDecline}
                  className="px-4 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
