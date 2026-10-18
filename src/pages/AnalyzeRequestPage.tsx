import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  SearchCode,
  Upload,
  FileText,
  X,
  Sparkles,
  Zap,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
  Terminal,
  Paperclip
} from 'lucide-react';
import { submitAnalyzeRequestFormData } from '../services/api';
import { DemoDataNotice } from '../components/common/DemoDataNotice';
import { SAMPLE_CONTRACTS } from '../data/mockData';
import { WhatsAppAssistSection } from '../components/whatsapp/WhatsAppAssistSection';

export const AnalyzeRequestPage: React.FC = () => {
  const {
    setCurrentAnalysis,
    addAnalysisToHistory,
    setCurrentPage,
    backendConfig,
    updateBackendConfig,
    showToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [projectName, setProjectName] = useState('');
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [clientRequest, setClientRequest] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<string>('24');
  const [hourlyRateINR, setHourlyRateINR] = useState<string>('8500');

  // Validation States
  const [errors, setErrors] = useState<{
    projectName?: string;
    contractFile?: string;
    clientRequest?: string;
    estimatedHours?: string;
    hourlyRateINR?: string;
    general?: string;
  }>({});

  // Submission / Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Allowed file extensions and MIME types
  const allowedExtensions = ['.pdf', '.txt'];
  const allowedMimeTypes = ['application/pdf', 'text/plain'];

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isExtensionAllowed = allowedExtensions.includes(ext);
    const isMimeAllowed = allowedMimeTypes.includes(file.type) || file.type === '';

    if (!isExtensionAllowed && !isMimeAllowed) {
      return 'Invalid file type. Only PDF (.pdf) and Plain Text (.txt) files are supported.';
    }

    // 10MB limit check
    if (file.size > 10 * 1024 * 1024) {
      return 'File size exceeds 10MB limit. Please upload a smaller document.';
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const errorMsg = validateFile(file);
      if (errorMsg) {
        setErrors((prev) => ({ ...prev, contractFile: errorMsg }));
        setContractFile(null);
      } else {
        setContractFile(file);
        setErrors((prev) => ({ ...prev, contractFile: undefined }));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const errorMsg = validateFile(file);
      if (errorMsg) {
        setErrors((prev) => ({ ...prev, contractFile: errorMsg }));
        setContractFile(null);
      } else {
        setContractFile(file);
        setErrors((prev) => ({ ...prev, contractFile: undefined }));
      }
    }
  };

  const handleRemoveFile = () => {
    setContractFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors((prev) => ({ ...prev, contractFile: undefined }));
  };

  // Load Clearly Labeled Demo Example
  const handleLoadDemoExample = () => {
    const sampleSowText = SAMPLE_CONTRACTS[0].content;
    const sampleBlob = new Blob([sampleSowText], { type: 'text/plain' });
    const demoFile = new File([sampleBlob], 'Acme_SaaS_Statement_of_Work.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    setProjectName('Acme SaaS Analytics Platform Redesign');
    setContractFile(demoFile);
    setClientRequest(
      `Hey, our executive team just met with enterprise prospects, and they need the revenue dashboard to do two-way live synchronization with NetSuite ERP and QuickBooks before our launch demo next Friday. Since you already built the revenue summary table, can we get this hooked up into the current sprint?`
    );
    setEstimatedHours('32');
    setHourlyRateINR('8500');
    setErrors({});

    showToast({
      type: 'info',
      title: 'Demo Example Loaded',
      message: 'Populated sample project, ₹8,500/hr rate, and attached Acme SOW contract.',
    });
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!projectName.trim()) {
      newErrors.projectName = 'Project name is required.';
    }

    if (!contractFile) {
      newErrors.contractFile = 'Please upload a project contract file (PDF or TXT).';
    }

    if (!clientRequest.trim()) {
      newErrors.clientRequest = 'Client request text is required.';
    } else if (clientRequest.trim().length < 15) {
      newErrors.clientRequest = 'Please provide sufficient context for the client request (at least 15 characters).';
    }

    const hoursNum = Number(estimatedHours);
    if (!estimatedHours || isNaN(hoursNum) || hoursNum <= 0) {
      newErrors.estimatedHours = 'Estimated additional hours must be a positive number greater than 0.';
    }

    const rateNum = Number(hourlyRateINR);
    if (!hourlyRateINR || isNaN(rateNum) || rateNum <= 0) {
      newErrors.hourlyRateINR = 'Hourly rate in INR must be a valid amount greater than ₹0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    if (!validateForm()) {
      showToast({
        type: 'warning',
        title: 'Validation Incomplete',
        message: 'Please resolve the highlighted form fields before submitting.',
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSubmissionStep('Preparing multipart/form-data payload...');

    try {
      // Build FormData payload using EXACT field names from Member 2
      const formData = new FormData();
      if (contractFile) {
        formData.append('contract', contractFile);
      }
      formData.append('clientRequest', clientRequest.trim());
      formData.append('estimatedExtraHours', estimatedHours.trim());
      formData.append('hourlyRate', hourlyRateINR.trim());
      formData.append('projectName', projectName.trim());

      setSubmissionStep(
        backendConfig.useLiveBackend
          ? `Transmitting multipart payload to backend (POST ${backendConfig.baseUrl}/api/analyze)...`
          : 'Processing scope evaluation via Local Mock Adapter...'
      );

      // Call the API service
      const response = await submitAnalyzeRequestFormData(formData, {
        projectName: projectName.trim(),
      });

      // Rule: Do not claim the request has been analyzed until the backend responds successfully.
      if (!response.success || !response.data) {
        throw new Error(
          response.error || 'Scope analysis could not be completed. The backend did not return a successful evaluation.'
        );
      }

      setSubmissionStep('Finalizing contractual classification & cost estimates...');

      // Store result and navigate
      addAnalysisToHistory(response.data);
      setCurrentAnalysis(response.data);

      showToast({
        type: 'success',
        title: response.data.isDemoData ? 'Mock Analysis Ready' : 'Analysis Successfully Completed',
        message: `Outcome: ${response.data.classification.replace(/_/g, ' ')} (${response.data.confidenceScore}% confidence)`,
      });

      // Navigate to Analysis Results ONLY after a successful response
      setCurrentPage('results');
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        general: err.message || 'An error occurred during submission. Please check backend availability.',
      }));
      showToast({
        type: 'error',
        title: 'Submission Failed',
        message: err.message || 'Unable to analyze request.',
      });
    } finally {
      setIsSubmitting(false);
      setSubmissionStep('');
    }
  };

  const calculatedTotalINR =
    (Number(estimatedHours) || 0) * (Number(hourlyRateINR) || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Workflow Step 1 of 3</span>
            <span aria-hidden="true">·</span>
            <span>Multipart Scope Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analyze Client Request
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Upload your signed contract (PDF/TXT) and paste an incoming request to verify deliverables boundaries and estimate extra billing.
          </p>
        </div>

        {/* Clearly Labeled Demo Example Button */}
        <button
          type="button"
          onClick={handleLoadDemoExample}
          disabled={isSubmitting}
          className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-2 transition-all shrink-0 self-start md:self-auto hover:border-indigo-300"
          title="Fills the form with a verified sample contract and client request for instant testing"
        >
          <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
          <span>Load Demo Example (₹8,500/hr · NetSuite Sync)</span>
        </button>
      </div>

      {/* Mode & Target Endpoint Bar */}
      <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${backendConfig.useLiveBackend ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="font-bold text-slate-900">
            {backendConfig.useLiveBackend ? 'Live Backend Target:' : 'Mode: Local Mock Adapter'}
          </span>
          <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-slate-700">
            POST {backendConfig.baseUrl}/api/analyze
          </code>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => updateBackendConfig({ useLiveBackend: true })}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              backendConfig.useLiveBackend
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Backend API
          </button>
          <button
            type="button"
            onClick={() => updateBackendConfig({ useLiveBackend: false })}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              !backendConfig.useLiveBackend
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Local Mock Adapter
          </button>
        </div>
      </div>

      {/* Notice when Mock Mode is active */}
      {!backendConfig.useLiveBackend && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Local Mock Adapter Active:</span> Submissions use a local UI development mock simulation. Output will be clearly labeled as mock data and is never presented as real AI analysis.
          </div>
        </div>
      )}

      {/* General Submission Error Banner with Mock Fallback Action */}
      {errors.general && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Server Error:</span> {errors.general}
              <div className="mt-0.5 text-[11px] text-rose-700">
                Make sure Member 2's backend server is running on <code className="font-mono bg-white/70 px-1 rounded">{backendConfig.baseUrl}</code>.
              </div>
            </div>
          </div>

          {backendConfig.useLiveBackend && (
            <button
              type="button"
              onClick={() => {
                updateBackendConfig({ useLiveBackend: false });
                setErrors((prev) => ({ ...prev, general: undefined }));
                showToast({
                  type: 'info',
                  title: 'Switched to Local Mock Adapter',
                  message: 'Local UI mock adapter activated. Click Submit to test locally.',
                });
              }}
              className="px-3.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold rounded-lg transition-colors shrink-0 self-start sm:self-auto border border-rose-300"
            >
              Switch to Local Mock Adapter & Test
            </button>
          )}
        </div>
      )}

      {/* Main Analysis Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          {/* Field 1: Project Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (errors.projectName) setErrors((prev) => ({ ...prev, projectName: undefined }));
              }}
              disabled={isSubmitting}
              placeholder="e.g. Fintech Mobile App MVP or Acme SaaS Redesign"
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.projectName
                  ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-slate-300 focus:ring-indigo-500 bg-white'
              }`}
            />
            {errors.projectName && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.projectName}</span>
              </p>
            )}
          </div>

          {/* Field 2: Contract File Upload (PDF and TXT) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Contract File Upload <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Supported: PDF (.pdf) or Plain Text (.txt)</span>
            </div>

            {/* Selected File Card or Drop Zone */}
            {contractFile ? (
              <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {contractFile.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {(contractFile.size / 1024).toFixed(1)} KB · {contractFile.type || 'Plain text document'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors shrink-0"
                  title="Remove selected contract file"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove file</span>
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : errors.contractFile
                    ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400'
                    : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-400'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="mt-3">
                  <span className="text-xs font-bold text-indigo-700 hover:underline">
                    Click to browse contract
                  </span>
                  <span className="text-xs text-slate-500"> or drag and drop your SOW</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Upload PDF or TXT contract document (Max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {errors.contractFile && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.contractFile}</span>
              </p>
            )}
          </div>

          {/* WhatsApp Assisted Entry & Reply Generator */}
          <WhatsAppAssistSection
            projectName={projectName || 'Client Project'}
            estimatedHours={estimatedHours}
            hourlyRateINR={hourlyRateINR}
            onApplyCleanedText={(cleaned) => {
              setClientRequest(cleaned);
              if (errors.clientRequest) {
                setErrors((prev) => ({ ...prev, clientRequest: undefined }));
              }
              showToast({
                type: 'success',
                title: 'WhatsApp Text Imported',
                message: 'Cleaned message inserted into Field 3 below.',
              });
            }}
          />

          {/* Field 3: Client Request Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Client Request Message / Ticket <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{clientRequest.length} characters</span>
            </div>
            <textarea
              rows={5}
              value={clientRequest}
              onChange={(e) => {
                setClientRequest(e.target.value);
                if (errors.clientRequest) setErrors((prev) => ({ ...prev, clientRequest: undefined }));
              }}
              disabled={isSubmitting}
              placeholder="Paste raw Slack message, email thread, or ticket notes from the client..."
              className={`w-full p-3.5 text-xs border rounded-xl focus:outline-none focus:ring-2 leading-relaxed transition-colors ${
                errors.clientRequest
                  ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-slate-300 focus:ring-indigo-500 bg-white'
              }`}
            />
            {errors.clientRequest && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.clientRequest}</span>
              </p>
            )}
          </div>

          {/* Fields 4 & 5: Estimated Hours & Hourly Rate in INR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Field 4: Estimated Additional Hours */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  4. Estimated Additional Hours <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Engineering effort</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={estimatedHours}
                  onChange={(e) => {
                    setEstimatedHours(e.target.value);
                    if (errors.estimatedHours) setErrors((prev) => ({ ...prev, estimatedHours: undefined }));
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 font-mono transition-colors ${
                    errors.estimatedHours
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-indigo-500 bg-white'
                  }`}
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                  hours
                </span>
              </div>
              {errors.estimatedHours && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.estimatedHours}</span>
                </p>
              )}
            </div>

            {/* Field 5: Hourly Rate in INR */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  5. Hourly Rate in INR (₹) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Consultant rate</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500 font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={hourlyRateINR}
                  onChange={(e) => {
                    setHourlyRateINR(e.target.value);
                    if (errors.hourlyRateINR) setErrors((prev) => ({ ...prev, hourlyRateINR: undefined }));
                  }}
                  disabled={isSubmitting}
                  className={`w-full pl-8 pr-16 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 font-mono transition-colors ${
                    errors.hourlyRateINR
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-indigo-500 bg-white'
                  }`}
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">
                  INR / hr
                </span>
              </div>
              {errors.hourlyRateINR && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.hourlyRateINR}</span>
                </p>
              )}
            </div>
          </div>

          {/* Computed Preview Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-900">Calculated Scope Financial Exposure:</span>
              <span className="text-slate-500 ml-1.5">
                {estimatedHours || 0} hrs × ₹{Number(hourlyRateINR || 0).toLocaleString('en-IN')}/hr
              </span>
            </div>
            <div className="text-base font-extrabold text-indigo-700 font-mono">
              ₹{calculatedTotalINR.toLocaleString('en-IN')} INR
            </div>
          </div>

          {/* Submission / Loading State Indicator */}
          {isSubmitting && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-900">
                <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Transmitting & Analyzing Scope Boundaries...</span>
              </div>
              <p className="text-xs text-indigo-700">{submissionStep}</p>
              <div className="w-full bg-indigo-200 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-2/3 animate-pulse" />
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setProjectName('');
                handleRemoveFile();
                setClientRequest('');
                setErrors({});
              }}
              disabled={isSubmitting}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all hover:shadow"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting to API Service...</span>
                </>
              ) : (
                <>
                  <SearchCode className="w-4 h-4" />
                  <span>Submit for Scope Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Integration Specification & API Contract for Member 2 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span>Member 2 Backend Integration Contract</span>
          </div>
          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            POST /api/analyze (multipart/form-data)
          </span>
        </div>

        <p className="text-slate-600 leading-relaxed">
          The frontend packages the contract file and parameters into a native <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">FormData</code> payload. Member 2's backend server must accept this multipart schema:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-1 font-mono text-[11px] overflow-x-auto">
            <div className="text-indigo-400 font-bold mb-1">// Submitted FormData fields:</div>
            <div>projectName: string</div>
            <div>contractFile: File (.pdf | .txt)</div>
            <div>clientRequest: string</div>
            <div>estimatedHours: number</div>
            <div>hourlyRate: number (INR)</div>
            <div>currency: 'INR'</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-slate-600">
            <div className="font-bold text-slate-900 text-xs">Validation & Submission Guarantees:</div>
            <ul className="space-y-1 text-[11px] list-disc list-inside">
              <li>File upload is restricted to valid PDF (.pdf) and Plain Text (.txt) formats.</li>
              <li>Only after an HTTP 200 response with successful JSON payload is the analysis considered complete.</li>
              <li>When Member 2's backend is offline, the labeled Demo Engine safely simulates the evaluation without errors.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
