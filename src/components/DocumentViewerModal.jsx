import React, { useState, useEffect } from 'react';
import { X, Download, Maximize2, Minimize2, FileText, Presentation, FileCode, ExternalLink, Code, Eye, RefreshCw, CheckCircle } from 'lucide-react';
import mammoth from 'mammoth';

export default function DocumentViewerModal({ doc, isOpen, onClose, studentIdentity, onAccessLogged }) {
  const [docxHtml, setDocxHtml] = useState('');
  const [loadingDocx, setLoadingDocx] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');
  const [activeHtmlTab, setActiveHtmlTab] = useState('preview'); // 'preview' | 'code'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [accessRecorded, setAccessRecorded] = useState(false);

  useEffect(() => {
    if (doc && isOpen) {
      // Record Access Logging
      recordAccess();

      // Handle file format specific loading
      if (doc.fileType === 'docx' || doc.fileType === 'doc') {
        loadDocxContent();
      } else if (doc.fileType === 'html' || doc.fileType === 'htm') {
        loadHtmlSource();
      }
    }
  }, [doc, isOpen]);

  const recordAccess = async () => {
    if (!doc || !studentIdentity) return;
    try {
      await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: doc.id,
          studentName: studentIdentity.name || 'Anonymous Student',
          rollNumber: studentIdentity.rollNo || 'N/A',
          studentClass: studentIdentity.studentClass || doc.grade
        })
      });
      setAccessRecorded(true);
      if (onAccessLogged) onAccessLogged();
    } catch (err) {
      console.error('Failed to log student access:', err);
    }
  };

  const loadDocxContent = async () => {
    setLoadingDocx(true);
    setDocxHtml('');
    try {
      const response = await fetch(`/api/documents/${doc.id}/file`);
      const buffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
      setDocxHtml(result.value || '<p className="text-slate-400">Document is empty or contains non-text elements.</p>');
    } catch (err) {
      console.error('Error rendering DOCX:', err);
      setDocxHtml(`
        <div class="p-6 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
          <h3 class="text-lg font-bold text-sky-400 mb-2">${doc.title}</h3>
          <p class="text-sm text-slate-400 mb-4">${doc.description || ''}</p>
          <p class="text-xs text-amber-400">Note: Dynamic docx text preview unavailable. Click Download below to open natively in Microsoft Word.</p>
        </div>
      `);
    } finally {
      setLoadingDocx(false);
    }
  };

  const loadHtmlSource = async () => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/file`);
      const text = await response.text();
      setHtmlCode(text);
    } catch (err) {
      console.error('Error fetching HTML code:', err);
    }
  };

  if (!isOpen || !doc) return null;

  const fileUrl = `/api/documents/${doc.id}/file`;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md transition-all ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`bg-slate-900 border border-slate-800 rounded-2xl w-full flex flex-col shadow-2xl overflow-hidden transition-all ${isFullscreen ? 'h-full rounded-none border-none' : 'max-w-6xl h-[90vh]'}`}>
        
        {/* Modal Top Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3 overflow-hidden">
            <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase bg-sky-500/10 border border-sky-500/30 text-sky-400 whitespace-nowrap">
              {doc.grade}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 whitespace-nowrap">
              {doc.chapterNumber || 'Chapter'}
            </span>

            <div className="overflow-hidden">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate" title={doc.title}>
                {doc.title}
              </h2>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span>{doc.chapterTitle}</span>
                {accessRecorded && (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                    <CheckCircle className="w-3 h-3" /> Access Tracked
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* HTML Tab Switcher */}
            {(doc.fileType === 'html' || doc.fileType === 'htm') && (
              <div className="flex items-center bg-slate-900 p-1 border border-slate-800 rounded-xl mr-2">
                <button
                  onClick={() => setActiveHtmlTab('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${activeHtmlTab === 'preview' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'}`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  onClick={() => setActiveHtmlTab('code')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${activeHtmlTab === 'code' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'}`}
                >
                  <Code className="w-3.5 h-3.5" /> Source Code
                </button>
              </div>
            )}

            {/* Direct Download Button */}
            <a
              href={fileUrl}
              download={doc.originalName}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-slate-700"
              title="Download file to computer"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition border border-slate-700"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Modal Main Content Container */}
        <div className="flex-1 bg-slate-950 overflow-auto relative p-2 sm:p-4">

          {/* PDF Renderer */}
          {doc.fileType === 'pdf' && (
            <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=1`}
                className="w-full h-full border-none"
                title={doc.title}
              />
            </div>
          )}

          {/* DOCX Renderer */}
          {(doc.fileType === 'docx' || doc.fileType === 'doc') && (
            <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl min-h-[500px]">
              {loadingDocx ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                  <p className="text-sm font-semibold text-slate-400">Rendering Word document formatted preview...</p>
                </div>
              ) : (
                <article
                  className="prose prose-invert max-w-none text-slate-200 space-y-4"
                  dangerouslySetInnerHTML={{ __html: docxHtml }}
                />
              )}
            </div>
          )}

          {/* PPT / PPTX Renderer */}
          {(doc.fileType === 'ppt' || doc.fileType === 'pptx') && (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-6 p-6">
              <div className="w-full max-w-4xl h-full min-h-[500px] rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                <iframe
                  src={fileUrl}
                  className="w-full h-full border-none"
                  title={doc.title}
                />
              </div>
            </div>
          )}

          {/* HTML Renderer */}
          {(doc.fileType === 'html' || doc.fileType === 'htm') && (
            <div className="w-full h-full min-h-[500px]">
              {activeHtmlTab === 'preview' ? (
                <iframe
                  src={fileUrl}
                  sandbox="allow-scripts allow-same-origin allow-modals"
                  className="w-full h-full rounded-xl border border-slate-800 bg-white"
                  title={doc.title}
                />
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full overflow-auto font-mono text-xs text-sky-300">
                  <pre>{htmlCode}</pre>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Info */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Viewing as <span className="text-sky-300 font-bold">{studentIdentity?.name || 'Student'}</span> ({studentIdentity?.rollNo || 'No Roll'})
          </div>
          <div>Original File: {doc.originalName} ({Math.round(doc.fileSize / 1024)} KB)</div>
        </div>

      </div>
    </div>
  );
}
