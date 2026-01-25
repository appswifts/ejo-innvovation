import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const ResearcherDashboard: React.FC = () => {
  return (
    <div className="bg-background text-foreground font-display overflow-hidden h-screen flex w-full">
      {/* LEFT SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-[280px] h-full border-r border-border bg-card flex-shrink-0">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-4">
            {/* Logo / Brand */}
            <Link to="/" className="flex gap-3 items-center px-2 py-2 group">
              <div className="size-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <Sparkles className="size-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-foreground text-base font-bold leading-normal">Ejo Innovation</h1>
                <p className="text-primary text-xs font-normal leading-normal">Researcher Console</p>
              </div>
            </Link>
            {/* Navigation */}
            <nav className="flex flex-col gap-2 mt-4">
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary group transition-colors" to="/dashboard">
                <span className="material-symbols-outlined text-[24px]" data-weight="fill">dashboard</span>
                <p className="text-sm font-medium leading-normal">Dashboard</p>
              </Link>
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-foreground transition-colors" to="/submit">
                <span className="material-symbols-outlined text-[24px]">add_circle</span>
                <p className="text-sm font-medium leading-normal">Submit</p>
              </Link>
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-foreground transition-colors" to="/dashboard">
                <span className="material-symbols-outlined text-[24px]">description</span>
                <p className="text-sm font-medium leading-normal">Submissions</p>
              </Link>
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-foreground transition-colors" to="/analytics">
                <span className="material-symbols-outlined text-[24px]">menu_book</span>
                <p className="text-sm font-medium leading-normal">Publications</p>
              </Link>
              <div className="h-px bg-border my-2 mx-3"></div>
              <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-foreground transition-colors" to="/dashboard">
                <span className="material-symbols-outlined text-[24px]">settings</span>
                <p className="text-sm font-medium leading-normal">Settings</p>
              </Link>
            </nav>
          </div>
          {/* Bottom Action */}
          <div className="flex flex-col gap-4">
            <Link to="/submit" className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm">
              <span className="truncate">New Submission</span>
            </Link>
            <div className="flex items-center gap-3 px-2">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 bg-secondary" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKN6T30kTmE0NXlFb6LLKG7O6DDLXAmzjYG9IXOiY-F8V0pzC7W6IwT9k1BAEN3hL85_wgBwHTk-U-ERZBQDkOl19hC6BgdxZkRNuB5qDS3pD7SiqfuGgEEqI1elf8bEg477oCEt8K8O2xW6FORgTVBx7q_7vi96wGnfQhJ0KtaoL0EfkO9RCN6FPuziBFvkx_Q25BDIF5qSG-NXH2iKiTNXBuylgleJriW2z7HLo-4fg-wVj8GO_ahHJVtG8eScE6GJ9eb_I2mvY')" }}></div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-medium truncate text-foreground">Dr. Silva</p>
                <p className="text-xs text-muted-foreground truncate">Senior Researcher</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto p-6 md:p-8 lg:p-10 flex flex-col gap-8">
            {/* Welcome Heading */}
            <header className="flex flex-wrap justify-between items-end gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-foreground tracking-tight text-[32px] font-bold leading-tight">Welcome back, Dr. Silva</h1>
                <p className="text-primary text-sm font-normal leading-normal">Here is an overview of your current research activity.</p>
              </div>
            </header>
            {/* KPI Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm font-medium leading-normal">Active Submissions</p>
                  <span className="material-symbols-outlined text-primary text-[20px]">description</span>
                </div>
                <p className="text-foreground tracking-tight text-3xl font-bold leading-tight mt-2">3</p>
                <p className="text-primary text-xs font-medium leading-normal mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  +1 this month
                </p>
              </div>
              {/* Card 2 */}
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm font-medium leading-normal">Published Articles</p>
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                </div>
                <p className="text-foreground tracking-tight text-3xl font-bold leading-tight mt-2">12</p>
                <p className="text-primary text-xs font-medium leading-normal mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  +2 this year
                </p>
              </div>
              {/* Card 3 */}
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm font-medium leading-normal">Completed Reviews</p>
                  <span className="material-symbols-outlined text-primary text-[20px]">rate_review</span>
                </div>
                <p className="text-foreground tracking-tight text-3xl font-bold leading-tight mt-2">7</p>
                <p className="text-muted-foreground text-xs font-medium leading-normal mt-1">
                  No pending reviews
                </p>
              </div>
              {/* Card 4 */}
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm font-medium leading-normal">Total Views</p>
                  <span className="material-symbols-outlined text-primary text-[20px]">visibility</span>
                </div>
                <p className="text-foreground tracking-tight text-3xl font-bold leading-tight mt-2">342</p>
                <p className="text-primary text-xs font-medium leading-normal mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  +15%
                </p>
              </div>
            </section>
            {/* Submissions Table */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">Submissions in Progress</h3>
                <a className="text-primary text-sm font-medium hover:underline" href="#">View all</a>
              </div>
              <div className="@container overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-secondary border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-medium">Article Title</th>
                        <th className="px-6 py-4 font-medium hidden sm:table-cell">Target Journal</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium hidden md:table-cell">Review Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {/* Row 1 */}
                      <tr className="hover:bg-accent transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          <Link to="/article" className="hover:text-primary">Neural Networks in 2024</Link>
                        </td>
                        <td className="px-6 py-4 text-primary font-medium hidden sm:table-cell">
                          Nature AI
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Under Review
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell w-[30%]">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>27 days</span>
                              <span>Target: 90 days</span>
                            </div>
                            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: '30%' }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResearcherDashboard;