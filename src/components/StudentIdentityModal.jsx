import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, CheckCircle2, X, Hash, GraduationCap } from 'lucide-react';

export default function StudentIdentityModal({ isOpen, onClose, onSave, currentIdentity }) {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [grade, setGrade] = useState('10');
  const [section, setSection] = useState('A');
  const [error, setError] = useState('');

  const sectionsList = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    if (currentIdentity) {
      setName(currentIdentity.name || '');
      setRollNo(currentIdentity.rollNo || '');
      if (currentIdentity.studentClass) {
        // parse e.g. "10A" or "Class 10"
        const match = currentIdentity.studentClass.match(/(\d+)\s*([A-Z]*)/i);
        if (match) {
          setGrade(match[1] || '10');
          setSection(match[2] || 'A');
        }
      }
    }
  }, [currentIdentity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full student name.');
      return;
    }

    const fullClassSection = `${grade}${section}`; // e.g., "10A", "10B", "11A", "12B"
    const identityData = {
      name: name.trim(),
      rollNo: rollNo.trim() || 'N/A',
      grade: `Class ${grade}`,
      section: section,
      studentClass: fullClassSection // e.g. "10A", "10B", "11A", "12B"
    };

    onSave(identityData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500"></div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Student Login
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h2>
              <p className="text-xs text-slate-400">Enter student name, roll number, and section to access materials</p>
            </div>
          </div>
          {currentIdentity && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Student Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Student Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm placeholder-slate-500 outline-none transition"
              required
            />
          </div>

          {/* Roll Number & Class Section */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Roll Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Roll Number
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. 101"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 text-sm placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            {/* Class Grade (10, 11, 12) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Class Grade
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-slate-100 text-sm outline-none transition"
              >
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>

          </div>

          {/* Class Section Selection (10A, 10B, 11A, 11B, 12A, 12B) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select Class Section
            </label>
            <div className="grid grid-cols-4 gap-2">
              {sectionsList.map((sec) => {
                const combined = `${grade}${sec}`; // e.g. "10A", "10B", "11A", "12B"
                const isSelected = section === sec;
                return (
                  <button
                    type="button"
                    key={sec}
                    onClick={() => setSection(sec)}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-extrabold shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Section {combined}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800/80">
            {currentIdentity && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Login as Student ({grade}{section})
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
