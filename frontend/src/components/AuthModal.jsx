import React, { useState } from 'react';
import { X, GraduationCap, ShieldCheck, Mail, Lock, User, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [semester, setSemester] = useState(5);
  const [department, setDepartment] = useState('Computer Application (BCA)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({
          email: email.trim().toLowerCase(),
          password,
          name,
          roll_number: rollNumber,
          semester: parseInt(semester),
          department,
          section: 'A'
        });
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await api.login(email.trim().toLowerCase(), password);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const loginAsRole = async (demoEmail, demoPass = '123456') => {
    setError('');
    setLoading(true);
    try {
      const res = await api.login(demoEmail, demoPass);
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(`Failed to sign in: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 items-center justify-center mb-3">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            {isRegister ? 'Student College Registration' : 'Sign In to Portal'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            AI Doubt Solving Platform • SRMCM Lucknow
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Access Bar */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-900/90 border border-indigo-500/30">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">
            ⚡ Quick 1-Click Credentials
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => loginAsRole('student@gmail.com', '123456')}
              disabled={loading}
              className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 text-left text-xs font-semibold transition-colors cursor-pointer"
            >
              <div className="text-[10px] font-bold text-white flex items-center gap-1">
                <User className="h-3 w-3 text-indigo-400" />
                <span>Student</span>
              </div>
              <div className="text-[9px] text-indigo-300 font-mono truncate">student@...</div>
              <div className="text-[8px] text-slate-400 font-mono">123456</div>
            </button>
            <button
              type="button"
              onClick={() => loginAsRole('faculty@gmail.com', '123456')}
              disabled={loading}
              className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 text-left text-xs font-semibold transition-colors cursor-pointer"
            >
              <div className="text-[10px] font-bold text-white flex items-center gap-1">
                <GraduationCap className="h-3 w-3 text-emerald-400" />
                <span>Faculty</span>
              </div>
              <div className="text-[9px] text-emerald-300 font-mono truncate">faculty@...</div>
              <div className="text-[8px] text-slate-400 font-mono">123456</div>
            </button>
            <button
              type="button"
              onClick={() => loginAsRole('admin@gmail.com', '123456')}
              disabled={loading}
              className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-left text-xs font-semibold transition-colors cursor-pointer"
            >
              <div className="text-[10px] font-bold text-white flex items-center gap-1">
                <Shield className="h-3 w-3 text-purple-400" />
                <span>Admin</span>
              </div>
              <div className="text-[9px] text-purple-300 font-mono truncate">admin@...</div>
              <div className="text-[8px] text-slate-400 font-mono">123456</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prabhat"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    placeholder="SRMCM/BCA/2023/..."
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="student@gmail.com or admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-4"
          >
            {loading ? (
              <span className="animate-spin text-base">⟳</span>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>{isRegister ? 'Complete Registration' : 'Sign In Securely'}</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {isRegister ? (
            <p>
              Already registered?{' '}
              <button 
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className="text-indigo-400 font-bold hover:underline"
              >
                Sign In here
              </button>
            </p>
          ) : (
            <p>
              New student?{' '}
              <button 
                type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                className="text-indigo-400 font-bold hover:underline"
              >
                Create Account
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
