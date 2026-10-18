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
  DollarSign
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { currentUser, showToast, setCurrentPage } = useApp();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');

  // Interactive ROI Calculator states
  const [unbilledHoursPerMonth, setUnbilledHoursPerMonth] = useState<number>(8);
  const [hourlyRate, setHourlyRate] = useState<number>(currentUser.defaultHourlyRate || 125);

  const monthlyLostRevenue = unbilledHoursPerMonth * hourlyRate;
  const annualLostRevenue = monthlyLostRevenue * 12;

  const plans = [
    {
      id: 'FREE_TRIAL',
      name: 'Free Starter',
      tagline: 'Ideal for trying on a single client contract',
      priceMonthly: 0,
      priceAnnual: 0,
      features: [
        'Up to 3 Scope Checks per month',
        '1 Active Contract Index',
        'Basic Change Order generator',
        'Client email response templates',
        'Community support',
      ],
      cta: 'Current Plan',
      isPopular: false,
    },
    {
      id: 'SOLO',
      name: 'Pro Freelancer',
      tagline: 'Essential protection for full-time consultants',
      priceMonthly: 29,
      priceAnnual: 24, // $288 billed annually
      features: [
        'Unlimited Scope Analyses',
        'Unlimited Active Contracts & SOWs',
        'Deep Contract Clause Evidence extractor',
        'Interactive Cost & Timeline Calculator',
        'Client Digital Signature review portal',
        'Export to PDF & Markdown',
        'Slack / Jira / Email parser',
      ],
      cta: 'Upgrade to Pro',
      isPopular: true,
    },
    {
      id: 'AGENCY',
      name: 'Studio & Agency',
      tagline: 'For boutique dev shops and multi-freelancer teams',
      priceMonthly: 79,
      priceAnnual: 65,
      features: [
        'Everything in Pro Freelancer',
        'Up to 5 Team Seats included',
        'Custom Studio Branding & Logo on Change Orders',
        'Approval audit trail & team notification webhooks',
        'Custom hourly rate profiles by team member',
        'Priority SLA backend support',
      ],
      cta: 'Upgrade to Studio',
      isPopular: false,
    },
  ];

  const handleSelectPlan = (planName: string) => {
    showToast({
      type: 'success',
      title: 'Plan Selected',
      message: `You selected the ${planName} plan. (Hackathon demo sandbox mode active).`,
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-150 py-4 max-w-6xl mx-auto">
      {/* Header & Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          <span>Never Work for Free Again</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Turn Out-of-Scope Requests Into Paid Revenue
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          ScopeShield AI pays for itself the very first time you catch an unbudgeted feature before writing a single line of code.
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
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = billingCycle === 'ANNUAL' ? plan.priceAnnual : plan.priceMonthly;

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
                  Most Popular for Freelancers
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.tagline}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                    ${price}
                  </span>
                  <span className="text-xs font-medium text-slate-500">/ month</span>
                </div>
                {billingCycle === 'ANNUAL' && price > 0 && (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Billed annually (${price * 12}/yr)
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
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    plan.isPopular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Scope Creep ROI Calculator */}
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
              ${annualLostRevenue.toLocaleString()} / year
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                <span>Unbilled hours absorbed per month:</span>
                <span className="font-bold font-mono text-white">{unbilledHoursPerMonth} hours/mo</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                value={unbilledHoursPerMonth}
                onChange={(e) => setUnbilledHoursPerMonth(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 hr ("quick fix")</span>
                <span>20 hrs (half sprint)</span>
                <span>40 hrs (full sprint)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                <span>Your standard hourly consulting rate:</span>
                <span className="font-bold font-mono text-white">${hourlyRate}/hr</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>$50/hr</span>
                <span>$150/hr</span>
                <span>$300/hr</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="font-bold text-white text-sm">ROI Analysis:</div>
            <p>
              At your current rate of <span className="font-bold text-white">${hourlyRate}/hr</span>, unbilled scope creep costs you{' '}
              <span className="font-bold text-emerald-400 font-mono">${monthlyLostRevenue.toLocaleString()}</span> every month.
            </p>
            <p>
              With the ScopeShield AI Pro Plan ($24/mo), protecting just <span className="font-bold text-white">12 minutes</span> of out-of-scope work pays for your entire monthly subscription.
            </p>
            <button
              type="button"
              onClick={() => setCurrentPage('analyze')}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              <span>Scan your current client contract now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
