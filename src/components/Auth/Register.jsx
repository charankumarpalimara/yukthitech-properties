import { useState, useEffect } from 'react';
import {
  useAuthStore,
  register,
  closeRegisterModal,
  openLoginModal,
  sendOtp,
} from '../../store/authStore';
import { ArrowLeft, User, Mail, Phone, ArrowRight, Loader2, X, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
  });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const isRegisterModalOpen = useAuthStore((s) => s.isRegisterModalOpen);

  useEffect(() => {
    if (!isRegisterModalOpen) {
      setTimeout(() => {
        setStep(1);
        setOtp(['', '', '', '']);
        setFormData({ name: '', email: '', mobile: '' });
        setIsSuccess(false);
        setTimer(0);
      }, 300); // Wait for close animation
    }
  }, [isRegisterModalOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'mobile' ? value.replace(/\D/g, '').slice(0, 10) : value,
    }));
  };

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || formData.mobile.length !== 10) return;

    try {
      await sendOtp({ mobile: formData.mobile, type: 'register' });
      setStep(2);
      setTimer(30);
    } catch {
      /* error in store */
    }
  };

  const handleVerifyRegister = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 4) return;

    if (formData.name && formData.email && formData.mobile) {
      try {
        await register({ ...formData, otp: otpString });
        setIsSuccess(true);
        setTimeout(() => {
          closeRegisterModal();
        }, 1500);
      } catch {
        /* error in store */
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`reg-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`reg-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  if (!isRegisterModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm font-outfit"
      style={{ overflowY: 'auto' }}
      onClick={() => closeRegisterModal()}
    >
      <div className="min-h-full flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-[400px] relative z-10" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-2xl p-8 relative animate-in fade-in duration-500">
            <button
              onClick={() => closeRegisterModal()}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>
            <div className="mb-6 text-center">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-3 text-white shadow-lg">
                <User size={22} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-0.5">Create Account</h2>
              <p className="text-xs font-medium text-slate-500">Join the community today</p>
            </div>

            <div className="relative">
              {step === 1 ? (
                <form className="space-y-4" onSubmit={handleSendOtp}>
                  <div className="flex flex-col gap-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                          className="w-full pr-4 !bg-white border-2 !border-gray-400 rounded-xl text-sm font-semibold !text-gray-900 shadow-sm outline-none focus:!border-amber-500 transition-all placeholder:text-gray-500"
                          style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '44px' }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@example.com"
                          className="w-full pr-4 !bg-white border-2 !border-gray-400 rounded-xl text-sm font-semibold !text-gray-900 shadow-sm outline-none focus:!border-amber-500 transition-all placeholder:text-gray-500"
                          style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '44px' }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          required
                          placeholder="00000 00000"
                          className="w-full pr-4 !bg-white border-2 !border-gray-400 rounded-xl text-sm font-semibold !text-gray-900 shadow-sm outline-none focus:!border-amber-500 transition-all placeholder:text-gray-500"
                          style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '44px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs font-semibold text-center bg-red-50 py-3 rounded-xl border border-red-100 mb-4">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-slate-100"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyRegister} className="space-y-8">
                  <div className="space-y-4 max-w-[280px] mx-auto">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-md font-bold text-slate-400 tracking-wider">
                        Enter the OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        Change Details
                      </button>
                    </div>
                    <div className="flex justify-center gap-3 sm:gap-4">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`reg-otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-12 h-14 sm:w-14 sm:h-14 text-center text-xl font-bold !bg-white border-2 !border-gray-400 rounded-xl focus:!border-amber-500 outline-none transition-all !text-gray-900 shadow-sm"
                        />
                      ))}
                    </div>
                    <div className="flex justify-end px-1">
                      <button
                        type="button"
                        disabled={timer > 0 || loading}
                        onClick={handleSendOtp}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 disabled:text-slate-300 transition-colors flex items-center gap-1.5"
                      >
                        {timer > 0 ? `Resend in ${timer}s` : <>Resend OTP</>}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs font-semibold text-center bg-red-50 py-3 rounded-xl border border-red-100">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 4 || isSuccess}
                    className={`w-full text-white py-3 rounded-xl text-sm font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${isSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-900 hover:bg-slate-800'}`}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : isSuccess ? (
                      <>
                        <CheckCircle2 size={20} /> Registration Successful!
                      </>
                    ) : (
                      <>Verify & Register</>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className=" text-center pt-5 border-t border-slate-100">
              <p className="text-sm font-medium text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="text-amber-600 font-bold hover:text-amber-700 transition-colors ml-1"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
