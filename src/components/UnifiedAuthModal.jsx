import React, { useState } from 'react';
import { X, Lock, KeyRound, User, UserPlus, LogIn, ShieldCheck, CheckCircle2, AlertCircle, GraduationCap } from 'lucide-react';

export default function UnifiedAuthModal({ isOpen, onClose, onStudentAuthSuccess, onTeacherAuthSuccess }) {
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [studentMode, setStudentMode] = useState('register'); // 'register' | 'login'

  // Student Form State
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [grade, setGrade] = useState('10');
  const [section, setSection] = useState('A');

  // Teacher Form State
  const [teacherUsername, setTeacherUsername] = useState('CSGS');
  const [teacherPassword, setTeacherPassword] = useState('GS@123');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your Full Name.');
      return;
    }
    if (!rollNumber.trim()) {
      setError('Please enter your Roll Number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = studentMode === 'register' ? '/api/auth/student-register' : '/api/auth/student-login';
      const payload = studentMode === 'register' 
        ? { name: name.trim(), rollNumber: rollNumber.trim(), grade, section }
        : { name: name.trim(), rollNumber: rollNumber.trim() };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onStudentAuthSuccess(data.student);
      onClose();
    } catch (err) {
      setError(err.message || 'Student login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    if (!teacherUsername.trim() || !teacherPassword.trim()) {
      setError('Please enter Teacher Username and Password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/teacher-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: teacherUsername.trim(),
          password: teacherPassword.trim()
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid Teacher Credentials');
      }

      onTeacherAuthSuccess(data.token);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-colors">
        
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Portal Authentication
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select role to log in or register</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs (Student vs Teacher) */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl mb-6 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => { setRole('student'); setError(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              role === 'student'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student Access</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('teacher'); setError(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              role === 'teacher'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Teacher Login</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STUDENT AUTHENTICATION FORM */}
        {role === 'student' && (
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            
            {/* Student Sub Mode Switcher (Register vs Login) */}
            <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Student Status:</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => { setStudentMode('register'); setError(''); }}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    studentMode === 'register' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30' : 'text-slate-500'
                  }`}
                >
                  New Register
                </button>
                <button
                  type="button"
                  onClick={() => { setStudentMode('login'); setError(''); }}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    studentMode === 'login' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30' : 'text-slate-500'
                  }`}
                >
                  Existing Login
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm outline-none transition"
                required
              />
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Roll Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 101"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm outline-none transition"
                required
              />
            </div>

            {/* Class Grade & Section (Only in Register mode) */}
            {studentMode === 'register' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Class Grade
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 text-sm outline-none transition"
                    >
                      <option value="10">Class 10</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Section
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['A', 'B'].map((sec) => (
                        <button
                          type="button"
                          key={sec}
                          onClick={() => setSection(sec)}
                          className={`py-2 rounded-xl text-xs font-bold transition border ${
                            section === sec
                              ? 'bg-sky-500 text-white dark:text-slate-950 border-sky-400 font-extrabold shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          Section {sec}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-[11px] text-sky-700 dark:text-sky-300 flex items-center justify-between font-semibold">
                  <span>Selected Class Section:</span>
                  <span className="font-extrabold text-xs">{grade}{section}</span>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                {studentMode === 'register' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {loading ? 'Processing...' : studentMode === 'register' ? `Register & Access (${grade}${section})` : 'Student Login'}
              </button>
            </div>
          </form>
        )}

        {/* TEACHER AUTHENTICATION FORM (CSGS / GS@123) */}
        {role === 'teacher' && (
          <form onSubmit={handleTeacherSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Teacher Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Username (CSGS)"
                value={teacherUsername}
                onChange={(e) => setTeacherUsername(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm font-semibold outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Teacher Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Password (GS@123)"
                value={teacherPassword}
                onChange={(e) => setTeacherPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm outline-none transition"
                required
              />
            </div>

            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[11px] text-purple-700 dark:text-purple-300 space-y-0.5 font-medium">
              <div>Teacher Credentials:</div>
              <div>Username: <code className="font-extrabold font-mono">CSGS</code> | Password: <code className="font-extrabold font-mono">GS@123</code></div>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {loading ? 'Authenticating...' : 'Login as Teacher'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
