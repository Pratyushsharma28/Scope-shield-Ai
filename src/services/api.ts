/**
 * ScopeShield AI — API & Backend Integration Service
 * 
 * DESIGNED FOR HACKATHON COLLABORATION:
 * This service provides clean, decoupled interfaces for Member 2 (Backend Engineer).
 * 
 * When LIVE_BACKEND mode is active, requests call real backend endpoints.
 * When DEMO_ENGINE mode is active, requests use verified sample data explicitly
 * tagged with `isDemoData: true` so no fake results are ever presented as real AI.
 */

import {
  AnalysisResult,
  ApiResponse,
  ClientRequestInput,
  Contract,
  Proposal,
  ProposalItem,
  ProposalStatus,
  BackendConfig
} from '../types';
import { DEMO_ANALYSIS_RESULTS } from '../data/mockData';

const CONFIG_KEY = 'scopeshield_backend_config';

export const getBackendConfig = (): BackendConfig => {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse backend config from localStorage', e);
  }

  return {
    baseUrl: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000',
    useLiveBackend: false, // Default to demo engine for sandbox safety unless toggled
    isConnected: false,
    lastCheckedAt: undefined,
  };
};

export const saveBackendConfig = (config: BackendConfig): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

/**
 * Health check to verify if Member 2's backend server is reachable
 */
export const checkBackendHealth = async (customUrl?: string): Promise<{ isAlive: boolean; latencyMs?: number; message?: string }> => {
  const config = getBackendConfig();
  const url = customUrl || config.baseUrl;
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${url.replace(/\/$/, '')}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latency = Math.round(performance.now() - start);
    if (res.ok) {
      return { isAlive: true, latencyMs: latency, message: 'Backend service is online & responsive.' };
    }
    return { isAlive: false, latencyMs: latency, message: `Server responded with status HTTP ${res.status}` };
  } catch (err: any) {
    return {
      isAlive: false,
      message: err.name === 'AbortError' 
        ? 'Backend health check timed out (>4000ms)' 
        : `Connection refused at ${url}. Ensure CORS is enabled and backend is running.`,
    };
  }
};

/**
 * Analyzes a client request against the provided contract.
 * Calls real backend if enabled, otherwise provides a labeled demo evaluation.
 */
