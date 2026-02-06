import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Manuscript } from '../../types';
import { useNavigate } from 'react-router-dom';

const EditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManuscripts();
  }, []);

  const fetchManuscripts = async () => {
    try {
      setLoading(true);
      // Fetch all manuscripts with submitter profile info
      const { data, error } = await supabase
        .from('manuscripts')
        .select(`
          *,
          submitter:profiles(full_name)
        `)
        .order('submission_date', { ascending: false });

      if (error) throw error;
      setManuscripts(data || []);
    } catch (error) {
      console.error('Error fetching manuscripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-100 text-emerald-700';
      case 'accepted': return 'bg-blue-100 text-blue-700';
      case 'under_review': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="h-full bg-slate-50 overflow-y-auto">
      <main className="max-w-[1280px] mx-auto w-full px-6 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Submissions</h1>
            <p className="text-slate-500 text-sm mt-1">Manage and review all incoming manuscripts.</p>
          </div>
          <button onClick={fetchManuscripts} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-all text-slate-700">
            <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh
          </button>
        </header>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Author</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading submissions...</td>
                  </tr>
                ) : manuscripts.length > 0 ? (
                  manuscripts.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 font-mono">{m.display_id || m.id.substring(0, 8)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 max-w-md truncate" title={m.title}>{m.title}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {/* Check if submitter exists content or flatten it */}
                        {m.submitter?.full_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(m.status)}`}>
                          {getStatusLabel(m.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(m.submission_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => navigate(`/dashboard/submissions/${m.display_id || m.id}`)} className="text-primary hover:text-primary-dark font-medium text-sm">View Details</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-slate-300">inbox</span>
                        <p>No submissions found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditorDashboard;