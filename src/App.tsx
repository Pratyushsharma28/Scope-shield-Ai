/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzeRequestPage } from './pages/AnalyzeRequestPage';
import { AnalysisResultsPage } from './pages/AnalysisResultsPage';
import { ProposalPreviewPage } from './pages/ProposalPreviewPage';
import { ApprovalTrackingPage } from './pages/ApprovalTrackingPage';
import { LoginPage } from './pages/LoginPage';
import { PricingPage } from './pages/PricingPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { currentPage } = useApp();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'analyze':
        return <AnalyzeRequestPage />;
      case 'results':
        return <AnalysisResultsPage />;
      case 'proposal':
      case 'proposals':
        return <ProposalPreviewPage />;
      case 'tracking':
        return <ApprovalTrackingPage />;
      case 'settings':
        return <SettingsPage />;
      case 'login':
        return <LoginPage />;
      case 'pricing':
        return <PricingPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppLayout>{renderCurrentPage()}</AppLayout>;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
