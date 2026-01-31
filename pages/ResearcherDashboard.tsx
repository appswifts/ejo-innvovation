import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, CheckCircle, PenTool, Eye, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { useAuth, useSubmissions, useMyReviews } from '../src/hooks';
import DashboardLayout from '../src/layouts/DashboardLayout';

const ResearcherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { submissions, loading: subsLoading } = useSubmissions();
  const { reviews, loading: reviewsLoading } = useMyReviews();

  // Calculate Stats
  const activeSubmissions = submissions.filter(s =>
    !['PUBLISHED', 'REJECTED', 'WITHDRAWN'].includes(s.status || '')
  ).length;

  const publishedArticles = submissions.filter(s =>
    s.status === 'PUBLISHED'
  ).length;

  const completedReviews = reviews.filter(r =>
    r.submitted_at !== null
  ).length;

  // Mock Views (until analytics implemented)
  const totalViews = 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'REVISION_REQUESTED': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PUBLISHED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgress = (status: string) => {
    switch (status) {
      case 'DRAFT': return 10;
      case 'SUBMITTED': return 30;
      case 'UNDER_REVIEW': return 50;
      case 'REVISION_REQUESTED': return 70;
      case 'ACCEPTED': return 90;
      case 'PUBLISHED': return 100;
      default: return 0;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto p-6 md:p-8 lg:p-10 flex flex-col gap-8">
        {/* Welcome Heading */}
        <header className="flex flex-wrap justify-between items-end gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-foreground tracking-tight text-[32px] font-bold leading-tight">
              Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Researcher'}
            </h1>
            <p className="text-primary text-sm font-normal leading-normal">Here is an overview of your current research activity.</p>
          </div>
        </header>

        {/* KPI Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm font-medium leading-normal">Active Submissions</p>
              <FileText className="text-primary size-5" />
            </div>
            <p className="text-foreground tracking-tight text-3xl font-bold leading-tight mt-2">{subsLoading ? '-' : activeSubmissions}</p>
            <p className="text-primary text-xs font-medium leading-normal mt-1 flex items-center gap-1">
              <TrendingUp className="size-4" />
              View details
            </p>
          </div>
          {/* Card 2 */}
          <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm font-medium leading-normal">Published Articles</p>
              <CheckCircle className="text-primary size-5" />
            </div>
            <p className="text-foreground tracking-tight text-3xl font-bold leading-tight mt-2">{subsLoading ? '-' : publishedArticles}</p>
            <p className="text-primary text-xs font-medium leading-normal mt-1 flex items-center gap-1">
              <TrendingUp className="size-4" />
              Total impact
            </p>
          </div>
          {/* Card 3 */}
          <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm font-medium leading-normal">Completed Reviews</p>
              <PenTool className="text-primary size-5" />
            </div>
            <p className="text-foreground tracking-tight text-3xl font-bold leading-tight mt-2">{reviewsLoading ? '-' : completedReviews}</p>
            <p className="text-muted-foreground text-xs font-medium leading-normal mt-1">
              {reviews.length - completedReviews} pending
            </p>
          </div>
          {/* Card 4 */}
          <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm font-medium leading-normal">Total Views</p>
              <Eye className="text-primary size-5" />
            </div>
            <p className="text-foreground tracking-tight text-3xl font-bold leading-tight mt-2">{totalViews}</p>
            <p className="text-primary text-xs font-medium leading-normal mt-1 flex items-center gap-1">
              <TrendingUp className="size-4" />
              Analytics coming soon
            </p>
          </div>
        </section>

        {/* Submissions Table */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">Submissions in Progress</h3>
            <Link className="text-primary text-sm font-medium hover:underline" to="/dashboard">View all</Link>
          </div>
          <div className="@container overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Article Title</th>
                    <th className="px-6 py-4 font-medium hidden sm:table-cell">Target Journal</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium hidden md:table-cell">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subsLoading ? (
                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading submissions...</td></tr>
                  ) : submissions.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No submissions found. Start a new one!</td></tr>
                  ) : (
                    submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-accent transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          <Link to={`/submit?id=${sub.id}`} className="hover:text-primary transition-colors block max-w-xs truncate">
                            {sub.title}
                          </Link>
                          <span className="text-xs text-muted-foreground sm:hidden">
                            {sub.venue?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-primary font-medium hidden sm:table-cell">
                          {sub.venue?.name || 'Unknown Venue'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(sub.status || 'DRAFT')}`}>
                            {sub.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell w-[30%]">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{sub.updated_at ? new Date(sub.updated_at).toLocaleDateString() : '-'}</span>
                              <span>{getProgress(sub.status || 'DRAFT')}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${getProgress(sub.status || 'DRAFT')}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ResearcherDashboard;