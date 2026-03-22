import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if there is an active session or a recovery hash in the URL
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !window.location.hash.includes('type=recovery')) {
        setError('Invalid or expired password reset link. Please request a new one.');
      }
    });

    // Event listener for auth state changes (e.g. recovery link clicked and session established)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Ready to reset password
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
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
            <h1 className="text-white text-5xl font-black leading-tight font-serif mb-6">Create New Password</h1>
            <p className="text-white/90 text-lg leading-relaxed">Please make sure your new password is secure and at least 6 characters long.</p>
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
              <h3 className="text-[#0d121b] text-2xl font-bold font-serif mb-2">Reset Password</h3>
              <p className="text-[#4c669a] text-sm">Enter your new password below.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">error</span>
                  <span>{error}</span>
                </div>
                {error.includes('expired') && (
                  <button onClick={() => navigate('/forgot-password')} className="flex-shrink-0 text-red-700 font-bold hover:underline">
                    New Link
                  </button>
                )}
              </div>
            )}

            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="size-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-2xl">password</span>
                </div>
                <h4 className="text-lg font-bold text-green-900 mb-2">Password Updated!</h4>
                <p className="text-green-800 text-sm mb-6">
                  Your password has been successfully reset.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleUpdatePassword}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#0d121b] text-sm font-semibold">New Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                    <input
                      className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-[#cfd7e7] focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={!!error && error.includes('expired')}
                    />
                  </div>
                </div>
                <button
                  className={`w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 ${(!password || loading || (error && error.includes('expired'))) ? 'opacity-70 cursor-not-allowed' : ''}`}
                  type="submit"
                  disabled={!password || loading || (!!error && error.includes('expired'))}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
