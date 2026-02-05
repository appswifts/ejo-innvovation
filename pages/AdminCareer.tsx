import React, { useState } from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Plus, Briefcase, Edit, Archive, RotateCcw, X, Trash2, Loader2, MapPin, Clock } from 'lucide-react';
import { useAdminCareer } from '../src/hooks';

const AdminCareer: React.FC = () => {
    const { jobs, loading, error, createJob, updateJob, archiveJob, restoreJob, deleteJob } = useAdminCareer();
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        department: '',
        location: '',
        job_type: 'full-time' as const,
        description: '',
        salary_range: '',
        application_email: '',
        application_url: '',
        requirements: '',
        benefits: ''
    });

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            department: '',
            location: '',
            job_type: 'full-time',
            description: '',
            salary_range: '',
            application_email: '',
            application_url: '',
            requirements: '',
            benefits: ''
        });
        setEditingJob(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setShowModal(true);
    };

    const handleOpenEdit = (job: any) => {
        setEditingJob(job);
        setFormData({
            title: job.title || '',
            slug: job.slug || '',
            department: job.department || '',
            location: job.location || '',
            job_type: job.job_type || 'full-time',
            description: job.description || '',
            salary_range: job.salary_range || '',
            application_email: job.application_email || '',
            application_url: job.application_url || '',
            requirements: (job.requirements || []).join('\n'),
            benefits: (job.benefits || []).join('\n')
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const jobData = {
            title: formData.title,
            slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
            department: formData.department || undefined,
            location: formData.location || undefined,
            job_type: formData.job_type as any,
            description: formData.description,
            salary_range: formData.salary_range || undefined,
            application_email: formData.application_email || undefined,
            application_url: formData.application_url || undefined,
            requirements: formData.requirements.split('\n').filter(r => r.trim()),
            benefits: formData.benefits.split('\n').filter(b => b.trim())
        };

        const result = editingJob
            ? await updateJob(editingJob.id, jobData)
            : await createJob(jobData);

        if (result.success) {
            setShowModal(false);
            resetForm();
        } else {
            alert(result.error);
        }
    };

    const handleArchive = async (id: string, isActive: boolean | null) => {
        if (isActive) {
            await archiveJob(id);
        } else {
            await restoreJob(id);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to permanently delete this job listing?')) {
            await deleteJob(id);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <DashboardLayout>
            <div className="px-6 py-8 max-w-[1400px] mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-foreground">
                            Career Management
                        </h1>
                        <p className="text-muted-foreground text-lg mt-2">
                            Manage job listings for your organization.
                        </p>
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        <Plus className="size-5" />
                        <span>Add New Job</span>
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center mb-6">
                        <p className="text-destructive">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && jobs.length === 0 && (
                    <div className="bg-secondary/30 rounded-2xl p-12 text-center border border-border border-dashed">
                        <Briefcase className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-bold">No Job Listings</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            Create your first job listing to start recruiting.
                        </p>
                        <button
                            onClick={handleOpenCreate}
                            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            Add New Job
                        </button>
                    </div>
                )}

                {/* Jobs Table */}
                {!loading && !error && jobs.length > 0 && (
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Job Title
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Posted
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {jobs.map((job) => (
                                        <tr key={job.id} className={`hover:bg-secondary/30 ${!job.is_active ? 'opacity-50' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Briefcase className="size-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-semibold text-foreground">{job.title}</div>
                                                        <div className="text-sm text-muted-foreground">{job.department || 'General'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                                                    {job.job_type.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <MapPin className="size-3.5" />
                                                    <span>{job.location || 'Remote'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.is_active
                                                        ? 'bg-green-500/10 text-green-600'
                                                        : 'bg-amber-500/10 text-amber-600'
                                                    }`}>
                                                    {job.is_active ? 'Active' : 'Archived'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Clock className="size-3.5" />
                                                    <span>{formatDate(job.created_at)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenEdit(job)}
                                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleArchive(job.id, job.is_active)}
                                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                                        title={job.is_active ? 'Archive' : 'Restore'}
                                                    >
                                                        {job.is_active ? <Archive className="size-4" /> : <RotateCcw className="size-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(job.id)}
                                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-xl font-bold">
                                    {editingJob ? 'Edit Job Listing' : 'Create New Job Listing'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Job Title *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="e.g., Senior Research Fellow"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            URL Slug
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="Auto-generated from title"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="e.g., Research, Editorial"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="e.g., Remote, Kigali, Rwanda"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Job Type *
                                        </label>
                                        <select
                                            required
                                            value={formData.job_type}
                                            onChange={(e) => setFormData({ ...formData, job_type: e.target.value as any })}
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="full-time">Full-time</option>
                                            <option value="part-time">Part-time</option>
                                            <option value="contract">Contract</option>
                                            <option value="remote">Remote</option>
                                            <option value="internship">Internship</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Salary Range
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.salary_range}
                                            onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="e.g., $50,000 - $70,000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Description *
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                        placeholder="Describe the role and responsibilities..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Requirements (one per line)
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formData.requirements}
                                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                            placeholder="PhD in relevant field&#10;5+ years experience&#10;Strong communication skills"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Benefits (one per line)
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formData.benefits}
                                            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                            placeholder="Competitive salary&#10;Health insurance&#10;Flexible work hours"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Application Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.application_email}
                                            onChange={(e) => setFormData({ ...formData, application_email: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="careers@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Application URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.application_url}
                                            onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="https://apply.example.com/job"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                                    >
                                        {editingJob ? 'Update Job' : 'Create Job'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminCareer;
