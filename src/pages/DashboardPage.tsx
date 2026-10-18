import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  DollarSign,
  FileCheck2,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink,
  Briefcase,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Database
} from 'lucide-react';
import { ClassificationBadge } from '../components/common/ClassificationBadge';
import { DemoDataNotice } from '../components/common/DemoDataNotice';
import { AnalysisResult } from '../types';

export const DashboardPage: React.FC = () => {
  const {
    contracts,
    analysisHistory,
    setCurrentAnalysis,
    proposals,
    setActiveProposal,
    setCurrentPage,
    currentUser,
    backendConfig,
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // Exact 4 metrics requested by user:
  // 1. Total Analyses
  const totalAnalyses = analysisHistory.length;

  // 2. Pending Reviews (analyses flagged for review or proposals awaiting client response)
  const pendingReviews = analysisHistory.filter(
    (a) => a.status === 'PENDING_REVIEW' || a.classification === 'SCOPE_CREEP_RISK'
  ).length;

  // 3. Proposals Sent (proposals in SENT or VIEWED state)
  const proposalsSent = proposals.filter(
    (p) => p.status === 'SENT' || p.status === 'VIEWED'
  ).length;

  // 4. Estimated Extra Revenue (sum of out-of-scope proposal / estimate values, clearly labeled as demo projection)
  const estimatedExtraRevenue = proposals
    .filter((p) => p.status === 'APPROVED' || p.status === 'SENT' || p.status === 'DRAFT')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const filteredAnalyses = analysisHistory.filter((item) => {
    if (selectedFilter === 'ALL') return true;
    return item.classification === selectedFilter;
  });

  const getStatusBadge = (status?: string, classification?: string) => {
    switch (status) {
      case 'CHANGE_ORDER_ISSUED':
        return (
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
            Change Order Issued
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            Pending Review
          </span>
        );
      case 'IN_SCOPE_RESOLVED':
        return (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            In-Scope Resolved
          </span>
        );
      case 'ACTION_REQUIRED':
        return (
          <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
            Action Required
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {classification === 'IN_SCOPE' ? 'Resolved' : 'Evaluated'}
          </span>
        );
    }
  };

  const handleRowClick = (item: AnalysisResult) => {
    setCurrentAnalysis(item);
    setCurrentPage('results');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner & Prominent "Analyze New Request" Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Welcome, {currentUser.name}</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.companyName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scope Protection Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Cross-reference incoming client requests with contract deliverables, prevent unpaid scope drift, and issue approval-ready Change Orders.
          </p>
        </div>

        {/* Prominent Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentPage('analyze')}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all hover:shadow-lg hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm tracking-wide">Analyze New Request</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Mandatory Demo Data Notice Banner */}
      <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">Demo Simulation Data Notice:</span>
            <span className="text-slate-600 ml-1.5">
              All records, statistics, and financial projections displayed below are pre-loaded sample datasets. No actual customer activity or revenue is claimed.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage('settings')}
          className="text-xs font-bold text-indigo-700 hover:text-indigo-800 hover:underline shrink-0"
        >
          Configure Backend Endpoint →
        </button>
      </div>

      {/* Summary Cards Grid: Exactly 4 requested KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Analyses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Analyses
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {totalAnalyses}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-indigo-700">100% indexed</span>
              <span>across 3 SOW contracts</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Demo records
          </div>
        </div>

        {/* Card 2: Pending Reviews */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Reviews
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {pendingReviews}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>Potential scope creep requiring boundary decision</span>
            </div>
          </div>
          <div className="text-[10px] text-amber-700 font-semibold">
            Action recommended
          </div>
        </div>

        {/* Card 3: Proposals Sent */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Proposals Sent
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {proposalsSent}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>Change orders currently dispatched to clients</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Awaiting client sign-off
          </div>
        </div>

        {/* Card 4: Estimated Extra Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estimated Extra Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              ${estimatedExtraRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-700 font-semibold inline-flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Recovered
              </span>
              <span>from unbilled requests</span>
            </div>
          </div>
          <div className="text-[10px] text-emerald-800 font-medium">
            Demo projection
          </div>
        </div>
      </div>

      {/* Recent Analyses Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Recent Request Analyses</h2>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Demo Dataset
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Client requests evaluated against active contract clauses and deliverables
            </p>
          </div>

          {/* Interactive filter buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({analysisHistory.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('OUT_OF_SCOPE')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedFilter === 'OUT_OF_SCOPE'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Out of Scope
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('SCOPE_CREEP_RISK')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedFilter === 'SCOPE_CREEP_RISK'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Creep Risk
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('IN_SCOPE')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedFilter === 'IN_SCOPE'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Scope
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3.5">Project Name</th>
                <th className="py-3 px-3.5">Request Summary</th>
                <th className="py-3 px-3.5">Classification</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnalyses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No analyses found for this filter.
                  </td>
                </tr>
              ) : (
                filteredAnalyses.map((item) => {
                  const formattedDate = new Date(item.analyzedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Project Name */}
                      <td className="py-3.5 px-3.5 font-bold text-slate-900">
                        <div className="truncate max-w-[190px]">{item.contractTitle}</div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          Client: {item.clientName}
                        </div>
                      </td>

                      {/* Request Summary */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[240px]">
                          {item.requestTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[240px]">
                          "{item.requestText}"
                        </div>
                      </td>

                      {/* Classification Badge (Zero-pill text style) */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <ClassificationBadge classification={item.classification} size="sm" />
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3.5 text-slate-500 font-mono whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        {getStatusBadge(item.status, item.classification)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(item);
                          }}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>View Evidence</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Quick Actions & Active Agreements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick SOW Contracts Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Active Freelance Contracts (SOWs)</h3>
            <button
              type="button"
              onClick={() => setCurrentPage('analyze')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              + Upload SOW
            </button>
          </div>

          <div className="space-y-2.5">
            {contracts.map((c) => (
              <div
                key={c.id}
                onClick={() => setCurrentPage('analyze')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{c.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {c.clientName} · ${c.hourlyRate}/hr · {c.exclusions.length} exclusions indexed
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Change Proposal Quick Action Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Change Proposals & Approval Status</h3>
              <span className="text-xs text-slate-400 font-mono">{proposals.length} total</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Every out-of-scope analysis can be turned into a binding digital change proposal. Track your approved client authorizations on the board.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentPage('tracking')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Open Approval Tracking Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('proposal')}
              className="w-full py-2 text-xs font-semibold text-indigo-700 hover:text-indigo-800 transition-colors"
            >
              View Latest Proposal Document ({proposals[0]?.proposalNumber})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
