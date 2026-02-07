import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface ManuscriptDetail {
    id: string;
    title: string;
    abstract: string;
    cover_letter: string;
    status: string;
    submission_date: string;
    updated_at: string;
    file_url: string;
    submitter: { id: string; full_name: string; email: string } | null;
    journal: { title: string } | null;
    payment_status?: string;
    display_id?: string;
}

interface Comment {
    id: string;
    content: string;
    created_at: string;
    author: { full_name: string } | null;
}

const STATUS_OPTIONS = [
    { value: 'submitted', label: 'Submitted', color: 'bg-slate-100 text-slate-600' },
    { value: 'under_review', label: 'Under Review', color: 'bg-amber-100 text-amber-700' },
    { value: 'revision_required', label: 'Revision Required', color: 'bg-orange-100 text-orange-700' },
    { value: 'accepted', label: 'Accepted', color: 'bg-blue-100 text-blue-700' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
    { value: 'published', label: 'Published', color: 'bg-emerald-100 text-emerald-700' },
];

const ManuscriptDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [manuscript, setManuscript] = useState<ManuscriptDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const isEditor = profile?.role?.slug === 'super_admin' || profile?.role?.slug === 'editor';

    useEffect(() => {
        if (id) {
            fetchManuscript(id);
        }
    }, [id]);

    // Fetch comments when manuscript is loaded (using actual UUID)
    useEffect(() => {
        if (manuscript?.id) {
            fetchComments(manuscript.id);
        }
    }, [manuscript?.id]);

    const fetchManuscript = async (manuscriptId: string) => {
        try {
            setLoading(true);

            // Check if input is a valid UUID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(manuscriptId);

            let query = supabase
                .from('manuscripts')
                .select(`
                    *,
                    submitter:profiles(id, full_name, email),
                    journal:journals(title)
                `);

            if (isUuid) {
                query = query.eq('id', manuscriptId);
            } else {
                query = query.eq('display_id', manuscriptId);
            }

            const { data, error } = await query.single();

            if (error) throw error;
            setManuscript(data);

            // Fetch comments using the actual manuscript UUID
            if (data?.id) {
                fetchComments(data.id);
            }
        } catch (error) {
            console.error('Error fetching manuscript:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (manuscriptId: string) => {
        try {
            console.log('Fetching comments for manuscript:', manuscriptId);
            const { data, error } = await supabase
                .from('manuscript_comments')
                .select(`
                    *,
                    author:profiles(full_name)
                `)
                .eq('manuscript_id', manuscriptId)
                .order('created_at', { ascending: false });

            console.log('Comments data:', data);
            console.log('Comments error:', error);

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!manuscript || !id) return;

        try {
            setUpdatingStatus(true);
            const { error } = await supabase
                .from('manuscripts')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', manuscript.id);

            if (error) throw error;

            setManuscript({ ...manuscript, status: newStatus });
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !id || !profile) return;

        try {
            setSubmittingComment(true);
            const { error } = await supabase
                .from('manuscript_comments')
                .insert({
                    manuscript_id: manuscript.id,
                    author_id: profile.id,
                    content: newComment.trim()
                });

            if (error) throw error;

            setNewComment('');
            fetchComments(manuscript.id);
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to add comment.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleManualPayment = async () => {
        if (!manuscript || !id || !profile) return;

        if (!window.confirm("Are you sure you want to mark this manuscript as PAID manually? This is usually for bank transfers or waivers.")) {
            return;
        }

        try {
            setUpdatingStatus(true);

            // 1. Create a manual transaction record
            const { error: txError } = await supabase.from('transactions').insert({
                amount: 0, // 0 for manual/waiver, or maybe we should ask for amount? keeping simple for now
                currency: 'USD',
                status: 'completed',
                type: 'manual_payment',
                description: `Manual payment marked by Admin (${profile.full_name})`,
                user_id: manuscript.submitter?.id || profile.id, // Associate with submitter if possible
                manuscript_id: manuscript.id,
                // No package_id for manual override unless we select one, but keeping simple
            });

            if (txError) throw txError;

            // 2. Update manuscript payment status
            const { error: manError } = await supabase
                .from('manuscripts')
                .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
                .eq('id', manuscript.id);

            if (manError) throw manError;

            setManuscript({ ...manuscript, payment_status: 'paid' });
            alert("Manuscript marked as PAID.");
        } catch (error: any) {
            console.error("Error marking as paid:", error);
            alert("Error: " + error.message);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDownload = async () => {
        if (!manuscript?.file_url) return;

        try {
            setDownloading(true);
            let storagePath = manuscript.file_url;

            if (storagePath.includes('supabase.co/storage/v1/object/')) {
                const match = storagePath.match(/\/manuscripts\/(.+)$/);
                if (match) storagePath = match[1];
            }

            const { data, error } = await supabase.storage
                .from('manuscripts')
                .download(storagePath);

            if (error) throw error;

            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = storagePath.split('/').pop() || 'manuscript.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file.');
        } finally {
            setDownloading(false);
        }
    };

    const getStatusColor = (status: string) => STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-slate-100 text-slate-600';
    const getStatusLabel = (status: string) => STATUS_OPTIONS.find(s => s.value === status)?.label || status;

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!manuscript) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                <span className="material-symbols-outlined text-5xl mb-4">error</span>
                <p className="text-lg font-medium">Manuscript not found</p>
                <button onClick={() => navigate('/dashboard/submissions')} className="mt-4 text-primary font-medium hover:underline">
                    Back to Submissions
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white h-16 flex items-center justify-between px-6">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/dashboard/submissions')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Manuscript ID</span>
                        <span className="text-sm font-medium text-slate-800">{manuscript.display_id || manuscript.id.substring(0, 8)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(manuscript.status)}`}>
                        {getStatusLabel(manuscript.status)}
                    </span>
                    {manuscript.payment_status === 'paid' && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">verified</span> Paid
                        </span>
                    )}
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden">
                {/* Left: Content Area */}
                <section className="flex-1 bg-slate-100 p-8 overflow-y-auto">
                    <div className="max-w-3xl mx-auto bg-white shadow-sm border border-slate-200 min-h-screen p-12 rounded-xl">
                        <div className="mb-12">
                            <h1 className="text-3xl font-bold text-slate-900 mb-6">{manuscript.title}</h1>

                            <div className="flex items-center gap-6 text-sm text-slate-500 mb-8 border-y border-slate-100 py-4">
                                <div>
                                    <span className="font-bold text-slate-400 uppercase text-[10px] block tracking-widest mb-1">Author</span>
                                    <span className="font-medium text-slate-900">{manuscript.submitter?.full_name}</span>
                                </div>
                                <div className="w-px h-8 bg-slate-200"></div>
                                <div>
                                    <span className="font-bold text-slate-400 uppercase text-[10px] block tracking-widest mb-1">Journal</span>
                                    <span className="font-medium text-slate-900">{manuscript.journal?.title || 'General'}</span>
                                </div>
                                <div className="w-px h-8 bg-slate-200"></div>
                                <div>
                                    <span className="font-bold text-slate-400 uppercase text-[10px] block tracking-widest mb-1">Submitted</span>
                                    <span className="font-medium text-slate-900">{new Date(manuscript.submission_date).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <section className="mb-10">
                                <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 border-b border-primary/10 pb-2">Abstract</h2>
                                <p className="text-slate-700 leading-relaxed text-justify whitespace-pre-wrap">
                                    {manuscript.abstract || 'No abstract provided.'}
                                </p>
                            </section>

                            {manuscript.cover_letter && (
                                <section className="mb-10">
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Cover Letter</h2>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{manuscript.cover_letter}</p>
                                </section>
                            )}

                            <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Manuscript File</p>
                                        <p className="text-xs text-slate-500">PDF Document</p>
                                    </div>
                                </div>
                                {manuscript.file_url ? (
                                    <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/20 disabled:opacity-50">
                                        <span className="material-symbols-outlined text-[18px]">{downloading ? 'hourglass_empty' : 'download'}</span>
                                        {downloading ? 'Downloading...' : 'Download Full File'}
                                    </button>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">No file attached</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right: Review Sidebar */}
                {isEditor && (
                    <section className="w-[450px] bg-white border-l border-slate-200 flex flex-col shadow-2xl">
                        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">Editorial Actions</h2>
                            <p className="text-xs text-slate-500 mt-1">Manage manuscript status and communication.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {/* Status Section */}
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Update Decisions</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        <button
                                            onClick={() => handleStatusChange('accepted')}
                                            disabled={updatingStatus}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                            Accept Manuscript
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange('revision_required')}
                                            disabled={updatingStatus}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 bg-orange-50 text-orange-700 rounded-lg font-bold text-sm hover:bg-orange-500 hover:text-white transition-all border border-orange-100"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit_note</span>
                                            Request Revision
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange('rejected')}
                                            disabled={updatingStatus}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg font-bold text-sm hover:bg-red-600 hover:text-white transition-all border border-red-100"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">cancel</span>
                                            Reject Manuscript
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Detailed Status</label>
                                        <select
                                            value={manuscript.status}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            disabled={updatingStatus}
                                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        >
                                            {STATUS_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {manuscript.payment_status !== 'paid' && (
                                        <button
                                            onClick={handleManualPayment}
                                            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-primary hover:bg-primary/5 border border-primary/20 rounded-lg transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">payments</span> Mark as Paid (Manual)
                                        </button>
                                    )}
                                </div>

                                {/* Comments Section */}
                                <div className="pt-6 border-t border-slate-100">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Review Communication</label>

                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add a comment to the author..."
                                                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm resize-none"
                                                rows={4}
                                            />
                                            <button
                                                onClick={handleAddComment}
                                                disabled={!newComment.trim() || submittingComment}
                                                className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-lg shadow-lg hover:bg-primary-dark disabled:opacity-50 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">{submittingComment ? 'hourglass_empty' : 'send'}</span>
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {comments.map((comment) => (
                                                <div key={comment.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-slate-800 text-xs">{comment.author?.full_name}</span>
                                                        <span className="text-[10px] text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-slate-600 text-xs leading-relaxed">{comment.content}</p>
                                                </div>
                                            ))}
                                            {comments.length === 0 && (
                                                <p className="text-center text-slate-400 text-xs py-4">No comments posted yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-200 bg-slate-50/50">
                            <p className="text-[10px] text-center text-slate-400 font-medium">All actions are logged and visible to administrators.</p>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default ManuscriptDetailPage;
