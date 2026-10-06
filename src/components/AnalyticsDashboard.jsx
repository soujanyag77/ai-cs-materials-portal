import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Eye, BookOpen, Clock, Search, Filter, ShieldCheck, RefreshCw, ChevronDown, ChevronUp, UserCheck, Sparkles, PieChart, Layers } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('topics'); // 'topics' | 'users' | 'classes' | 'logs'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('All');
  const [expandedUserKey, setExpandedUserKey] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading topic-wise & user-wise analytics...</p>
      </div>
    );
  }

  if (!analytics) return null;

  // Max views for topic progress bar
  const maxTopicViews = (analytics.topicStats || []).length > 0 ? (analytics.topicStats[0].accessCount || 1) : 1;

  // Filter User-wise stats
  const filteredUsers = (analytics.userWiseStats || []).filter(u => {
    const matchesGrade = selectedGradeFilter === 'All' || u.studentClass === selectedGradeFilter;
    const matchesQuery = !searchQuery ||
      u.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesQuery;
  });

  // Filter Topic stats
  const filteredTopics = (analytics.topicStats || []).filter(t => {
    const matchesGrade = selectedGradeFilter === 'All' || t.grade === selectedGradeFilter;
    const matchesQuery = !searchQuery ||
      t.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesQuery;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> Teacher Analytics Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Topic-Wise & User-Wise Access Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Detailed breakdown of what topics were accessed how many times, total student visits, class-wise comparisons, and per-user learning history.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="bg-slate-800 hover:bg-slate-700 text-sky-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border border-slate-700 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Registered Users */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-100">{analytics.totalStudentsCount || 0}</div>
            <div className="text-xs font-semibold text-slate-400">Total Logged-in Users</div>
          </div>
        </div>

        {/* Total Visits / Open Count */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-100">{analytics.totalAccesses || 0}</div>
            <div className="text-xs font-semibold text-slate-400">Total Material Visits</div>
          </div>
        </div>

        {/* Total Topics / Chapters */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-100">{analytics.topicStats?.length || 0}</div>
            <div className="text-xs font-semibold text-slate-400">Active Topics / Units</div>
          </div>
        </div>

        {/* Subject Views Ratio */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-300 space-y-0.5">
              <div>AI Views: <span className="text-sky-400 font-extrabold">{analytics.subjectStats?.['Artificial Intelligence']?.views || 0}</span></div>
              <div>CS Views: <span className="text-purple-400 font-extrabold">{analytics.subjectStats?.['Computer Science']?.views || 0}</span></div>
            </div>
          </div>
        </div>

      </div>

      {/* Analytics Sub-Navbar & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
        
        {/* Analytics Mode Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'topics' ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Topic-Wise Analysis
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'users' ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> User-Wise Visits
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'classes' ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Class-Wise Comparison
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'logs' ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" /> Live Access Trail
          </button>
        </div>

        {/* Grade Filter & Search */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1">
            {['All', 'Class 10', 'Class 11', 'Class 12'].map(g => (
              <button
                key={g}
                onClick={() => setSelectedGradeFilter(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedGradeFilter === g ? 'bg-sky-500 text-slate-950 font-extrabold' : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none"
            />
          </div>
        </div>

      </div>

      {/* 1. TOPIC-WISE ANALYSIS VIEW */}
      {activeTab === 'topics' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-400" />
              What Topics Were Accessed How Many Times
            </h2>
            <p className="text-xs text-slate-400">Total times each topic/chapter was opened by students across Class 10, 11, and 12.</p>
          </div>

          <div className="space-y-4">
            {filteredTopics.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-xs">No topics match search criteria.</p>
            ) : (
              filteredTopics.map((topic, idx) => {
                const pct = Math.round((topic.accessCount / maxTopicViews) * 100);
                return (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          {topic.grade}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                          {topic.subject}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100">{topic.chapterNumber}: {topic.chapterTitle}</h3>
                      </div>

                      <div className="flex items-center space-x-4 text-xs">
                        <div className="text-right">
                          <span className="text-base font-black text-sky-400">{topic.accessCount}</span>
                          <span className="text-[11px] text-slate-400 font-semibold ml-1">views</span>
                        </div>
                        <div className="text-right text-indigo-300 text-[11px]">
                          <span className="font-bold">{topic.uniqueStudentsCount}</span> students
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar Visualizer */}
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. USER-WISE VISITS ANALYSIS VIEW */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Per-User Visits & Topic History
            </h2>
            <p className="text-xs text-slate-400">Click any user to reveal exact topics read and how many times they visited each topic.</p>
          </div>

          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-xs">No student users found.</p>
            ) : (
              filteredUsers.map((user, idx) => {
                const userKey = `${user.studentName}_${user.rollNumber}_${user.studentClass}`;
                const isExpanded = expandedUserKey === userKey;

                return (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition">
                    <div
                      onClick={() => setExpandedUserKey(isExpanded ? null : userKey)}
                      className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/50 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                          {user.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-slate-100">{user.studentName}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                              {user.studentClass}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">Roll No: <span className="text-slate-200">{user.rollNumber}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-base font-black text-sky-400">{user.totalVisits} visits</div>
                          <div className="text-[10px] text-slate-500">Last active: {new Date(user.lastActive).toLocaleDateString()}</div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </div>

                    {/* Expanded User Topic Breakdown */}
                    {isExpanded && (
                      <div className="px-6 py-4 bg-slate-900 border-t border-slate-800/80 animate-fadeIn">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-sky-400" />
                          Topics Accessed By {user.studentName}:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {user.topicsList.map((t, tIdx) => (
                            <div key={tIdx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-200 truncate pr-2">{t.topicName}</span>
                              <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 font-extrabold border border-sky-500/30 shrink-0">
                                {t.count} {t.count === 1 ? 'open' : 'opens'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. CLASS-WISE COMPARISON VIEW */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(analytics.classWiseStats || []).map((cls, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-xl font-extrabold text-sm bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    {cls.className}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{cls.documentsCount} files</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                    <div className="text-2xl font-black text-sky-400">{cls.totalViews}</div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Visits</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                    <div className="text-2xl font-black text-indigo-400">{cls.uniqueStudentsCount}</div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Active Users</div>
                  </div>
                </div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Most Popular Topics in {cls.className}:</h4>
                <div className="space-y-2">
                  {cls.topTopics.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No views recorded yet.</p>
                  ) : (
                    cls.topTopics.slice(0, 4).map((top, tIdx) => (
                      <div key={tIdx} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 truncate pr-2">{top.name}</span>
                        <span className="font-bold text-sky-400 shrink-0">{top.count} views</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. LIVE AUDIT TRAIL LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Live Student Access Logs
              </h2>
              <p className="text-xs text-slate-400">Timestamped audit trail of every student view action.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3 rounded-l-xl">Student Name</th>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Document Title</th>
                  <th className="p-3">Chapter</th>
                  <th className="p-3 rounded-r-xl">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(analytics.recentLogs || []).map(log => (
                  <tr key={log.id} className="hover:bg-slate-950/60 transition">
                    <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {log.studentName}
                    </td>
                    <td className="p-3 text-slate-300 font-mono">{log.rollNumber}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-semibold">
                        {log.studentClass}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-200 max-w-xs truncate">{log.documentTitle}</td>
                    <td className="p-3 text-indigo-300 font-medium">{log.chapterNumber}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
