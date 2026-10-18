import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Check,
  Zap,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  ArrowRight,
  Calculator,
  Lock,
  Sparkles,
  Info,
  CreditCard,
  Building,
  ShieldAlert
} from 'lucide-react';
import { MockCheckoutModal } from '../components/pricing/MockCheckoutModal';

export const PricingPage: React.FC = () => {
  const { currentUser, showToast, setCurrentPage, setCurrentUser } = useApp();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');

  // Interactive ROI Calculator states in INR
  const [unbilledHoursPerMonth, setUnbilledHoursPerMonth] = useState<number>(8);
  const [hourlyRate, setHourlyRate] = useState<number>(currentUser.defaultHourlyRate || 8500);

  const monthlyLostRevenue = unbilledHoursPerMonth * hourlyRate;
  const annualLostRevenue = monthlyLostRevenue * 12;

  // Mock Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<{
    name: string;
    priceMonthly: number;
    priceAnnual: number;
  }>({
    name: 'Pro Freelancer',
    priceMonthly: 1999,
    priceAnnual: 1599,
  });

  const plans = [
    {
      id: 'FREE_TRIAL',
      name: 'Free Demo Sandbox',
      tierType: 'DEMO TIER',
      tagline: 'Ideal for hackathon testing on sample contracts',
      priceMonthly: 0,
      priceAnnual: 0,
      features: [
        'Up to 3 Scope Checks per month',
        '1 Active Contract Index',
        'WhatsApp manual text cleaner & sanitizer',
        'wa.me Click-to-Chat reply generator',
        'Basic Change Order proposal generator',
        'Local mock adapter & Member 2 endpoint switch',
        'Community evaluation support',
      ],
      cta: currentUser.plan === 'FREE_TRIAL' ? 'Current Sandbox Plan' : 'Select Free Demo',
      isPopular: false,
    },
    {
      id: 'PRO',
      name: 'Pro Freelancer',
      tierType: 'PROPOSED PAID PLAN',
      tagline: 'Proposed tier for independent consultants & dev contractors',
      priceMonthly: 1999,
      priceAnnual: 1599, // ₹19,188 billed annually
      features: [
        'Unlimited Scope Analyses via live AI backend',
        'Unlimited Active Contracts & signed SOWs',
        'Deep Contract Clause Evidence extractor',
        'WhatsApp-Assisted request importer & reply links',
        'Interactive Cost & Timeline Calculator (INR)',
        'Change Order text & document print exporter',
        'Proposal status tracking (Draft, Sent, Approved, Rejected)',
        'Local mock fallback when backend is offline',
      ],
      cta: currentUser.plan === 'PRO' ? 'Current Plan (Pro)' : 'Mock Checkout (Pro)',
      isPopular: true,
    },
    {
      id: 'AGENCY',
      name: 'Studio & Agency',
      tierType: 'PROPOSED PAID PLAN',
      tagline: 'Proposed tier for boutique software studios & multi-seat teams',
      priceMonthly: 4999,
      priceAnnual: 3999, // ₹47,988 billed annually
      features: [
        'Everything included in Pro Freelancer',
        'Up to 5 Freelancer Seats included',
        'Custom Studio Branding & Logo on Change Orders',
        'Multi-client approval audit trail & history',
        'Custom hourly rate profiles by team member in INR',
        'Priority SLA support & backend integration assist',
      ],
      cta: currentUser.plan === 'AGENCY' ? 'Current Plan (Studio)' : 'Mock Checkout (Studio)',
      isPopular: false,
    },
  ];

  const handleSelectPlan = (plan: typeof plans[0]) => {
    if (plan.id === 'FREE_TRIAL') {
      const updated = { ...currentUser, plan: 'FREE_TRIAL' as const };
      setCurrentUser(updated);
      localStorage.setItem('scopeshield_user', JSON.stringify(updated));
      showToast({
        type: 'info',
        title: 'Free Demo Active',
        message: 'Switched to the Free Demo Sandbox tier.',
      });
      return;
    }

    // Open Mock Checkout Modal for proposed paid plans
    setSelectedPlanForCheckout({
      name: plan.name,
      priceMonthly: plan.priceMonthly,
      priceAnnual: plan.priceAnnual,
    });
    setCheckoutModalOpen(true);
  };

  const handleSimulateCheckoutSuccess = (targetPlan: 'FREE_TRIAL' | 'SOLO' | 'PRO' | 'AGENCY') => {
    const updated = { ...currentUser, plan: targetPlan };
    setCurrentUser(updated);
    localStorage.setItem('scopeshield_user', JSON.stringify(updated));
    showToast({
      type: 'success',
      title: 'Mock Subscription Activated!',
      message: `Account upgraded to ${targetPlan === 'AGENCY' ? 'Studio Agency' : 'Pro Freelancer'} in demo mode. No payment was charged.`,
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-150 py-4 max-w-6xl mx-auto">
      {/* Proposed Pricing Mandatory Disclosures */}
      <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-2xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-amber-900 block">
              Proposed Pricing Disclosure · Not Validated Market Demand
            </span>
            <p className="text-amber-800 leading-relaxed">
              All commercial subscription amounts shown below are speculative proposed price points for freelance market testing, not validated commercial demand. Checkout is a mock sandbox. Real payment details are never requested or charged.
            </p>
          </div>
        </div>

        <div className="px-3 py-1 bg-amber-200/80 text-amber-900 font-extrabold text-[11px] rounded-lg shrink-0 border border-amber-300 self-start sm:self-auto">
          Demo Sandbox Mode
        </div>
      </div>

      {/* Header & Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          <span>Stop Unbilled Scope Creep</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Proposed Pricing & Plans
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Choose between our Free Demo and proposed commercial tiers designed to safeguard freelancer margins and bill for unbudgeted scope expansions.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="bg-slate-200/80 p-1 rounded-xl border border-slate-300 inline-flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                billingCycle === 'MONTHLY'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                billingCycle === 'ANNUAL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-1.5 py-0.5 rounded">
                Save ~20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = billingCycle === 'ANNUAL' ? plan.priceAnnual : plan.priceMonthly;
          const isCurrent = currentUser.plan === plan.id;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                plan.isPopular
                  ? 'bg-white border-2 border-indigo-600 shadow-xl relative'
                  : 'bg-white border border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  Proposed Flagship Tier
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    {plan.tierType}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.tagline}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {price === 0 ? 'forever free' : '/ month'}
                  </span>
                </div>
                {billingCycle === 'ANNUAL' && price > 0 && (
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Billed annually (₹{(price * 12).toLocaleString('en-IN')}/yr proposed)
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  <div className="text-xs font-bold text-slate-900">What's included:</div>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-200 text-slate-800 cursor-default'
                      : plan.isPopular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {price > 0 && <CreditCard className="w-3.5 h-3.5" />}
                  <span>{plan.cta}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Scope Creep ROI Calculator in INR */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Interactive ROI Calculator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">
              How Much Revenue Do You Lose to Unbilled Scope Creep?
            </h2>
          </div>
          <div className="text-left md:text-right">
            <span className="text-xs text-slate-400">Potential Annual Lost Income:</span>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">
              ₹{Math.round(annualLostRevenue).toLocaleString('en-IN')} / year
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {/* Slider 1: Unbilled hours */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span>Estimated unbilled "quick request" hours per month:</span>
              <span className="font-bold text-white font-mono">{unbilledHoursPerMonth} hrs/mo</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={unbilledHoursPerMonth}
              onChange={(e) => setUnbilledHoursPerMonth(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 hr</span>
              <span>20 hrs</span>
              <span>40 hrs/mo</span>
            </div>
          </div>

          {/* Slider 2: Hourly Rate */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                <span>Your standard hourly consulting rate:</span>
                <span className="font-bold font-mono text-white">₹{hourlyRate.toLocaleString('en-IN')}/hr</span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>₹1,000/hr</span>
                <span>₹12,500/hr</span>
                <span>₹25,000/hr</span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
              <span className="text-slate-400">Monthly unbilled revenue leaked:</span>
              <span className="font-extrabold text-amber-400 font-mono text-sm">
                ₹{Math.round(monthlyLostRevenue).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Features Inventory & Documentation Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              ScopeShield AI Feature Inventory & Demo Mode Disclosures
            </h3>
            <p className="text-xs text-slate-500">
              Transparent summary of operational modes across the ScopeShield platform
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Authentication (Demo Mode)</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Firebase Auth is not configured on this host. User sessions and personas are stored in local browser state and are not cryptographically verified.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Pricing & Checkout (Mock Mode)</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Prices are speculative proposed tiers. Checkout is a mock sandbox. No credit cards or UPI credentials are processed or collected.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>WhatsApp Assistant (Assisted Mode)</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Provides manual copy-paste text sanitizer and wa.me prefilled click-to-chat links. Does not automatically read messages or call WhatsApp Business API.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Contract Analysis (Live / Mock Dual)</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Submits multipart contract and request data to Member 2's backend on POST /api/analyze, with seamless fallback to verified local mock adapter.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Proposals & Change Orders</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Full interactive editing, live INR recalculations, Draft/Sent/Approved statuses, clipboard copy, and print styling. Non-binding commercial document.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>Approval Tracking Board</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Four status columns (Draft, Sent, Approved, Rejected) tracking freelance revenue potential in INR across active proposals.
            </p>
          </div>
        </div>
      </div>

      {/* Mock Checkout Modal */}
      <MockCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        planName={selectedPlanForCheckout.name}
        planPriceINR={billingCycle === 'ANNUAL' ? selectedPlanForCheckout.priceAnnual * 12 : selectedPlanForCheckout.priceMonthly}
        billingCycle={billingCycle}
        onSimulateSuccess={handleSimulateCheckoutSuccess}
      />
    </div>
  );
};
