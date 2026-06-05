import { useState, useEffect } from 'react';
import { useAuthStore, sendOtp, verifyOtp, register, closeLoginModal } from '../../store/authStore';
import { ArrowRight, Loader2, RefreshCw, X, CheckCircle2, User, Mail } from 'lucide-react';
import { LogoIcon } from '../../data/icons';

const WHATSAPP_SUPPORT = '919804293293';

const WhatsAppIcon = ({ size = 22 }) => (
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

function AuthErrorAlert({ error }) {
  if (!error) return null;
  const showWhatsApp = isAccountSupportError(error);

  return (
    <div className="p-3 rounded-xl bg-red-50 border border-red-100 animate-in fade-in duration-200">
      <p className="text-red-600 text-xs font-semibold text-center">{error}</p>
      {showWhatsApp && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={openWhatsAppSupport}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all active:scale-95"
            aria-label="Contact support on WhatsApp"
          >
            <WhatsAppIcon />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP, 3: Register
  const [timer, setTimer] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const modalMessage = useAuthStore((s) => s.modalMessage);

  useEffect(() => {
    if (!isLoginModalOpen) {
      const timeout = setTimeout(() => {
        setStep(1);
        setOtp(['', '', '', '']);
        setMobile('');
        setName('');
        setEmail('');
        setIsSuccess(false);
        setTimer(0);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isLoginModalOpen]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Focus the first OTP input when step changes to 2
  useEffect(() => {
    if (step === 2) {
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
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
      if (result?.isRegister) {
        setIsSuccess(true);
        setTimeout(() => {
          closeLoginModal();
        }, 1500);
      } else {
        setStep(3);
      }
    } catch {
      /* error in store */
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      await register({ mobile, name, email });
      setIsSuccess(true);
      setTimeout(() => {
        closeLoginModal();
      }, 1500);
    } catch {
      /* error in store */
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  if (!isLoginModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 font-outfit"
      style={{ animation: 'loginFadeIn 0.2s ease-out' }}
      onClick={() => closeLoginModal()}
    >
      <div
        className="relative w-full max-w-full sm:max-w-[460px]"
        style={{ animation: 'loginSlideUp 0.25s ease-out', willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-white border border-slate-100 shadow-2xl rounded-t-[28px] sm:rounded-3xl overflow-hidden p-6 sm:p-10 pb-8 sm:pb-10">
          {/* Mobile bottom sheet grab handle */}
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 block sm:hidden" />

          {/* Close Button */}
          <button
            onClick={() => closeLoginModal()}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all active:scale-95 z-20"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
            {modalMessage && (
              <div className="mb-4 sm:mb-6 px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-[11px] sm:text-xs font-semibold animate-in slide-in-from-top-2 duration-500">
                {modalMessage}
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5">
              <div className="h-14 w-14 sm:h-18 sm:w-18 shrink-0 rounded-xl flex items-center justify-center p-1">
                <LogoIcon className="h-12 w-12 shrink-0 text-[#023526]" />
              </div>
              <div className="flex min-w-0 flex-col items-start text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  Yukthi Properties
                </h1>
              </div>
            </div>
            <p className="mt-2 text-sm sm:text-md font-semibold text-slate-500 leading-relaxed">
              {step === 1
                ? 'Enter your phone number to log in'
                : step === 2
                  ? 'Enter the 4-digit code sent to your phone'
                  : 'Please enter your details to create an account'}
            </p>
          </div>

          {/* Form Content */}
          <div className="relative">
            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-5">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs font-semibold text-slate-600 ml-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 pr-3 border-r border-slate-200">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      autoFocus
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-16 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all tracking-wide"
                      placeholder="Enter 10-digit number"
                    />
                  </div>
                </div>

                <AuthErrorAlert error={error} />

                <button
                  type="submit"
                  disabled={loading || mobile.length !== 10}
                  className="w-full py-2.5 sm:py-3 bg-primary text-white rounded-xl sm:rounded-2xl text-sm sm:text-md font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      Get OTP <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : step === 2 ? (
              <form onSubmit={handleVerifyOtp} className="space-y-5 sm:space-y-6">
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex justify-between items-center px-1">
                    <div className="space-y-0.5">
                      <label className="text-[11px] sm:text-xs font-semibold text-slate-600">
                        Enter Code
                      </label>
                      <p className="text-[11px] sm:text-xs text-slate-400">
                        We sent a code to{' '}
                        <span className="font-semibold text-slate-700">
                          *******{mobile.slice(-3)}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[12px] sm:text-[13px] font-semibold text-amber-600 hover:text-amber-700 transition-colors hover:underline"
                    >
                      Change number
                    </button>
                  </div>

                  <div className="flex justify-between gap-2.5 max-w-[240px] sm:max-w-[260px] mx-auto">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        autoFocus={index === 0}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-slate-900"
                      />
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      disabled={timer > 0 || loading}
                      onClick={handleSendOtp}
                      className="text-xs sm:text-sm font-semibold bg-priamry text-amber-600 hover:text-amber-700 disabled:text-slate-300 transition-all flex items-center gap-1.5"
                    >
                      {timer > 0 ? (
                        <span>Send code again in {timer}s</span>
                      ) : (
                        <span className="flex items-center gap-1 hover:underline">
                          <RefreshCw size={12} /> Send code again
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <AuthErrorAlert error={error} />

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 4 || isSuccess}
                  className={`w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg ${
                    isSuccess
                      ? 'bg-primary text-white shadow-emerald-600/10'
                      : 'bg-primary text-white shadow-slate-900/10 disabled:opacity-50'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 size={18} /> Logged in successfully!
                    </>
                  ) : (
                    <>Verify OTP</>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-1.5">
                    <label className="text-[11px] sm:text-xs font-semibold text-slate-600 ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-1.5">
                    <label className="text-[11px] sm:text-xs font-semibold text-slate-600 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                <AuthErrorAlert error={error} />

                <button
                  type="submit"
                  disabled={loading || !name || !email || isSuccess}
                  className={`w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg ${
                    isSuccess
                      ? 'bg-primary text-white shadow-emerald-600/10'
                      : 'bg-primary text-white shadow-slate-900/10 disabled:opacity-50'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 size={18} /> Account created successfully!
                    </>
                  ) : (
                    <>Create Account</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
