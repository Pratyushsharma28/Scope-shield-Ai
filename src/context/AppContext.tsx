import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AnalysisResult,
  Contract,
  Proposal,
  ProposalStatus,
  UserProfile,
  BackendConfig
} from '../types';
import {
  DEMO_USER,
  SAMPLE_CONTRACTS,
  INITIAL_PROPOSALS,
  DEMO_ANALYSIS_RESULTS
} from '../data/mockData';
import {
  getBackendConfig,
  saveBackendConfig,
  checkBackendHealth
} from '../services/api';

export type PageId = 
  | 'dashboard' 
  | 'analyze' 
  | 'results' 
  | 'proposal' 
  | 'proposals' 
  | 'tracking' 
  | 'settings' 
  | 'login' 
  | 'pricing';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  // Navigation
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  
  // User Profile
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  logout: () => void;
  loginAsDemoUser: (role?: string) => void;
  
  // Contracts
  contracts: Contract[];
  activeContract: Contract | null;
  setActiveContract: (contract: Contract | null) => void;
  addContract: (newContract: Contract) => void;
  
  // Scope Analysis
  currentAnalysis: AnalysisResult | null;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  analysisHistory: AnalysisResult[];
  addAnalysisToHistory: (analysis: AnalysisResult) => void;
  
  // Proposals
  proposals: Proposal[];
  activeProposal: Proposal | null;
  setActiveProposal: (proposal: Proposal | null) => void;
  addProposal: (proposal: Proposal) => void;
  updateProposalStatus: (proposalId: string, status: ProposalStatus, note?: string) => void;
  updateProposalDetails: (proposalId: string, updates: Partial<Proposal>) => void;
  
  // Backend Configuration & Integration
  backendConfig: BackendConfig;
  updateBackendConfig: (config: Partial<BackendConfig>) => void;
  testBackendConnection: () => Promise<{ isAlive: boolean; message?: string }>;
  
  // UI Utilities
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  
  // Pre-load demo workflow helper
  loadDemoScenario: (scenario: 'out_of_scope' | 'scope_creep_risk' | 'in_scope') => void;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('scopeshield_user');
    return saved ? JSON.parse(saved) : DEMO_USER;
  });

  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem('scopeshield_contracts');
    return saved ? JSON.parse(saved) : SAMPLE_CONTRACTS;
  });

  const [activeContract, setActiveContract] = useState<Contract | null>(() => {
    return contracts[0] || null;
  });

  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>(() => {
    const saved = localStorage.getItem('scopeshield_analysis_history');
    return saved ? JSON.parse(saved) : Object.values(DEMO_ANALYSIS_RESULTS);
  });

  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(() => {
    return DEMO_ANALYSIS_RESULTS.out_of_scope;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('scopeshield_proposals');
    return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
  });

  const [activeProposal, setActiveProposal] = useState<Proposal | null>(() => {
    return proposals[0] || null;
  });

  const [backendConfig, setBackendConfigState] = useState<BackendConfig>(getBackendConfig());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist contracts
  useEffect(() => {
    localStorage.setItem('scopeshield_contracts', JSON.stringify(contracts));
  }, [contracts]);

  // Persist proposals
  useEffect(() => {
    localStorage.setItem('scopeshield_proposals', JSON.stringify(proposals));
  }, [proposals]);

  // Persist analysis history
  useEffect(() => {
    localStorage.setItem('scopeshield_analysis_history', JSON.stringify(analysisHistory));
  }, [analysisHistory]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addContract = (newContract: Contract) => {
    setContracts((prev) => [newContract, ...prev]);
    setActiveContract(newContract);
    showToast({
      type: 'success',
      title: 'Contract Uploaded & Indexed',
      message: `${newContract.title} is now active and ready for scope comparison.`,
    });
  };

  const addAnalysisToHistory = (analysis: AnalysisResult) => {
    setAnalysisHistory((prev) => [analysis, ...prev]);
    setCurrentAnalysis(analysis);
  };

  const addProposal = (proposal: Proposal) => {
    setProposals((prev) => [proposal, ...prev.filter((p) => p.id !== proposal.id)]);
    setActiveProposal(proposal);
    showToast({
      type: 'success',
      title: 'Proposal Created',
      message: `${proposal.proposalNumber} has been drafted and is ready for client review.`,
    });
  };

  const updateProposalStatus = (proposalId: string, status: ProposalStatus, note?: string) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          const updated = {
            ...p,
            status,
            respondedAt: (status === 'APPROVED' || status === 'DECLINED') ? new Date().toISOString() : p.respondedAt,
            sentAt: status === 'SENT' ? new Date().toISOString() : p.sentAt,
            statusHistory: [
              ...p.statusHistory,
              {
                status,
                timestamp: new Date().toISOString(),
                note: note || `Status changed to ${status}`,
              },
            ],
          };
          if (activeProposal && activeProposal.id === proposalId) {
            setActiveProposal(updated);
          }
          return updated;
        }
        return p;
      })
    );

    showToast({
      type: 'info',
      title: `Proposal Status Updated`,
      message: `Proposal marked as ${status}.`,
    });
  };

  const updateProposalDetails = (proposalId: string, updates: Partial<Proposal>) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          const updated = { ...p, ...updates };
          if (activeProposal && activeProposal.id === proposalId) {
            setActiveProposal(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  const updateBackendConfig = (updates: Partial<BackendConfig>) => {
    const next = { ...backendConfig, ...updates };
    setBackendConfigState(next);
    saveBackendConfig(next);
  };

  const testBackendConnection = async () => {
    const result = await checkBackendHealth(backendConfig.baseUrl);
    const updated = {
      ...backendConfig,
      isConnected: result.isAlive,
      lastCheckedAt: new Date().toISOString(),
    };
    setBackendConfigState(updated);
    saveBackendConfig(updated);
    return result;
  };

  const loginAsDemoUser = (role: string = 'Senior Freelance Engineer') => {
    const user: UserProfile = {
      ...DEMO_USER,
      role,
    };
    setCurrentUser(user);
    localStorage.setItem('scopeshield_user', JSON.stringify(user));
    showToast({
      type: 'success',
      title: 'Demo Session Active',
      message: `Logged in as ${user.name} (${user.companyName}).`,
    });
    setCurrentPage('dashboard');
  };

  const logout = () => {
    showToast({
      type: 'info',
      title: 'Session Ended',
      message: 'You have returned to the demo login screen.',
    });
    setCurrentPage('login');
  };

  const loadDemoScenario = (scenario: 'out_of_scope' | 'scope_creep_risk' | 'in_scope') => {
    const result = DEMO_ANALYSIS_RESULTS[scenario];
    setCurrentAnalysis(result);
    // Find matching contract
    const contract = contracts.find((c) => c.id === result.contractId) || contracts[0];
    setActiveContract(contract);
    setCurrentPage('results');
    showToast({
      type: 'info',
      title: 'Loaded Demo Scenario',
      message: `Inspecting ${result.classification.replace(/_/g, ' ')} analysis scenario.`,
    });
  };

  const resetToDemoData = () => {
    localStorage.removeItem('scopeshield_contracts');
    localStorage.removeItem('scopeshield_proposals');
    localStorage.removeItem('scopeshield_analysis_history');
    setContracts(SAMPLE_CONTRACTS);
    setActiveContract(SAMPLE_CONTRACTS[0]);
    setAnalysisHistory(Object.values(DEMO_ANALYSIS_RESULTS));
    setCurrentAnalysis(DEMO_ANALYSIS_RESULTS.out_of_scope);
    setProposals(INITIAL_PROPOSALS);
    setActiveProposal(INITIAL_PROPOSALS[0]);
    showToast({
      type: 'success',
      title: 'Demo Environment Reset',
      message: 'Reset sample contracts, analyses, and proposals to default state.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        currentUser,
        setCurrentUser,
        logout,
        loginAsDemoUser,
        contracts,
        activeContract,
        setActiveContract,
        addContract,
        currentAnalysis,
        setCurrentAnalysis,
        analysisHistory,
        addAnalysisToHistory,
        proposals,
        activeProposal,
        setActiveProposal,
        addProposal,
        updateProposalStatus,
        updateProposalDetails,
        backendConfig,
        updateBackendConfig,
        testBackendConnection,
        toasts,
        showToast,
        dismissToast,
        loadDemoScenario,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
