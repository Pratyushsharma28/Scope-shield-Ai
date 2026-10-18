/**
 * ScopeShield AI - Type Definitions & API Contracts
 * Designed for seamless integration with Member 2 (Backend Developer)
 */

export type ScopeClassification = 'IN_SCOPE' | 'OUT_OF_SCOPE' | 'SCOPE_CREEP_RISK';

export type SuggestedAction = 
  | 'ACCEPT_AS_IS' 
  | 'ISSUE_CHANGE_ORDER' 
  | 'REQUEST_CLARIFICATION' 
  | 'DECLINE_REQUEST';

export interface ContractEvidence {
  id: string;
  clauseTitle: string;
  sectionNumber: string;
  contractSnippet: string;
  relevanceScore: number; // 0 to 100
  analysisNote: string;
  isContradicting: boolean; // true if the request violates this clause
}

export interface CostEstimate {
  estimatedHoursMin: number;
  estimatedHoursMax: number;
  recommendedHourlyRate: number;
  calculatedAmountMin: number;
  calculatedAmountMax: number;
  suggestedFixedPrice: number;
  timelineImpactDays: number;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'ARCHITECTURAL';
}

export interface Contract {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  totalBudget: number;
  hourlyRate: number;
  currency: string;
  startDate: string;
  targetEndDate: string;
  content: string; // Plain text or markdown of the signed SOW
  deliverables: string[];
  exclusions: string[];
  revisionPolicy: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  createdAt: string;
}

export interface ClientRequestInput {
  contractId: string;
  requestTitle: string;
  requestText: string;
  requestChannel: 'EMAIL' | 'SLACK' | 'MEETING_NOTES' | 'JIRA' | 'WHATSAPP';
  requesterName?: string;
  urgency: 'STANDARD' | 'URGENT' | 'BLOCKER';
  customHourlyRate?: number;
}

/**
 * Exact fields required by Member 2's backend endpoint:
 * POST /api/analyze (multipart/form-data)
 */
export interface BackendAnalyzeRequestFields {
  contract: File; // PDF or TXT file
  clientRequest: string;
  estimatedExtraHours: number;
  hourlyRate: number;
}

/**
 * Accommodates flexible backend response shapes from Member 2
 */
export interface BackendAnalyzeResponse {
  classification?: ScopeClassification | string;
  confidenceScore?: number;
  confidence?: number;
  summary?: string;
  executiveSummary?: string;
  detailedFindings?: string[];
  findings?: string[];
  evidence?: ContractEvidence[];
  contractEvidence?: ContractEvidence[];
  costEstimate?: Partial<CostEstimate>;
  estimatedCost?: number;
  suggestedAction?: SuggestedAction | string;
  recommendation?: string;
  freelancerRecommendation?: string;
  status?: string;
  data?: any;
  success?: boolean;
  error?: string;
  message?: string;
  [key: string]: any;
}

export interface AnalysisResult {
  id: string;
  requestId?: string;
  contractId: string;
  contractTitle: string;
  clientName: string;
  requestTitle: string;
  requestText: string;
  classification: ScopeClassification;
  confidenceScore: number; // 0 - 100
  executiveSummary: string;
  detailedFindings: string[];
  evidence: ContractEvidence[];
  costEstimate: CostEstimate;
  suggestedAction: SuggestedAction;
  freelancerRecommendation: string;
  whyOutOfScopeReason?: string;
  status?: 'CHANGE_ORDER_ISSUED' | 'PENDING_REVIEW' | 'IN_SCOPE_RESOLVED' | 'ACTION_REQUIRED';
  isDemoData: boolean; // Strictly labeled to prevent misleading users
  analyzedAt: string;
  rawAiOutput?: string;
}

export type ProposalStatus = 
  | 'DRAFT' 
  | 'SENT' 
  | 'VIEWED' 
  | 'APPROVED' 
  | 'REJECTED'
  | 'DECLINED' 
  | 'REVISED';

export interface ProposalItem {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  rate: number;
  subtotal: number;
}

export interface Proposal {
  id: string;
  proposalNumber: string;
  analysisId: string;
  contractId: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  projectTitle: string;
  title: string;
  executiveSummary: string;
  whyOutOfScopeReason: string;
  items: ProposalItem[];
  pricingModel: 'FIXED' | 'HOURLY';
  totalAmount: number;
  currency: string;
  timelineEstimate: string;
  validUntil: string;
  terms: string;
  status: ProposalStatus;
  statusHistory: {
    status: ProposalStatus;
    timestamp: string;
    note?: string;
  }[];
  createdAt: string;
  sentAt?: string;
  respondedAt?: string;
  clientFeedback?: string;
  shareableToken: string;
  isDemoData: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  defaultHourlyRate: number;
  currency: string;
  companyName: string;
  plan: 'FREE_TRIAL' | 'SOLO' | 'PRO' | 'AGENCY';
  isDemoUser: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  isDemoData: boolean;
  executionTimeMs?: number;
}

export interface BackendConfig {
  baseUrl: string;
  useLiveBackend: boolean;
  apiKey?: string;
  isConnected: boolean;
  lastCheckedAt?: string;
}