export const analyzeScopeRequest = async (
  input: ClientRequestInput,
  contract: Contract
): Promise<ApiResponse<AnalysisResult>> => {
  const config = getBackendConfig();

  // 1. LIVE BACKEND MODE (Real AI Analysis by Member 2)
  if (config.useLiveBackend) {
    const startTime = performance.now();
    try {
      const endpoint = `${config.baseUrl.replace(/\/$/, '')}/api/analyze`;
      
      const payload = {
        contractId: contract.id,
        contractTitle: contract.title,
        contractContent: contract.content,
        clientName: contract.clientName,
        requestTitle: input.requestTitle,
        requestText: input.requestText,
        requestChannel: input.requestChannel,
        urgency: input.urgency,
        hourlyRate: input.customHourlyRate || contract.hourlyRate,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Backend API error (${res.status}): ${errorText || res.statusText}`);
      }

      const responseData = await res.json();
      const executionTimeMs = Math.round(performance.now() - startTime);

      return {
        success: true,
        data: {
          ...responseData,
          isDemoData: false, // Confirmed live backend result
        },
        isDemoData: false,
        executionTimeMs,
        message: 'Successfully analyzed via live backend AI model.',
      };
    } catch (error: any) {
      console.error('[ScopeShield API] Live Backend Request Failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to the backend analysis server. Check that your API server is running and CORS is enabled.',
        isDemoData: false,
      };
    }
  }

  // 2. DEMO ENGINE MODE (Explicitly labeled demo dataset)
  // Simulates processing delay to reflect realistic network & LLM latency
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const textLower = (input.requestText + ' ' + input.requestTitle).toLowerCase();
  
  // Choose the best match from verified mock datasets or generate heuristic demo output
  let chosenResult: AnalysisResult;

  if (textLower.includes('netsuite') || textLower.includes('erp') || textLower.includes('quickbooks') || textLower.includes('crm') || textLower.includes('sync')) {
    chosenResult = {
      ...DEMO_ANALYSIS_RESULTS.out_of_scope,
      id: `anl_${Date.now()}`,
      contractId: contract.id,
      contractTitle: contract.title,
      clientName: contract.clientName,
      requestTitle: input.requestTitle,
      requestText: input.requestText,
      analyzedAt: new Date().toISOString(),
    };
  } else if (textLower.includes('chart') || textLower.includes('cohort') || textLower.includes('retention') || textLower.includes('extra') || textLower.includes('additional') || textLower.includes('feature')) {
    chosenResult = {
      ...DEMO_ANALYSIS_RESULTS.scope_creep_risk,
      id: `anl_${Date.now()}`,
      contractId: contract.id,
      contractTitle: contract.title,
      clientName: contract.clientName,
      requestTitle: input.requestTitle,
      requestText: input.requestText,
      analyzedAt: new Date().toISOString(),
    };
  } else if (textLower.includes('bug') || textLower.includes('glitch') || textLower.includes('fix') || textLower.includes('responsive') || textLower.includes('font') || textLower.includes('qa')) {
    chosenResult = {
      ...DEMO_ANALYSIS_RESULTS.in_scope,
      id: `anl_${Date.now()}`,
      contractId: contract.id,
      contractTitle: contract.title,
      clientName: contract.clientName,
      requestTitle: input.requestTitle,
      requestText: input.requestText,
      analyzedAt: new Date().toISOString(),
    };
  } else {
    // Generic fallback heuristic labeled as Demo Data
    chosenResult = {
      id: `anl_${Date.now()}`,
      contractId: contract.id,
      contractTitle: contract.title,
      clientName: contract.clientName,
      requestTitle: input.requestTitle || 'Custom Client Request',
      requestText: input.requestText,
      classification: 'SCOPE_CREEP_RISK',
      confidenceScore: 82,
      executiveSummary: 'This request introduces items not explicitly enumerated in the signed deliverables schedule. Recommended for review before committing hours.',
      detailedFindings: [
        'The requested scope includes additions not specified in the current signed agreement deliverables list.',
        'No direct exclusion clause was found, but the task demands incremental time beyond the estimated project milestones.',
      ],
      evidence: [
        {
          id: 'ev_gen_01',
          clauseTitle: 'Scope Boundaries & Deliverables Schedule',
          sectionNumber: 'Section 1',
          contractSnippet: contract.content.slice(0, 220) + '...',
          relevanceScore: 78,
          analysisNote: 'Comparing incoming request against primary project baseline.',
          isContradicting: true,
        },
      ],
      costEstimate: {
        estimatedHoursMin: 8,
        estimatedHoursMax: 14,
        recommendedHourlyRate: input.customHourlyRate || contract.hourlyRate || 125,
        calculatedAmountMin: 8 * (input.customHourlyRate || contract.hourlyRate || 125),
        calculatedAmountMax: 14 * (input.customHourlyRate || contract.hourlyRate || 125),
        suggestedFixedPrice: 11 * (input.customHourlyRate || contract.hourlyRate || 125),
        timelineImpactDays: 3,
        complexity: 'MEDIUM',
      },
      suggestedAction: 'ISSUE_CHANGE_ORDER',
      freelancerRecommendation: 'Provide an itemized scope estimate to the client to clarify whether this can be swapped with another deliverable or billed as an addendum.',
      isDemoData: true,
      analyzedAt: new Date().toISOString(),
    };
  }

  return {
    success: true,
    data: chosenResult,
    isDemoData: true,
    executionTimeMs: 1420,
    message: 'Analyzed using ScopeShield Demo Engine dataset (Connect backend for custom AI inference).',
  };
};

/**
 * Creates a formal Change Order Proposal from an analysis result
 */
export const createChangeProposal = async (
  analysis: AnalysisResult,
  contract: Contract,
  overrides?: Partial<Proposal>
): Promise<ApiResponse<Proposal>> => {
  const config = getBackendConfig();

  if (config.useLiveBackend) {
    try {
      const res = await fetch(`${config.baseUrl.replace(/\/$/, '')}/api/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: analysis.id, contractId: contract.id, overrides }),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, data: { ...data, isDemoData: false }, isDemoData: false };
      }
    } catch (e) {
      console.warn('Backend proposal generation failed, falling back to client generation', e);
    }
  }

  // Client-side structured proposal builder
  const rate = analysis.costEstimate.recommendedHourlyRate || contract.hourlyRate || 125;
  const hours = Math.round((analysis.costEstimate.estimatedHoursMin + analysis.costEstimate.estimatedHoursMax) / 2);
  const totalAmount = analysis.costEstimate.suggestedFixedPrice || (hours * rate);

  const proposalNumber = `CO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const items: ProposalItem[] = [
    {
      id: 'item_auto_1',
      title: analysis.requestTitle || 'Requested Out-of-Scope Architecture & Delivery',
      description: analysis.executiveSummary || 'Implementation, testing, and integration of requested features.',
      estimatedHours: hours,
      rate,
      subtotal: totalAmount,
    },
  ];

  const proposal: Proposal = {
    id: `prop_${Date.now()}`,
    proposalNumber,
    analysisId: analysis.id,
    contractId: contract.id,
    clientName: contract.clientName,
    clientEmail: contract.clientEmail,
    clientCompany: contract.clientCompany || 'Client Organization',
    projectTitle: contract.title,
    title: `Change Order: ${analysis.requestTitle}`,
    executiveSummary: `Per our project agreement (${contract.title}), the requested items constitute out-of-scope work. This proposal outlines the dedicated resources and timeframe required to deliver them without compromising ongoing project deadlines.`,
    whyOutOfScopeReason: analysis.whyOutOfScopeReason || analysis.detailedFindings[0] || 'Exceeds the contracted deliverables boundary.',
    items,
    pricingModel: 'FIXED',
    totalAmount,
    currency: contract.currency || 'USD',
    timelineEstimate: `${analysis.costEstimate.timelineImpactDays || 4} business days`,
    validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    terms: 'Payment terms: 50% upon electronic acceptance, 50% upon milestone release. Work will be integrated into the main branch upon sign-off.',
    status: 'DRAFT',
    statusHistory: [
      {
        status: 'DRAFT',
        timestamp: new Date().toISOString(),
        note: 'Proposal drafted from ScopeShield AI analysis report',
      },
    ],
    createdAt: new Date().toISOString(),
    shareableToken: `token-${Math.random().toString(36).substring(2, 9)}`,
    isDemoData: analysis.isDemoData,
    ...overrides,
  };

  return {
    success: true,
    data: proposal,
    isDemoData: proposal.isDemoData,
    message: 'Proposal generated successfully.',
  };
};
