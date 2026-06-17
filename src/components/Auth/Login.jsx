import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, sendOtp, verifyOtp, register, closeLoginModal } from '../../store/authStore';
import {
  ArrowRight,
  Loader2,
  RefreshCw,
  X,
  CheckCircle2,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { LogoIcon } from '../../data/icons';

const WHATSAPP_SUPPORT = '919804293293';

const STEP_META = {
  1: {
    label: 'Phone',
    title: 'Sign in to Yukthi',
    subtitle: 'Enter your mobile number. We will send a one-time password to verify you.',
  },
  2: {
    label: 'Verify',
    title: 'Enter verification code',
    subtitle: 'Type the 4-digit OTP sent to your phone.',
  },
  3: {
    label: 'Profile',
    title: 'Complete your profile',
    subtitle: 'A few details to set up your Yukthi Properties account.',
  },
};

const TRUST_POINTS = [
  { icon: ShieldCheck, text: 'Secure OTP login' },
  { icon: Sparkles, text: 'Verified property listings' },
];

/** Profile incomplete — isRegister false → show register step in same modal. */
const requiresProfileRegistration = (response) => response?.isRegister === false;

/** Already registered — isRegister true → login complete (token may follow on verify or register). */
const isExistingUserLogin = (response) =>
  response?.isRegister === true && Boolean(response?.data);

const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.116 1.528 5.845L.057 23.428a.5.5 0 0 0 .609.61l5.657-1.484A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.36-.214-3.732.979.996-3.648-.234-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.566 6.566 2.182 12 2.182S21.818 6.566 21.818 12 17.434 21.818 12 21.818z" />
  </svg>
);

const isAccountSupportError = (message) =>
  Boolean(message && /suspended|inactive|contact support/i.test(message));

const openWhatsAppSupport = () => {
  const text =
    'Hi Yukthi Properties, I need help with my account. I am unable to log in and was asked to contact support.';
  window.open(
    `https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(text)}`,
    '_blank',
    'noopener,noreferrer'
  );
};

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-gold focus:ring-4 focus:ring-gold/15';

function AuthErrorAlert({ error }) {
  if (!error) return null;
  const showWhatsApp = isAccountSupportError(error);

  return (
    <div className="animate-in fade-in rounded-xl border border-red-100 bg-red-50 px-4 py-3 duration-200">
      <p className="text-center text-xs font-semibold leading-relaxed text-red-600">{error}</p>
      {showWhatsApp && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={openWhatsAppSupport}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#25D366]/25 bg-[#25D366]/10 text-[#25D366] transition-all hover:bg-[#25D366] hover:text-white active:scale-95"
            aria-label="Contact support on WhatsApp"
          >
            <WhatsAppIcon />
          </button>
        </div>
      )}
    </div>
  );
}

