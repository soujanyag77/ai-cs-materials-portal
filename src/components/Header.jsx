import React from 'react';
import { Sparkles, Upload, BarChart3, BookOpen, UserCheck, Search, Filter, Code2, Cpu, Lock, LogOut, ShieldCheck } from 'lucide-react';

export default function Header({
  selectedGrade,
  setSelectedGrade,
  selectedSubject,
  setSelectedSubject,
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenIdentity,
  onOpenTeacherLogin,
  isTeacher,
  onLogoutTeacher,
  studentIdentity,
  searchQuery,
  setSearchQuery,
  selectedFileType,
  setSelectedFileType
}) {
  const grades = ['All', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = [
    { id: 'All', label: 'All Subjects', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'Artificial Intelligence', label: 'AI (Class 10, 11, 12)', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'Computer Science', label: 'CS (Class 11 & 12)', icon: <Code2 className="w-3.5 h-3.5" /> }
  ];
  const fileTypes = ['All', 'PDF', 'PPT', 'DOCX', 'HTML'];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Portal Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('library')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent tracking-tight">
                  AI & CS ACADEMY
                </span>
                <span className="bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Class 10 • 11 • 12
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Class 10, 11, 12 Multi-Format Portal & Analytics</p>
            </div>
          </div>

          {/* Navigation View Switcher (Library vs Analytics) */}
          <div className="hidden md:flex items-center bg-slate-900/90 p-1 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'library'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Student Library</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Usage Analytics</span>
            </button>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Teacher Role & Upload Control */}
            {isTeacher ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenUpload}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-purple-500/20"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Material</span>
                </button>

                <button
                  onClick={onLogoutTeacher}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition"
                  title="Exit Teacher Mode"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenTeacherLogin}
                className="flex items-center space-x-2 bg-slate-900 border border-purple-500/40 hover:border-purple-500 text-purple-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition"
              >
                <Lock className="w-4 h-4 text-purple-400" />
                <span>Teacher Login</span>
              </button>
            )}

            {/* Student Profile Identity Chip */}
            <button
              onClick={onOpenIdentity}
              className="flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl text-xs transition"
              title="Click to change student details"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-[11px] font-bold text-slate-200 leading-tight">
                  {studentIdentity?.name || 'Set Student'}
                </div>
                <div className="text-[9px] text-slate-400">
                  {studentIdentity?.studentClass || 'Student'} ({studentIdentity?.rollNo || 'No Roll'})
                </div>
              </div>
            </button>

          </div>
        </div>

        {/* Bottom Sub-Navbar (Subject Tabs, Grade Tabs & Filters) */}
        {activeTab === 'library' && (
          <div className="py-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
            
            {/* Subject & Grade Level Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Subject Tabs */}
              <div className="flex items-center space-x-1 bg-slate-900 p-1 border border-slate-800 rounded-xl mr-2">
                {subjects.map(subj => (
                  <button
                    key={subj.id}
                    onClick={() => setSelectedSubject(subj.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      selectedSubject === subj.id
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {subj.icon}
                    <span>{subj.label}</span>
                  </button>
                ))}
              </div>

              {/* Grade Tabs */}
              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
                {grades.map(grade => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      selectedGrade === grade
                        ? 'bg-sky-500 text-slate-950 font-extrabold shadow-md shadow-sky-500/20'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>

            </div>

            {/* File Type Filter & Search Bar */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              
              {/* File Type Filter */}
              <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
                <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
                <select
                  value={selectedFileType}
                  onChange={(e) => setSelectedFileType(e.target.value)}
                  className="bg-transparent text-xs text-slate-300 font-semibold outline-none py-1 px-1 cursor-pointer"
                >
                  {fileTypes.map(ft => (
                    <option key={ft} value={ft} className="bg-slate-900 text-slate-200">
                      Format: {ft}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search AI/CS chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition"
                />
              </div>

            </div>

          </div>
        )}
      </div>
    </header>
  );
}
