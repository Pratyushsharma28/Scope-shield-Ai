import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Phone,
  AlertCircle,
  Info,
  ArrowRight,
  ShieldAlert,
  Send
} from 'lucide-react';

interface WhatsAppAssistSectionProps {
  onApplyCleanedText: (cleanedText: string) => void;
  projectName?: string;
  estimatedHours?: string;
  hourlyRateINR?: string;
}

export const WhatsAppAssistSection: React.FC<WhatsAppAssistSectionProps> = ({
  onApplyCleanedText,
  projectName = 'Current Project',
  estimatedHours = '24',
  hourlyRateINR = '8500',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rawWhatsAppMessage, setRawWhatsAppMessage] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedTemplateType, setSelectedTemplateType] = useState<'REVIEW' | 'OUT_OF_SCOPE' | 'PROPOSAL_READY'>('OUT_OF_SCOPE');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [cleanedPreview, setCleanedPreview] = useState<string | null>(null);

  // Sample real-world messages received by freelancers on WhatsApp
  const sampleWhatsAppMessages = [
    {
      title: 'NetSuite Sync (Out of Scope)',
      raw: `[18/10/26, 11:15:32 AM] Sarah Jenkins: Hey Alex! Our executive team just met with enterprise prospects, and they need the revenue dashboard to do two-way live synchronization with NetSuite ERP and QuickBooks before our launch demo next Friday. Since you already built the revenue summary table, can we get this hooked up into the current sprint? 🙏`,
    },
    {
      title: 'Reporting Export (Scope Risk)',
      raw: `[17/10/26, 3:42:10 PM] Marcus Sterling: Hi Alex, quick question — can we add multi-currency export to Excel and 5 regional languages for the invoice generator? We assumed this was standard with the billing module. Let me know when ready!`,
    },
    {
      title: 'Button Alignment (In Scope)',
      raw: `[16/10/26, 9:20:05 AM] Sarah Jenkins: Good morning! Noticed a small UI typo on the settings tab and the save button is slightly off-center on mobile Safari. Can you patch this up? Thanks!`,
    },
  ];

  // Intelligent text sanitizer that strips WhatsApp chat export timestamps and sender headers
  const cleanWhatsAppText = (text: string): string => {
    let cleaned = text;

    // Pattern 1: [18/10/26, 11:15:32 AM] Name: ...
    cleaned = cleaned.replace(/\[\d{1,2}[/-]\d{1,2}[/-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\]\s*[^:\n]+:\s*/g, '');

    // Pattern 2: 18/10/26, 11:15 - Name: ...
    cleaned = cleaned.replace(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4},?\s+\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\s*-\s*[^:\n]+:\s*/g, '');

    // Pattern 3: Name: at the very start of line
    cleaned = cleaned.replace(/^[A-Za-z0-9\s~_]+:\s+/gm, '');

    // Remove leading/trailing quotation marks if whole string was quoted
    cleaned = cleaned.trim();
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith('“') && cleaned.endsWith('”'))) {
      cleaned = cleaned.slice(1, -1).trim();
    }

    return cleaned;
  };

  const handleApplyToForm = (textToApply: string) => {
    const cleaned = cleanWhatsAppText(textToApply);
    setCleanedPreview(cleaned);
    onApplyCleanedText(cleaned);
  };

  // Calculate estimated total for prefilled messages
  const hours = Number(estimatedHours) || 0;
  const rate = Number(hourlyRateINR) || 0;
  const estimatedCostINR = hours * rate;
  const formattedCost = '₹' + estimatedCostINR.toLocaleString('en-IN');

  // Prefilled response templates for polite scope boundary communication
  const replyTemplates = {
    REVIEW: `Hi! Thanks for reaching out. I've received your request regarding ${projectName}. I am currently reviewing our agreed Statement of Work deliverables to assess the technical scope and timeline impact. I'll get back to you with an update shortly!`,
    OUT_OF_SCOPE: `Hi! Thanks for the note regarding the new feature request for ${projectName}. Looking over our signed agreement, this work falls outside our current agreed scope. I've calculated this at approximately ${hours} hrs (${formattedCost}). I've drafted a formal Change Order proposal so we can schedule and deliver this without impacting our current milestone!`,
    PROPOSAL_READY: `Hi! Regarding your request for ${projectName}: I have prepared a detailed Change Order proposal outlining the deliverables, estimated timeline (${hours} hours), and cost (${formattedCost}). Please review the proposal so we can proceed!`,
  };

  const currentReplyText = replyTemplates[selectedTemplateType];

  // Build wa.me URL
  // Sanitize phone number (strip spaces, +, dashes)
  const sanitizedPhone = clientPhone.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(currentReplyText);
  const waUrl = sanitizedPhone
    ? `https://wa.me/${sanitizedPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(waUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(currentReplyText);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl overflow-hidden shadow-2xs transition-all">
      {/* Top Banner / Accordion Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/80 border-b border-emerald-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-900 tracking-tight">
                WhatsApp Client Request Assistant
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                Assisted Entry
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              Paste incoming WhatsApp messages from clients and clean timestamps with 1-click.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3.5 py-1.5 bg-white hover:bg-emerald-100/60 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors self-start sm:self-auto shrink-0"
        >
          {isOpen ? 'Hide Assistant' : 'Open WhatsApp Assistant'}
        </button>
      </div>

      {/* Explicit Architecture Boundary Notice */}
      <div className="px-5 py-2.5 bg-emerald-100/50 border-b border-emerald-200/60 text-[11px] text-emerald-900 flex items-center gap-2">
        <Info className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>
          <strong>Assisted Entry Guardrail:</strong> ScopeShield does not automatically read or send private WhatsApp messages and does not integrate WhatsApp Business API without credentials. All actions are client-side assisted.
        </span>
      </div>

      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-150">
          {/* Section 1: Paste Raw WhatsApp message */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Paste Copied WhatsApp Message</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Strips timestamps like <code className="text-emerald-700 bg-white px-1 rounded border border-emerald-200">[18/10/26, 11:15 AM] Name:</code>
              </span>
            </div>

            <textarea
              rows={4}
              value={rawWhatsAppMessage}
              onChange={(e) => setRawWhatsAppMessage(e.target.value)}
              placeholder="Paste raw WhatsApp text copied from mobile or WhatsApp Web here..."
              className="w-full p-3 text-xs border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white leading-relaxed"
            />

            {/* Quick Demo Pre-fills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-500">Try sample message:</span>
              {sampleWhatsAppMessages.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setRawWhatsAppMessage(sample.raw);
                    handleApplyToForm(sample.raw);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200 rounded-md transition-colors"
                >
                  {sample.title}
                </button>
              ))}
            </div>

            {/* Clean & Insert Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                disabled={!rawWhatsAppMessage.trim()}
                onClick={() => handleApplyToForm(rawWhatsAppMessage)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Clean & Insert into Client Request Field</span>
              </button>

              {cleanedPreview && (
                <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 self-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cleaned text transferred to Section 3 below</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Prefilled Click-to-Chat (wa.me) Generator */}
          <div className="pt-6 border-t border-emerald-200/70 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Optional: Generate WhatsApp Reply Link (Click-to-Chat)
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-300 px-2 py-0.5 rounded">
                  wa.me Link
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Respond to client scope requests professionally using pre-formatted scope boundary messages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Input phone & tone selector */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Client WhatsApp Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210 or leave blank"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    If blank, wa.me opens WhatsApp so you can choose any contact.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Response Template Tone
                  </label>
                  <div className="space-y-1.5">
                    <label className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-emerald-400 text-xs">
                      <input
                        type="radio"
                        name="templateType"
                        checked={selectedTemplateType === 'OUT_OF_SCOPE'}
                        onChange={() => setSelectedTemplateType('OUT_OF_SCOPE')}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-semibold text-slate-800">Change Order Required (Recommended)</div>
                        <div className="text-[11px] text-slate-500">Mentions agreement boundaries & estimated cost in INR</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-emerald-400 text-xs">
                      <input
                        type="radio"
                        name="templateType"
                        checked={selectedTemplateType === 'REVIEW'}
                        onChange={() => setSelectedTemplateType('REVIEW')}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-semibold text-slate-800">Scope Check in Progress</div>
                        <div className="text-[11px] text-slate-500">Acknowledges receipt while reviewing signed deliverables</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-emerald-400 text-xs">
                      <input
                        type="radio"
                        name="templateType"
                        checked={selectedTemplateType === 'PROPOSAL_READY'}
                        onChange={() => setSelectedTemplateType('PROPOSAL_READY')}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-semibold text-slate-800">Formal Proposal Ready</div>
                        <div className="text-[11px] text-slate-500">Alerts client that the Change Order draft is ready for review</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right: Message Preview & wa.me Click-to-Chat Button */}
              <div className="bg-white p-4 rounded-xl border border-emerald-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Prefilled Message Preview</span>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-normal"
                    >
                      {copiedMessage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedMessage ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                    {currentReplyText}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[10px] text-slate-400 truncate font-mono bg-slate-100 p-1.5 rounded">
                    {waUrl}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Open WhatsApp Web / App</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1 transition-colors"
                      title="Copy wa.me link to clipboard"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
