import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { useSubmission } from '../src/hooks/useSubmissions';
import { useComments } from '../src/hooks/useComments';
import { ChevronLeft, Download, FileText, MessageSquare, Clock, User, Shield, Send } from 'lucide-react';
import { useAuth } from '../src/hooks/useAuth';

const AdminSubmissionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { submission, loading, error } = useSubmission(id || '');
    const { comments, loading: commentsLoading, addComment } = useComments(id || '');

    const [newComment, setNewComment] = useState('');
    const [commentVisibility, setCommentVisibility] = useState<'internal' | 'author'>('internal');
    const [postingComment, setPostingComment] = useState(false);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setPostingComment(true);
        const { error } = await addComment(newComment, commentVisibility);
        if (!error) {
            setNewComment('');
        }
        setPostingComment(false);
    };

    if (loading) {
        return (
            <DashboardLayout variant="admin">
                <div className="flex items-center justify-center min-h-[500px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !submission) {
        return (
            <DashboardLayout variant="admin">
                <div className="p-8">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                        Error loading submission: {error || 'Submission not found'}
                    </div>
                    <Link to="/admin/submissions" className="mt-4 inline-flex items-center text-primary hover:underline">
                        <ChevronLeft className="size-4 mr-1" /> Back to Submissions
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    // Find primary file (manuscript)
    const primaryFile = submission?.files?.find((f: any) => f.file_type === 'MANUSCRIPT' || f.is_primary) || submission?.files?.[0];

    return (
        <DashboardLayout variant="admin">
            <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
                <div className="mb-6">
                    <Link to="/admin/submissions" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                        <ChevronLeft className="size-4 mr-1" /> Back to Submissions
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{submission?.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <User className="size-4" />
                                    {/* We need to fetch submitter details in useSubmission (it's currently not fetching submitter profile, only ID). 
                                         Ideally we update useSubmission to fetch submitter profile too.
                                     */}
                                    Submitter ID: {submission?.submitter_id.substring(0, 8)}...
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="size-4" />
                                    {new Date(submission?.created_at || '').toLocaleDateString()}
                                </span>
                                <span className="bg-secondary px-2.5 py-0.5 rounded-full text-xs font-medium uppercase">
                                    {submission?.status?.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
                                <Shield className="size-4" />
                                Review Decision
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Preview */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* File Preview Section */}
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <FileText className="size-4 text-primary" />
                                    Document Preview
                                </h3>
                                {primaryFile && (
                                    <a
                                        href={primaryFile.file_path.startsWith('http') ? primaryFile.file_path : '#'} // Needs signed URL logic
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm flex items-center gap-1 text-primary hover:underline font-medium"
                                        onClick={(e) => {
                                            if (!primaryFile.file_path.startsWith('http')) {
                                                e.preventDefault();
                                                alert('Download not implemented without signed URL generation logic.');
                                            }
                                        }}
                                    >
                                        <Download className="size-4" />
                                        Download PDF
                                    </a>
                                )}
                            </div>
                            <div className="flex-grow bg-slate-100 flex items-center justify-center p-4">
                                {primaryFile ? (
                                    // In a real app, use a PDF viewer library or Embed string. 
                                    // For now, simpler iframe to the file URL if accessible, or a placeholder.
                                    // Assuming file_path is a Supabase Storage path, we need a public/signed URL.
                                    // We'll just show a placeholder "Preview Unavailable" if we can't easily resolve URL without signing.
                                    <div className="text-center">
                                        <FileText className="size-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <p className="text-muted-foreground font-medium">Preview not available for this file type.</p>
                                        <p className="text-xs text-muted-foreground mt-1">{primaryFile.file_name}</p>
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground">No document uploaded.</div>
                                )}
                            </div>
                        </div>

                        {/* Abstract */}
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold mb-3 text-lg">Abstract</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {submission?.abstract || 'No abstract provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar: Comments & Meta */}
                    <div className="space-y-6">
                        {/* Comments Panel */}
                        <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-[600px]">
                            <div className="p-4 border-b border-border">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <MessageSquare className="size-4 text-primary" />
                                    Discussion
                                </h3>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                                {commentsLoading ? (
                                    <div className="text-center py-4">Loading comments...</div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center text-sm text-muted-foreground py-8">
                                        No comments yet. Start a discussion.
                                    </div>
                                ) : (
                                    comments.map((comment: any) => (
                                        <div key={comment.id} className={`flex flex - col gap - 1 p - 3 rounded - lg ${comment.visibility === 'internal' ? 'bg-yellow-50/50 border border-yellow-100' : 'bg-secondary/30'} `}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold">{comment.user?.full_name || 'Unknown User'}</span>
                                                <span className="text-[10px] text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm">{comment.content}</p>
                                            {comment.visibility === 'internal' && (
                                                <div className="flex items-center gap-1 text-[10px] text-yellow-600 font-medium mt-1">
                                                    <Shield className="size-3" /> Internal Note
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 border-t border-border bg-muted/10">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Type a comment..."
                                    className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                                />
                                <div className="flex justify-between items-center mt-3">
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={commentVisibility}
                                            onChange={(e) => setCommentVisibility(e.target.value as any)}
                                            className="text-xs bg-background border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary/20"
                                        >
                                            <option value="internal">Internal Note</option>
                                            <option value="author">Visible to Author</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={handlePostComment}
                                        disabled={postingComment || !newComment.trim()}
                                        className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                                    >
                                        <Send className="size-3" />
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* File List */}
                        <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Files</h3>
                            <div className="space-y-2">
                                {submission?.files?.map((file: any) => (
                                    <div key={file.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText className="size-4 text-muted-foreground flex-shrink-0" />
                                            <span className="text-sm truncate font-medium">{file.file_name}</span>
                                        </div>
                                        <button className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Download className="size-4" />
                                        </button>
                                    </div>
                                ))}
                                {(!submission?.files || submission.files.length === 0) && (
                                    <p className="text-sm text-muted-foreground italic">No files attached.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminSubmissionDetail;
