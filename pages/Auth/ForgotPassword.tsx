import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen flex items-center justify-center p-0 md:p-4 lg:p-0">
      <div className="flex flex-col md:flex-row w-full h-full min-h-screen lg:min-h-[800px] max-w-[1440px] shadow-2xl overflow-hidden lg:rounded-xl">
        {/* Left Side */}
        <div className="relative hidden md:flex flex-1 flex-col justify-between p-12 bg-primary overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-primary/60 z-10"></div>
            <img alt="Academic Background" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop" />
          </div>
          <div className="relative z-20 flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg text-primary">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <h2 className="text-white text-3xl font-black tracking-tight font-serif">Nkiza</h2>
          </div>
          <div className="relative z-20 max-w-md">
            <h1 className="text-white text-5xl font-black leading-tight font-serif mb-6">Password Recovery</h1>
            <p className="text-white/90 text-lg leading-relaxed">Enter your email and we'll send you instructions to reset your password so you can regain access to your account.</p>
          </div>
          <div className="relative z-20 flex gap-4 text-white/60 text-sm">
            <span>© 2024 Nkiza Journals</span>
            <span>Privacy Policy</span>
          </div>
        </div>
        {/* Right Side */}
        <div className="flex-1 bg-white flex flex-col justify-center items-center px-6 py-12 md:px-16 lg:px-24">
          <div className="w-full max-w-[440px]">
            <div className="flex md:hidden items-center gap-2 mb-8 justify-center">
              <span className="material-symbols-outlined text-primary text-3xl">school</span>
              <h2 className="text-[#0d121b] text-2xl font-black font-serif">Nkiza</h2>
            </div>
            <div className="mb-8">
              <h3 className="text-[#0d121b] text-2xl font-bold font-serif mb-2">Forgot Password?</h3>
              <p className="text-[#4c669a] text-sm">We'll send you a secure link to reset it.</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="size-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-2xl">mark_email_read</span>
                </div>
                <h4 className="text-lg font-bold text-green-900 mb-2">Check Your Email</h4>
                <p className="text-green-800 text-sm mb-6">
                  We have sent a password reset link to <strong>{email}</strong>.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleReset}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#0d121b] text-sm font-semibold">Email Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
                    <input
                      className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-[#cfd7e7] focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      placeholder="name@university.edu"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  className={`w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>
            )}

            <div className="mt-8 text-center text-sm">
              <button onClick={() => navigate('/login')} className="flex items-center justify-center gap-1 text-[#4c669a] mx-auto hover:text-primary transition-colors font-medium">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