function StepProgress({ step, showProfileStep }) {
  const steps = showProfileStep ? [1, 2, 3] : [1, 2];
  const total = steps.length;

  return (
    <div className="mb-6 flex items-center gap-2" aria-label={`Step ${Math.min(step, total)} of ${total}`}>
      {steps.map((n, idx) => {
        const active = step === n;
        const done = step > n;
        return (
          <div key={n} className="flex flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  done
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : active
                      ? 'bg-gold text-white shadow-md shadow-gold/25 ring-4 ring-gold/15'
                      : 'border border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : n}
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  active || done ? 'text-primary' : 'text-slate-400'
                }`}
              >
                {STEP_META[n].label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`mb-5 h-0.5 flex-1 rounded-full transition-colors ${
                  step > n ? 'bg-primary/40' : 'bg-slate-100'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-[#034432] to-primary-dark p-8 text-white md:flex md:flex-col md:justify-between">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl"
        aria-hidden
      />

      <div className="relative z-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
            <LogoIcon className="h-8 w-8 text-white" />
          </span>
          <div>
            <p className="text-lg font-bold leading-tight">Yukthi Properties</p>
            <p className="text-xs font-medium text-white/60">Trusted property discovery</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white leading-snug tracking-tight">
          Find, save, and connect on India&apos;s verified property platform.
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
          Log in to save favourites, contact sellers, and manage your listings.
        </p>
      </div>

      <ul className="relative z-10 mt-10 space-y-3">
        {TRUST_POINTS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2.5 text-sm text-white/85">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-gold">
              <Icon className="h-4 w-4" />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrimaryButton({ children, disabled, loading, success, type = 'submit' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${
        success
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
          : 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-[#034432]'
      }`}
    >
      {loading ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : children}
    </button>
  );
}

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const panelRef = useRef(null);

  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const modalMessage = useAuthStore((s) => s.modalMessage);

  const resetForm = useCallback(() => {
    setStep(1);
    setNeedsRegistration(false);
    setOtp(['', '', '', '']);
    setMobile('');
    setName('');
    setEmail('');
    setIsSuccess(false);
    setTimer(0);
  }, []);

  useEffect(() => {
    if (!isLoginModalOpen) {
      const timeout = setTimeout(resetForm, 300);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isLoginModalOpen, resetForm]);

  useEffect(() => {
    if (!isLoginModalOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeLoginModal();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isLoginModalOpen]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (step === 2) {
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
    }
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) return;

    try {
      await sendOtp({ mobile, type: 'login' });
      setStep(2);
      setTimer(30);
    } catch {
      /* error in store */
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 4) return;

    try {
      const result = await verifyOtp({ mobile, otp: otpString });

      if (requiresProfileRegistration(result)) {
        setNeedsRegistration(true);
        setStep(3);
      } else if (isExistingUserLogin(result)) {
        setIsSuccess(true);
        setTimeout(closeLoginModal, 1500);
      }
    } catch {
      /* error in store */
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      await register({ mobile, name, email, otp: otp.join('') });
      setIsSuccess(true);
      setTimeout(closeLoginModal, 1500);
    } catch {
      /* error in store */
    }
  };

  const handleOtpChange = (index, value) => {
    if (Number.isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    e.preventDefault();
    const digits = pasted.split('');
    setOtp([digits[0] || '', digits[1] || '', digits[2] || '', digits[3] || '']);
    document.getElementById(`otp-${Math.min(digits.length, 3)}`)?.focus();
  };

  if (!isLoginModalOpen) return null;

  const { title, subtitle } = STEP_META[step];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-primary/55 p-0 font-outfit backdrop-blur-[6px] sm:items-center sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onClick={() => closeLoginModal()}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-full animate-in slide-in-from-bottom duration-300 sm:max-w-[720px] sm:zoom-in-95 sm:duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[24px] border border-slate-200/80 bg-white shadow-[0_24px_80px_-12px_rgba(2,53,38,0.35)] sm:max-h-[min(90dvh,640px)] sm:rounded-2xl sm:grid sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <BrandPanel />

          <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
            <div className="mb-5 h-1 w-10 shrink-0 self-center rounded-full bg-slate-200 sm:hidden" />

            <button
              type="button"
              onClick={() => closeLoginModal()}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition-all hover:border-slate-200 hover:text-slate-600 active:scale-95 sm:right-6 sm:top-6"
              aria-label="Close login"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-1 flex items-center gap-2.5 md:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5">
                <LogoIcon className="h-7 w-7 text-primary" />
              </span>
              <span className="text-sm font-bold text-slate-900">Yukthi Properties</span>
            </div>

            {modalMessage && (
              <div className="mb-4 animate-in slide-in-from-top-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-xs font-semibold leading-relaxed text-amber-900 duration-300">
                {modalMessage}
              </div>
            )}

            <StepProgress step={step} showProfileStep={needsRegistration} />

            <div className="mb-6">
              <h2 id="login-modal-title" className="text-xl font-bold tracking-tight text-slate-900 sm:text-[1.35rem]">
                {title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>
            </div>

            <div className="flex-1">
              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="login-mobile" className="ml-0.5 text-xs font-semibold text-slate-600">
                      Mobile number
                    </label>
                    <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/15">
                      <span className="flex items-center gap-1.5 border-r border-slate-200 bg-slate-50 px-3.5 text-sm font-bold text-slate-600">
                        <Phone className="h-4 w-4 text-primary" />
                        +91
                      </span>
                      <input
                        id="login-mobile"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        required
                        autoFocus
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-sm font-semibold tracking-wide text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400"
                        placeholder="10-digit number"
                      />
                    </div>
                  </div>

                  <AuthErrorAlert error={error} />

                  <PrimaryButton disabled={loading || mobile.length !== 10} loading={loading}>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs leading-relaxed text-slate-500">
                        Code sent to{' '}
                        <span className="font-bold text-slate-800">+91 ******{mobile.slice(-4)}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="shrink-0 text-xs font-bold text-primary transition-colors hover:text-primary-dark"
                      >
                        Edit
                      </button>
                    </div>

                    <div
                      className="flex justify-center gap-2.5 sm:gap-3"
                      onPaste={handleOtpPaste}
                    >
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          autoComplete={index === 0 ? 'one-time-code' : 'off'}
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="h-12 w-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-lg font-bold text-slate-900 outline-none transition-all focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold/15 sm:h-14 sm:w-12 sm:text-xl"
                          aria-label={`Digit ${index + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        disabled={timer > 0 || loading}
                        onClick={handleSendOtp}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary-dark disabled:text-slate-300"
                      >
                        {timer > 0 ? (
                          <span>Resend in {timer}s</span>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" />
                            Resend OTP
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <AuthErrorAlert error={error} />

                  <PrimaryButton
                    disabled={loading || otp.join('').length !== 4 || isSuccess}
                    loading={loading}
                    success={isSuccess}
                  >
                    {isSuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Welcome back!
                      </>
                    ) : (
                      'Verify & continue'
                    )}
                  </PrimaryButton>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="login-name" className="ml-0.5 text-xs font-semibold text-slate-600">
                        Full name
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          id="login-name"
                          type="text"
                          autoComplete="name"
                          required
                          autoFocus
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`${inputClass} pl-10`}
                          placeholder="Your full name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="login-email" className="ml-0.5 text-xs font-semibold text-slate-600">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          id="login-email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`${inputClass} pl-10`}
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <AuthErrorAlert error={error} />

                  <PrimaryButton
                    disabled={loading || !name || !email || isSuccess}
                    loading={loading}
                    success={isSuccess}
                  >
                    {isSuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Account created!
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </PrimaryButton>
                </form>
              )}
            </div>

            <p className="mt-6 border-t border-slate-100 pt-4 text-center text-[11px] leading-relaxed text-slate-400">
              By continuing, you agree to our{' '}
              <Link
                to="/terms-conditions"
                className="font-semibold text-primary hover:underline"
                onClick={() => closeLoginModal()}
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy-policy"
                className="font-semibold text-primary hover:underline"
                onClick={() => closeLoginModal()}
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
