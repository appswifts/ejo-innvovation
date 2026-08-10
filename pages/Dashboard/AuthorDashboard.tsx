import React, { useEffect, useState, useRef } from 'react';
import { Manuscript } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: { full_name: string } | null;
}

interface PricingPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
}

const AuthorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Revision Modal State
  const [selectedManuscript, setSelectedManuscript] = useState<any | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionFile, setRevisionFile] = useState<File | null>(null);
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [apcPackages, setApcPackages] = useState<PricingPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      fetchManuscripts();
      fetchPackages();
    }
  }, [user]);

  const fetchManuscripts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('manuscripts')
        .select('*, journal:journals(title)')
        .eq('submitter_id', user?.id)
        .order('submission_date', { ascending: false });

      if (error) throw error;
      setManuscripts(data || []);
    } catch (error) {
      console.error('Error fetching manuscripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    const { data } = await supabase
      .from('publication_packages')
      .select('*')
      .eq('type', 'apc')
      .eq('is_active', true);
    setApcPackages(data || []);
    if (data && data.length > 0) {
      setSelectedPackage(data[0].id);
    }
  };

  const fetchComments = async (manuscriptId: string) => {
    try {
      const { data, error } = await supabase
        .from('manuscript_comments')
        .select('*, author:profiles(full_name)')
        .eq('manuscript_id', manuscriptId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const openRevisionModal = async (manuscript: any) => {
    setSelectedManuscript(manuscript);
    setShowRevisionModal(true);
    setRevisionFile(null);
    await fetchComments(manuscript.id);
  };

  const openPaymentModal = (manuscript: any) => {
    setSelectedManuscript(manuscript);
    setShowPaymentModal(true);
  };

  const handleRevisionSubmit = async () => {
    if (!selectedManuscript || !revisionFile || !user) return;

    try {
      setSubmittingRevision(true);

      // Upload new file
      const fileExt = revisionFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('manuscripts')
        .upload(fileName, revisionFile);

      if (uploadError) throw uploadError;

      // Update manuscript record
      const { error: updateError } = await supabase
        .from('manuscripts')
        .update({
          file_url: fileName,
          status: 'under_review',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedManuscript.id);

      if (updateError) throw updateError;

      setShowRevisionModal(false);
      setSelectedManuscript(null);
      setRevisionFile(null);
      fetchManuscripts();
      alert('Revision submitted successfully!');
    } catch (error) {
      console.error('Error submitting revision:', error);
      alert('Failed to submit revision. Please try again.');
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handlePaymentRedirect = (pkgId: string) => {
    if (!selectedManuscript) return;
    navigate(`/checkout?type=manuscript&id=${selectedManuscript.id}&package_id=${pkgId}`);
  };

  const handleDelete = async (manuscriptId: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('manuscripts').delete().eq('id', manuscriptId);
      if (error) throw error;
      fetchManuscripts();
    } catch (error: any) {
      alert('Failed to delete: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-100 text-emerald-700';
      case 'accepted': return 'bg-blue-100 text-blue-700';
      case 'under_review': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'revision_required': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const activeSubmissionsCount = manuscripts.filter(m => ['submitted', 'under_review', 'revision_required'].includes(m.status)).length;

  return (
    <div className="h-full bg-slate-50 overflow-y-auto w-full">
      <main className="max-w-[1280px] mx-auto w-full px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Manuscripts</h1>
            <p className="text-slate-500 text-sm mt-1">Track your submissions and respond to review feedback.</p>
          </div>
          <button onClick={() => navigate('/dashboard/submit')} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span> New Submission
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Active Submissions</p>
                <h3 className="text-xl font-bold text-slate-900">{activeSubmissionsCount}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Published</p>
                <h3 className="text-xl font-bold text-slate-900">{manuscripts.filter(m => m.status === 'published').length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <span className="material-symbols-outlined">edit_note</span>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Needs Revision</p>
                <h3 className="text-xl font-bold text-slate-900">{manuscripts.filter(m => m.status === 'revision_required').length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-bold text-slate-900">All Submissions</h4>
            <button onClick={fetchManuscripts} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary">
              <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Journal</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading manuscripts...</td>
                  </tr>
                ) : manuscripts.length > 0 ? (
                  manuscripts.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900 truncate max-w-xs" title={m.title}>{m.title}</p>
                        <p className="text-xs text-slate-400 font-mono">{m.display_id || m.id.substring(0, 8)}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.journal?.title || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(m.status)}`}>
                          {getStatusLabel(m.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {m.payment_status === 'paid' ? (
                          <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check</span> Paid
                          </span>
                        ) : m.status === 'accepted' ? (
                          <span className="text-amber-600 font-bold text-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">pending</span> Unpaid
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(m.submission_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {m.status === 'revision_required' && (
                          <button
                            onClick={() => openRevisionModal(m)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-all"
                          >
                            <span className="material-symbols-outlined text-[14px]">upload</span> Update
                          </button>
                        )}
                          {m.status === 'accepted' && m.payment_status !== 'paid' && (
                            <button
                              onClick={() => openPaymentModal(m)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-all"
                            >
                              <span className="material-symbols-outlined text-[14px]">payments</span> Pay Fee
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(m.id, m.title)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold transition-all"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-slate-300">inbox</span>
                        <p>No submissions found.</p>
                        <button onClick={() => navigate('/dashboard/submit')} className="text-primary text-sm font-bold hover:underline">Start a new submission</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Revision Modal */}
      {showRevisionModal && selectedManuscript && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Submit Revision</h2>
              <button onClick={() => setShowRevisionModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Manuscript</h3>
                <p className="text-slate-900 font-semibold">{selectedManuscript.title}</p>
              </div>

              {/* Review Comments */}
              {comments.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Reviewer Feedback</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-amber-800 text-sm">{comment.author?.full_name || 'Reviewer'}</span>
                          <span className="text-xs text-amber-600">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-amber-900">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Upload Revised Manuscript</h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setRevisionFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {!revisionFile ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center gap-3 p-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                      <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-900 font-semibold">Click to upload revised file</p>
                      <p className="text-slate-500 text-sm">PDF, DOCX (Max 25MB)</p>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <span className="material-symbols-outlined">description</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{revisionFile.name}</p>
                        <p className="text-xs text-slate-500">{(revisionFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => setRevisionFile(null)} className="text-red-500 hover:text-red-700">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowRevisionModal(false)} className="px-4 py-2 text-slate-600 font-semibold text-sm hover:bg-slate-100 rounded-lg transition-all">
                Cancel
              </button>
              <button
                onClick={handleRevisionSubmit}
                disabled={!revisionFile || submittingRevision}
                className="px-6 py-2 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {submittingRevision ? (
                  <>Submitting... <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span></>
                ) : (
                  <>Submit Revision</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedManuscript && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="bg-primary px-6 py-6 text-white text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
              <h2 className="text-xl font-bold">Publication Fee</h2>
              <p className="text-blue-100 text-sm mt-1">Submit payment to proceed with publication</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Fee Package</label>
                {apcPackages.length > 0 ? (
                  <select
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:primary-ring bg-white"
                  >
                    {apcPackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - {pkg.currency} {pkg.price}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    No pricing packages configured. Please contact support.
                  </div>
                )}
              </div>

              {selectedPackage && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600 text-sm">Subtotal</span>
                    <span className="font-bold text-slate-900">
                      {apcPackages.find(p => p.id === selectedPackage)?.currency} {apcPackages.find(p => p.id === selectedPackage)?.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-900">Total Due</span>
                    <span className="font-black text-xl text-primary">
                      {apcPackages.find(p => p.id === selectedPackage)?.currency} {apcPackages.find(p => p.id === selectedPackage)?.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => handlePaymentRedirect(selectedPackage)}
                disabled={processingPayment || !selectedPackage}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-2 text-slate-500 font-semibold text-sm hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorDashboard;