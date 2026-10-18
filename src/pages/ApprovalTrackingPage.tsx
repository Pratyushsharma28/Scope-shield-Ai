import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  KanbanSquare,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Eye,
  AlertCircle,
  DollarSign,
  Send,
  ArrowRight,
  TrendingUp,
  FileText,
  Calendar,
  MoreVertical,
  Plus
} from 'lucide-react';
import { Proposal, ProposalStatus } from '../types';
import { DemoDataNotice } from '../components/common/DemoDataNotice';

export const ApprovalTrackingPage: React.FC = () => {
  const {
    proposals,
    setActiveProposal,
    updateProposalStatus,
    setCurrentPage,
    backendConfig,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | ProposalStatus>('ALL');

  // Format INR helper
  const formatINR = (val: number): string => {
    return '₹' + Math.round(val).toLocaleString('en-IN');
  };

  // 4 Primary Status Columns requested: Draft, Sent, Approved, Rejected
  const columns: { id: ProposalStatus; label: string; dotColor: string }[] = [
    { id: 'DRAFT', label: 'Draft', dotColor: 'bg-amber-400' },
    { id: 'SENT', label: 'Sent', dotColor: 'bg-indigo-500' },
    { id: 'APPROVED', label: 'Approved', dotColor: 'bg-emerald-500' },
    { id: 'REJECTED', label: 'Rejected', dotColor: 'bg-rose-500' },
  ];

  const filteredProposals = proposals.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.proposalNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'ALL') return matchesSearch;
    // Map DECLINED to REJECTED or VIEWED to SENT for filtering
    const effectiveStatus = p.status === 'DECLINED' ? 'REJECTED' : p.status === 'VIEWED' ? 'SENT' : p.status;
    return matchesSearch && effectiveStatus === selectedFilter;
  });

  const totalApprovedValue = proposals
    .filter((p) => p.status === 'APPROVED')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const totalSentValue = proposals
    .filter((p) => p.status === 'SENT' || p.status === 'VIEWED')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const approvalRate = Math.round(
    (proposals.filter((p) => p.status === 'APPROVED').length /
      (proposals.filter((p) => p.status === 'APPROVED' || p.status === 'REJECTED' || p.status === 'DECLINED').length || 1)) *
      100
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Workflow Step 4 of 4</span>
            <span aria-hidden="true">·</span>
            <span>Lifecycle Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Proposal Approval Tracking
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Track client review statuses, verify digital sign-offs, and monitor recovered unbudgeted scope revenue.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage('analyze')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Scope Check</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Approved Extra Revenue
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {formatINR(totalApprovedValue)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold inline-flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {approvalRate}%
            </span>
            <span>historical client acceptance rate</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Awaiting Client Signature
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {formatINR(totalSentValue)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span>{proposals.filter((p) => p.status === 'SENT' || p.status === 'VIEWED').length} active proposals dispatched</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Protected Hours
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {proposals.reduce((sum, p) => sum + p.items.reduce((acc, i) => acc + i.estimatedHours, 0), 0)} hrs
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span>Hours accounted for rather than lost to free revisions</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search proposals, clients, or numbers..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 4 Status Filter Tabs: All, Draft, Sent, Approved, Rejected */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({proposals.length})
          </button>
          <button
            onClick={() => setSelectedFilter('DRAFT')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              selectedFilter === 'DRAFT'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => setSelectedFilter('SENT')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              selectedFilter === 'SENT'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sent
          </button>
          <button
            onClick={() => setSelectedFilter('APPROVED')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              selectedFilter === 'APPROVED'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setSelectedFilter('REJECTED')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              selectedFilter === 'REJECTED'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Kanban Board Grid: 4 Columns (Draft, Sent, Approved, Rejected) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colProposals = filteredProposals.filter((p) => {
            if (col.id === 'SENT') return p.status === 'SENT' || p.status === 'VIEWED';
            if (col.id === 'REJECTED') return p.status === 'REJECTED' || p.status === 'DECLINED';
            return p.status === col.id;
          });

          return (
            <div
              key={col.id}
              className="bg-slate-100/70 rounded-xl p-3 border border-slate-200/80 flex flex-col min-h-[450px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="text-xs font-bold text-slate-900">{col.label}</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {colProposals.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colProposals.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-slate-400">
                    No proposals in {col.label.toLowerCase()}
                  </div>
                ) : (
                  colProposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-500 font-bold text-[11px]">
                          {proposal.proposalNumber}
                        </span>
                        <span className="font-mono font-extrabold text-slate-900 text-xs">
                          {formatINR(proposal.totalAmount)}
                        </span>
                      </div>

                      <div
                        onClick={() => {
                          setActiveProposal(proposal);
                          setCurrentPage('proposal');
                        }}
                        className="cursor-pointer group"
                      >
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {proposal.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {proposal.clientCompany}
                        </div>
                      </div>

                      {/* Timeline / Item count */}
                      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{proposal.items.length} deliverables</span>
                        <span>{proposal.timelineEstimate}</span>
                      </div>

                      {/* Quick action buttons to simulate workflow transitions */}
                      <div className="pt-1.5 flex items-center justify-between gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveProposal(proposal);
                            setCurrentPage('proposal');
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          View Document
                        </button>

                        {/* Quick state change menu */}
                        <div className="flex items-center gap-1">
                          {col.id === 'DRAFT' && (
                            <button
                              type="button"
                              onClick={() => updateProposalStatus(proposal.id, 'SENT')}
                              className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[10px] font-medium"
                            >
                              Dispatch
                            </button>
                          )}
                          {(col.id === 'SENT' || col.id === 'VIEWED') && (
                            <button
                              type="button"
                              onClick={() => updateProposalStatus(proposal.id, 'APPROVED')}
                              className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium"
                            >
                              Sign Off
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
