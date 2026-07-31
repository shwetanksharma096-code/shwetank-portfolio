import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple hash function to avoid storing plain text password
const ADMIN_SESSION_KEY = 'shwetank_admin_auth';
const CORRECT_PASSWORD = 'shwetank@2024'; // Change this to whatever password you want

interface AdminLoginGateProps {
  children: React.ReactNode;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({ children }) => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check session on mount
  useEffect(() => {
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (session === 'true') {
      setAuthed(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Small delay for UX feel
    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        setAuthed(true);
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
      setLoading(false);
    }, 600);
  };


  if (authed) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4 font-sans">
      {/* Background yellow glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FFE600]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo / Monogram */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-full bg-[#FFE600] text-black font-extrabold text-xl flex items-center justify-center shadow-lg">
              SS
            </div>
            <div className="text-center">
              <h1 className="text-white font-extrabold text-lg uppercase tracking-tight">
                Admin Panel
              </h1>
              <p className="text-white/40 text-xs font-mono uppercase tracking-widest mt-0.5">
                Shwetank Sharma Portfolio
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-white/60 text-xs font-mono font-bold uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  className="w-full bg-[#111111] border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-[#FFE600]/60 focus:ring-1 focus:ring-[#FFE600]/30 transition-all pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors text-xs"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs font-mono font-bold"
                >
                  ⚠ {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 rounded-xl bg-[#FFE600] text-black font-extrabold text-sm uppercase tracking-widest hover:bg-yellow-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg mt-2"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <span>🔐</span>
                  <span>Access Admin Panel</span>
                </>
              )}
            </button>
          </form>

          {/* Hint */}
          <p className="text-center text-white/20 text-[10px] font-mono mt-6 uppercase tracking-widest">
            Authorized access only
          </p>
        </div>
      </motion.div>
    </div>
  );
};
