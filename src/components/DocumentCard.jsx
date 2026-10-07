import React from 'react';
import { FileText, Presentation, FileCode, Eye, Users, Trash2, Calendar, BookOpen, Cpu, Code2 } from 'lucide-react';

export default function DocumentCard({ doc, onView, onDelete }) {
  const getTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return {
          icon: <FileText className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
          label: 'PDF Document'
        };
      case 'ppt':
      case 'pptx':
        return {
          icon: <Presentation className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
          label: 'PPT Presentation'
        };
      case 'docx':
      case 'doc':
        return {
          icon: <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
          label: 'DOCX Word Note'
        };
      case 'html':
      case 'htm':
        return {
          icon: <FileCode className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
          label: 'Interactive HTML'
        };
      default:
        return {
          icon: <FileText className="w-5 h-5 text-slate-400" />,
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400',
          label: type?.toUpperCase() || 'FILE'
        };
    }
  };

  const typeConfig = getTypeBadge(doc.fileType);

  const getGradeBadge = (grade) => {
    switch (grade) {
      case 'Class 10':
        return 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400';
      case 'Class 11':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400';
      case 'Class 12':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400';
    }
  };

  const isCS = doc.subject === 'Computer Science';

  return (
    <div className="group bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-sky-500/5 relative overflow-hidden">
      
      {/* Decorative Gradient Line on Hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div>
        {/* Top Card Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1 border ${
              isCS ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300' : 'bg-sky-500/15 border-sky-500/40 text-sky-700 dark:text-sky-300'
            }`}>
              {isCS ? <Code2 className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> : <Cpu className="w-3 h-3 text-sky-500 dark:text-sky-400" />}
              {isCS ? 'CS' : 'AI'}
            </span>

            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border ${getGradeBadge(doc.grade)}`}>
              {doc.grade}
            </span>

            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-slate-400" />
              {doc.chapterNumber || 'Chapter 1'}
            </span>
          </div>

          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${typeConfig.bg}`}>
            {doc.fileType}
          </span>
        </div>

        {/* Chapter Title & Document Title */}
        <div className="mb-2">
          <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 block mb-0.5">
            {doc.chapterTitle || 'General Material'}
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition line-clamp-2">
            {doc.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {doc.description || 'No additional description provided.'}
        </p>
      </div>

      {/* Card Footer */}
      <div>
        {/* Analytics stats row */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-semibold" title="Total Views">
              <Eye className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>{doc.totalViews || 0} views</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400" title="Unique Students">
              <Users className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>{doc.uniqueStudentsCount || 0} students</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-slate-400 dark:text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(doc)}
            className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-sky-500/10 flex items-center justify-center space-x-2 transition"
          >
            {typeConfig.icon}
            <span>Open & Read</span>
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(doc.id)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 text-slate-500 dark:text-slate-400 hover:text-rose-500 transition"
              title="Delete material"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
