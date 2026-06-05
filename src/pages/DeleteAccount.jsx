import React, { useState } from 'react';
import InfoLayout from '../components/InfoLayout/InfoLayout';
import { API_URL, apiClient } from '../service/api';
import toast from 'react-hot-toast';
import {
  ShieldAlert,
  Trash2,
  CheckCircle2,
  MessageSquare,
  Phone,
  Mail,
  User,
  Send,
} from 'lucide-react';

export default function DeleteAccount() {
  const [activeTab, setActiveTab] = useState('otp'); // 'otp' or 'manual'
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Form states
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setOtpSent(true);
        toast.success('OTP sent successfully! (Use "1234" for testing)');
      } else {
        toast.error(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndDelete = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!otp) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }

    if (
      !window.confirm(
        'WARNING: Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/delete-account-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          otp,
          reason: reason || 'Instant deletion via website OTP verification',
        }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Your account has been deleted successfully.');
        setOtpSent(false);
        setOtp('');
        setMobile('');
        setReason('');
      } else {
        toast.error(data.message || 'Verification failed. Please check the OTP code.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Failed to delete account.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/delete-account-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          mobile,
          reason,
        }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Request submitted successfully.');
        setName('');
        setEmail('');
        setMobile('');
        setReason('');
      } else {
        toast.error(data.message || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <InfoLayout title="Delete Your Account">
      <div className="max-w-2xl mx-auto space-y-8 animate-in">
        {/* Warning Banner */}
        <div className="p-5 border border-red-200 bg-red-50/50 rounded-2xl flex gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl h-fit">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-red-900 font-semibold text-base mb-1">
              Important: Account Deletion is Permanent
            </h4>
            <p className="text-red-700 text-sm leading-relaxed">
              Once your account is deleted, all associated listings, subscription records, and
              search histories will be permanently removed. You will lose access to your profile and
              cannot recover any of your data.
            </p>
          </div>
        </div>

        {/* What gets deleted list */}
        <div className="border border-slate-100 bg-slate-50/50 p-6 rounded-2xl">
          <h5 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wider">
            What will be removed
          </h5>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-700 text-sm">Personal Profile Info</p>
                <p className="text-slate-500 text-xs">
                  Your name, avatar, contact details, and logs.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-700 text-sm">Active & Draft Listings</p>
                <p className="text-slate-500 text-xs">All properties posted on the marketplace.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-700 text-sm">Active Subscriptions</p>
                <p className="text-slate-500 text-xs">
                  Any ongoing real estate listing slot subscriptions.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-700 text-sm">Wishlists & Preferences</p>
                <p className="text-slate-500 text-xs">
                  Saved listings, searches, and app notifications.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Tab selection */}
        {/* <div className="flex border-b border-slate-100">
          <button
            onClick={() => { setActiveTab('otp'); setOtpSent(false); }}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'otp'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <Phone className="w-4 h-4" />
            Delete Instantly (via OTP)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'manual'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            Submit Manual Request
          </button>
        </div> */}

        {/* Tab Content 1: Instant deletion via OTP */}
        {activeTab === 'otp' && (
          <div className="space-y-6">
            <p className="text-sm text-slate-500 leading-relaxed">
              Verify your ownership instantly by receiving a 4-digit code on your registered mobile
              number. This will perform an immediate cleanup of your account.
            </p>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Enter your 10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Reason for Leaving (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us why you want to delete your account"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending...' : 'Send Verification OTP'}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndDelete} className="space-y-4">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-slate-700">
                    OTP sent to <span className="font-semibold text-slate-900">+91 {mobile}</span>.
                    Enter code to complete deletion.
                  </p>
                  <div className="relative flex justify-center">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Enter 4-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className={`w-full max-w-[260px] py-3 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent text-center font-bold text-xl transition-all ${
                        otp ? 'tracking-[0.7em] pl-[0.7em]' : 'tracking-normal'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl transition-all"
                  >
                    Change Number
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : 'Confirm & Delete Account'}
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab Content 2: Manual Request submission */}
        {/* {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              If you no longer have access to your phone or registered SIM, submit this direct request. Our administrators will verify and process your deletion request manually.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Reason for Deletion</label>
              <div className="relative">
                <MessageSquare className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <textarea
                  rows={4}
                  placeholder="Please describe your issue or reason for deleting the account"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all resize-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Submitting...' : 'Submit Deletion Request'}
              <Send className="w-4 h-4" />
            </button>
          </form>
        )} */}
      </div>
    </InfoLayout>
  );
}
