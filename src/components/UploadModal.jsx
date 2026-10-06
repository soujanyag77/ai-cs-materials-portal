import React, { useState } from 'react';
import { X, Upload, FileText, Presentation, FileCode, CheckCircle2, AlertCircle, Sparkles, BookOpen, Code2, Cpu } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Artificial Intelligence');
  const [grade, setGrade] = useState('Class 10');
  const [chapterNumber, setChapterNumber] = useState('Chapter 1');
  const [chapterTitle, setChapterTitle] = useState('');
  const [isCustomChapter, setIsCustomChapter] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Preset Chapters based on CBSE AI & CS Curriculums
  const classChapters = {
    'Artificial Intelligence': {
      'Class 10': [
        { num: 'Chapter 1', title: 'Introduction to AI & Project Cycle' },
        { num: 'Chapter 2', title: 'Advance Python Programming' },
        { num: 'Chapter 3', title: 'Data Sciences & Data Visualisation' },
        { num: 'Chapter 4', title: 'Computer Vision & Image Processing' },
        { num: 'Chapter 5', title: 'Natural Language Processing (NLP)' },
        { num: 'Chapter 6', title: 'Evaluation & Model Metrics' },
      ],
      'Class 11': [
        { num: 'Chapter 1', title: 'Introduction to Artificial Intelligence' },
        { num: 'Chapter 2', title: 'Python Programming for ML' },
        { num: 'Chapter 3', title: 'Data Literacy & Data Analysis' },
        { num: 'Chapter 4', title: 'Machine Learning Concepts & Algorithms' },
        { num: 'Chapter 5', title: 'AI Ethics, Bias & Sustainable Development' },
      ],
      'Class 12': [
        { num: 'Chapter 1', title: 'Computer Vision Applications & OpenCV' },
        { num: 'Chapter 2', title: 'Natural Language Processing & NLTK' },
        { num: 'Chapter 3', title: 'Artificial Neural Networks & Deep Learning' },
        { num: 'Chapter 4', title: 'AI Capstone Projects & Interactive Labs' },
        { num: 'Chapter 5', title: 'Deploying AI Models' },
      ]
    },
    'Computer Science': {
      'Class 11': [
        { num: 'Chapter 1', title: 'Computer System Organisation & Logic Gates' },
        { num: 'Chapter 2', title: 'Computational Thinking & Python Functions' },
        { num: 'Chapter 3', title: 'Data Handling (Lists, Tuples & Dictionaries)' },
        { num: 'Chapter 4', title: 'Society, Law and Ethics & Cyber Safety' },
      ],
      'Class 12': [
        { num: 'Chapter 1', title: 'Data Structures - Stack Implementation in Python' },
        { num: 'Chapter 2', title: 'Computer Networks & Internet Protocols' },
        { num: 'Chapter 3', title: 'Database Management & Relational SQL Queries' },
        { num: 'Chapter 4', title: 'Interface Python with MySQL Database' },
      ]
    }
  };

  if (!isOpen) return null;

  const handleSubjectChange = (newSubject) => {
    setSubject(newSubject);
    let defaultGrade = grade;
    if (newSubject === 'Computer Science' && grade === 'Class 10') {
      defaultGrade = 'Class 11';
      setGrade('Class 11');
    }
    updatePresetChapters(newSubject, defaultGrade);
  };

  const handleGradeChange = (newGrade) => {
    setGrade(newGrade);
    updatePresetChapters(subject, newGrade);
  };

  const updatePresetChapters = (subj, gr) => {
    const list = classChapters[subj]?.[gr] || [];
    if (list.length > 0) {
      setChapterNumber(list[0].num);
      setChapterTitle(list[0].title);
      setIsCustomChapter(false);
    }
  };

  const handleChapterSelect = (e) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setIsCustomChapter(true);
      setChapterNumber('Chapter 1');
      setChapterTitle('');
    } else {
      setIsCustomChapter(false);
      const list = classChapters[subject]?.[grade] || [];
      const found = list.find(c => c.num === val);
      if (found) {
        setChapterNumber(found.num);
        setChapterTitle(found.title);
      }
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      validateAndSetFile(selected);
    }
  };

  const validateAndSetFile = (selected) => {
    const ext = selected.name.split('.').pop().toLowerCase();
    const allowed = ['pdf', 'ppt', 'pptx', 'docx', 'doc', 'html', 'htm'];
    if (!allowed.includes(ext)) {
      setError('Invalid file extension. Please select a PDF, PPT, DOCX, or HTML file.');
      return;
    }
    setError('');
    setFile(selected);

    if (!title) {
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      setTitle(nameWithoutExt);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title for the study material.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('subject', subject);
    formData.append('grade', grade);
    formData.append('chapterNumber', chapterNumber);
    formData.append('chapterTitle', chapterTitle || 'General Topic');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setFile(null);
      setTitle('');
      setDescription('');
      onUploadSuccess(data.document);
      onClose();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Server error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  const activeChapterList = classChapters[subject]?.[grade] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Upload AI / CS Study Material</h2>
              <p className="text-xs text-slate-400">Class 10, 11, 12 Chapter-wise PDF, PPT, DOCX, HTML</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
          
          {/* Subject Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Subject
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSubjectChange('Artificial Intelligence')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 border ${
                  subject === 'Artificial Intelligence'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-sky-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>Artificial Intelligence</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubjectChange('Computer Science')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 border ${
                  subject === 'Computer Science'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-sky-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Computer Science</span>
              </button>
            </div>
          </div>

          {/* Grade Level Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Grade / Class
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Class 10', 'Class 11', 'Class 12'].map((g) => {
                const disabled = subject === 'Computer Science' && g === 'Class 10';
                return (
                  <button
                    type="button"
                    key={g}
                    disabled={disabled}
                    onClick={() => handleGradeChange(g)}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      grade === g
                        ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {g} {disabled ? '(N/A)' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* File Upload Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer ${
              file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 hover:border-sky-500/50 bg-slate-950/50'
            }`}
          >
            <input
              type="file"
              id="fileInput"
              accept=".pdf,.ppt,.pptx,.docx,.doc,.html,.htm"
              onChange={(e) => e.target.files[0] && validateAndSetFile(e.target.files[0])}
              className="hidden"
            />
            <label htmlFor="fileInput" className="cursor-pointer block">
              {file ? (
                <div className="flex items-center justify-center space-x-3 text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                  <div className="text-left">
                    <p className="font-bold text-sm text-slate-100">{file.name}</p>
                    <p className="text-xs text-slate-400">{Math.round(file.size / 1024)} KB - Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-center space-x-3 text-slate-400">
                    <FileText className="w-5 h-5 text-rose-400" />
                    <Presentation className="w-5 h-5 text-amber-400" />
                    <FileText className="w-5 h-5 text-blue-400" />
                    <FileCode className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    Drag & drop file here or <span className="text-sky-400 underline">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Supports PDF, PPT/PPTX, DOCX, and HTML files (Max 50MB)</p>
                </div>
              )}
            </label>
          </div>

          {/* Chapter Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select Chapter / Unit
            </label>
            <select
              onChange={handleChapterSelect}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-slate-100 text-xs outline-none"
            >
              {activeChapterList.map((ch) => (
                <option key={ch.num} value={ch.num}>
                  {ch.num}: {ch.title}
                </option>
              ))}
              <option value="CUSTOM">+ Custom Chapter Entry</option>
            </select>
          </div>

          {/* Custom Chapter Entry if selected */}
          {isCustomChapter && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase">Chapter No.</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 6"
                  value={chapterNumber}
                  onChange={(e) => setChapterNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase">Chapter Title</label>
                <input
                  type="text"
                  placeholder="e.g. Boolean Algebra & Logic Gates"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                />
              </div>
            </div>
          )}

          {/* Document Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Material Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Data Structures Stack Implementation & Lab Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm placeholder-slate-500 outline-none transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description / Learning Objectives
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of key concepts covered..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2 text-slate-100 text-xs placeholder-slate-500 outline-none transition resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading Material...' : 'Publish Material'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
