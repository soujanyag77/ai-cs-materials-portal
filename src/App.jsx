import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DocumentCard from './components/DocumentCard';
import DocumentViewerModal from './components/DocumentViewerModal';
import UploadModal from './components/UploadModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import UnifiedAuthModal from './components/UnifiedAuthModal';
import { BookOpen, Sparkles, Plus, Search, Filter, RefreshCw, Lock, ShieldCheck, UserCheck, UserPlus } from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedFileType, setSelectedFileType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('library');

  // Dark / Light Theme state
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }, [theme]);

  // Teacher Authentication state
  const [isTeacher, setIsTeacher] = useState(() => {
    return !!sessionStorage.getItem('teacher_token');
  });

  // Student Identity stored in localStorage
  const [studentIdentity, setStudentIdentity] = useState(() => {
    try {
      const saved = localStorage.getItem('student_identity');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeViewerDoc, setActiveViewerDoc] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [selectedGrade, selectedSubject, selectedFileType, searchQuery]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGrade !== 'All') params.append('grade', selectedGrade);
      if (selectedSubject !== 'All') params.append('subject', selectedSubject);
      if (selectedFileType !== 'All') params.append('fileType', selectedFileType);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAuthSuccess = (student) => {
    setStudentIdentity(student);
    try {
      localStorage.setItem('student_identity', JSON.stringify(student));
    } catch (e) {}
    setIsAuthOpen(false);
  };

  const handleTeacherAuthSuccess = (token) => {
    sessionStorage.setItem('teacher_token', token);
    setIsTeacher(true);
    setIsAuthOpen(false);
    setIsUploadOpen(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('teacher_token');
    localStorage.removeItem('student_identity');
    setIsTeacher(false);
    setStudentIdentity(null);
  };

  const handleOpenUpload = () => {
    if (!isTeacher) {
      setIsAuthOpen(true);
      return;
    }
    setIsUploadOpen(true);
  };

  const handleOpenDocument = (doc) => {
    if (!studentIdentity && !isTeacher) {
      setIsAuthOpen(true);
      return;
    }
    setActiveViewerDoc(doc);
  };

  const handleDeleteDocument = async (docId) => {
    if (!isTeacher) {
      alert('Only teachers can delete study materials.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this study material?')) return;
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleUploadSuccess = (newDoc) => {
    fetchDocuments();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar Header */}
      <Header
        selectedGrade={selectedGrade}
        setSelectedGrade={setSelectedGrade}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={handleOpenUpload}
        onOpenAuth={() => setIsAuthOpen(true)}
        isTeacher={isTeacher}
        studentIdentity={studentIdentity}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFileType={selectedFileType}
        setSelectedFileType={setSelectedFileType}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Student Library View */}
        {activeTab === 'library' && (
          <div className="space-y-8">
            
            {/* Hero Welcome Banner */}
            <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 dark:from-sky-900/40 dark:via-indigo-950/60 dark:to-purple-950/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
              <div className="max-w-2xl relative z-10">
                <div className="inline-flex items-center space-x-2 bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CBSE AI & CS Curriculum 2026</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                  Class 10, 11 & 12 AI & CS Study Portal
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Students register with Full Name, Roll Number & Section (A or B) to read materials. Teachers log in with <code className="font-extrabold font-mono bg-sky-500/20 px-1.5 py-0.5 rounded text-sky-600 dark:text-sky-300">CSGS</code> and <code className="font-extrabold font-mono bg-sky-500/20 px-1.5 py-0.5 rounded text-sky-600 dark:text-sky-300">GS@123</code> to upload chapters.
                </p>
              </div>
            </div>

            {/* Document Grid Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                  {selectedSubject === 'All' ? 'All Subjects' : selectedSubject}
                  {selectedGrade !== 'All' ? ` (${selectedGrade})` : ''}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {documents.length} chapter {documents.length === 1 ? 'file' : 'files'}
                </p>
              </div>

              <button
                onClick={handleOpenUpload}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Material {isTeacher ? '(Teacher Mode)' : '(Login)'}</span>
              </button>
            </div>

            {/* Document Card Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading study materials...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200">No materials uploaded yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Teachers log in with CSGS / GS@123 to upload Class 10, 11, and 12 PDF, PPT, DOCX, or HTML chapters.
                </p>
                <button
                  onClick={handleOpenUpload}
                  className="bg-sky-500 hover:bg-sky-400 text-white dark:text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg transition"
                >
                  Upload First Chapter File
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    onView={handleOpenDocument}
                    onDelete={isTeacher ? handleDeleteDocument : null}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* Teacher Access Analytics View */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-500 transition-colors">
        <p>AI & CS Study Portal for Class 10, 11 & 12 | Built with Multi-Type Viewer & Student Access Analytics</p>
      </footer>

      {/* Unified Auth Modal (Student Register/Login & Teacher Login) */}
      <UnifiedAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onStudentAuthSuccess={handleStudentAuthSuccess}
        onTeacherAuthSuccess={handleTeacherAuthSuccess}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <DocumentViewerModal
        doc={activeViewerDoc}
        isOpen={!!activeViewerDoc}
        onClose={() => setActiveViewerDoc(null)}
        studentIdentity={studentIdentity || { name: 'Teacher CSGS', rollNo: 'Staff', studentClass: 'Staff' }}
        onAccessLogged={fetchDocuments}
      />

    </div>
  );
}
