import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  Check,
  Lock,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  Building
} from 'lucide-react';
import { UserProfile } from '../../types';

interface MockCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPriceINR: number;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  onSimulateSuccess: (plan: 'FREE_TRIAL' | 'SOLO' | 'PRO' | 'AGENCY') => void;
}

export const MockCheckoutModal: React.FC<MockCheckoutModalProps> = ({
  isOpen,
  onClose,
  planName,
  planPriceINR,
  billingCycle,
  onSimulateSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI'>('CARD');
  const [mockCardholder, setMockCardholder] = useState('');
  const [mockCardNumber, setMockCardNumber] = useState('');
  const [mockExpiry, setMockExpiry] = useState('');
  const [mockCVC, setMockCVC] = useState('');
  const [mockUpiId, setMockUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleFillTestCredentials = () => {
    if (paymentMethod === 'CARD') {
      setMockCardholder('Alex Rivera (Demo Freelancer)');
      setMockCardNumber('4242 •••• •••• 4242');
      setMockExpiry('12/28');
      setMockCVC('999');
    } else {
      setMockUpiId('freelancer.alex@okaxis');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);

      const targetPlan = planName.includes('Studio') ? 'AGENCY' : 'PRO';
      setTimeout(() => {
        onSimulateSuccess(targetPlan);
        onClose();
        setIsCompleted(false);
      }, 1200);
    }, 1000);
  };

  const formattedAmount = '₹' + planPriceINR.toLocaleString('en-IN');
  const billingSubtitle = billingCycle === 'ANNUAL' ? 'billed annually' : 'billed monthly';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>Mock Checkout Sandbox</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                  Demo Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulated transaction for {planName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Warning Banner: DO NOT ENTER REAL PAYMENT DETAILS */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-amber-950 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-extrabold text-amber-900 uppercase tracking-wider text-[11px]">
              Do Not Enter Real Financial Details
            </div>
            <p className="text-amber-800 leading-relaxed">
              This is an interactive mock demonstration for evaluation. No payment processor (Stripe, Razorpay) is connected. Real credit cards, UPI PINs, or bank details are never accepted or charged.
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Order Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">{planName}</div>
              <div className="text-[11px] text-slate-500">{billingSubtitle} (Proposed Pricing)</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold text-slate-900 font-mono">
                {formattedAmount}
              </div>
              <div className="text-[10px] text-slate-400">Indian Rupees (INR)</div>
            </div>
          </div>

          {/* Payment Method Switcher */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                paymentMethod === 'CARD'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Simulated Card</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('UPI')}
              className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                paymentMethod === 'UPI'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Simulated UPI / VPA</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {paymentMethod === 'CARD' ? (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={mockCardholder}
                    onChange={(e) => setMockCardholder(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mock Card Number (Masked Test Pattern)
                  </label>
                  <input
                    type="text"
                    value={mockCardNumber}
                    onChange={(e) => setMockCardNumber(e.target.value)}
                    placeholder="4242 •••• •••• 4242"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={mockExpiry}
                      onChange={(e) => setMockExpiry(e.target.value)}
                      placeholder="12/28"
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      value={mockCVC}
                      onChange={(e) => setMockCVC(e.target.value)}
                      placeholder="•••"
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Virtual Payment Address (UPI ID)
                </label>
                <input
                  type="text"
                  value={mockUpiId}
                  onChange={(e) => setMockUpiId(e.target.value)}
                  placeholder="freelancer@okhdfcbank"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Simulated UPI transaction in Indian Rupee denomination.
                </span>
              </div>
            )}

            {/* Quick Fill Test Credentials Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleFillTestCredentials}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Mock Test Credentials</span>
              </button>

              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Mock Sandbox</span>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing || isCompleted}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Simulating Payment Verification...</span>
                  </>
                ) : isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mock Upgrade Approved!</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Simulate Subscription ({formattedAmount})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>ScopeShield AI Sandbox Billing</span>
          <span>No real charge will occur</span>
        </div>
      </div>
    </div>
  );
};
