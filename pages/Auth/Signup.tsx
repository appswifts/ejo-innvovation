import React, { useState } from 'react';
import { ViewState } from '../../types';
import { supabase } from '../../lib/supabaseClient';

import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // If sign up is successful
      if (data.user) {
        setSuccess(true);
        // Optional: If you don't require email confirmation in Supabase settings,
        // you could automatically log them in or navigate them.
        // For now, we assume email confirmation is typically required or at least good practice.
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen flex items-center justify-center p-0 md:p-4 lg:p-0">
      <div className="flex flex-col md:flex-row w-full h-full min-h-screen lg:min-h-[800px] max-w-[1440px] shadow-2xl overflow-hidden lg:rounded-xl">
        {/* Left Side */}
        <div className="relative hidden md:flex flex-1 flex-col justify-between p-12 bg-navy-deep overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-navy-deep/70 z-10"></div>
            <img alt="University Library" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop" />
          </div>
          <div className="relative z-20 flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg text-navy-deep">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <h2 className="text-white text-3xl font-black tracking-tight font-serif">Nkiza</h2>
          </div>
          <div className="relative z-20 max-w-md">
            <h1 className="text-white text-4xl font-black leading-tight font-serif mb-6">Join the Community</h1>
            <p className="text-white/90 text-lg leading-relaxed">Create an account to submit manuscripts, peer review groundbreaking research, and access our full library of academic content.</p>
          </div>
          <div className="relative z-20 flex gap-4 text-white/60 text-sm">
            <span>© 2024 Nkiza Journals</span>
            <span>Terms of Service</span>
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
              <h3 className="text-[#0d121b] text-2xl font-bold font-serif mb-2">Create Account</h3>
              <p className="text-[#4c669a] text-sm">Enter your details to register as an author or reader.</p>
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
                  <span className="material-symbols-outlined text-2xl">check</span>
                </div>
                <h4 className="text-lg font-bold text-green-900 mb-2">Registration Successful!</h4>
                <p className="text-green-800 text-sm mb-6">
                  We have sent a confirmation email to <strong>{email}</strong>. Please click the link in the email to verify your account and log in.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSignup}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#0d121b] text-sm font-semibold">Full Name</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">person</span>
                    <input
                      className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-[#cfd7e7] focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      placeholder="Dr. John Doe"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

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

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#0d121b] text-sm font-semibold">Password</label>
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
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Must be at least 6 characters.</p>
                </div>

                <button
                  className={`w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or register with</span>
                  </div>
                </div>

                <button
                  className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-lg flex items-center justify-center gap-3 transition-colors"
                  type="button"
                  onClick={() => navigate('/dashboard')}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/06/ORCID_iD.svg" alt="ORCID" className="w-6 h-6" />
                  <span>Sign up with ORCID</span>
                </button>
              </form>
            )}

            {!success && (
              <p className="mt-8 text-center text-sm text-[#4c669a]">
                Already have an account? <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">Log in</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;