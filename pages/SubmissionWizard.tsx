import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const SubmissionWizard: React.FC = () => {
  return (
    <div className="bg-background text-foreground font-display min-h-screen flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border bg-card px-10 py-3 shadow-sm">
        <div className="flex items-center gap-4 text-foreground">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="size-9 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <Sparkles className="size-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
          </Link>
          <h2 className="text-foreground text-xl font-bold leading-tight tracking-tight">Ejo Innovation</h2>
        </div>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <nav className="hidden md:flex items-center gap-9">
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium leading-normal">Dashboard</Link>
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium leading-normal">My Library</Link>
          </nav>
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-border" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAGN3aCOwWX0c9e4tYzbEGyW7bXYvG8ovjaTrwe_myqK4sMgwL3WuirDdClZ_JXgZot3mzNVBxw0wulusrccB60DHZfHJADOY1IxIWo8gMR39KQL-yJREi_-Cyb6nDmQc99qhJvy4FQcw9UM7Kzz7eehW89o6uLaPYCDAOudlbGv4Hw8Nd4fRh2LZjpir2fQJEMsoUb4EI1_YIHF20Ji5w7bdkyNVHsBzTS5VU5tqeVXSib2MsAzqDyeOURWTD9jEXDSRu2LI1VOb8')" }}></div>
        </div>
      </header>
      <div className="layout-container flex grow flex-col w-full max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row flex-1 p-6 md:p-10 gap-8">
          {/* Left Sidebar Navigation */}
          <aside className="w-full md:w-72 shrink-0">
            <div className="sticky top-28 flex flex-col gap-6 bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex flex-col">
                <h1 className="text-foreground text-lg font-semibold leading-normal">Submission Wizard</h1>
                <p className="text-primary text-sm font-medium leading-normal">New Article</p>
              </div>
              <nav className="flex flex-col gap-2">
                {/* Step 1: Completed */}
                <a className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors" href="#">
                  <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </span>
                  <p className="text-muted-foreground text-sm font-medium group-hover:text-foreground">File Upload</p>
                </a>
                {/* Step 2: Active */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30">
                    <span className="text-xs font-bold">2</span>
                  </span>
                  <p className="text-primary font-semibold text-sm">Metadata</p>
                </div>
              </nav>
            </div>
          </aside>
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0">
            <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-full">
              {/* Progress Header */}
              <div className="border-b border-border p-6 md:p-8 pb-6">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-foreground text-2xl font-bold leading-tight tracking-tight">Step 2: Article Metadata</h2>
                      <p className="text-muted-foreground text-sm mt-1">Provide the core details of your research to help others find it.</p>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
              {/* Form Content */}
              <div className="p-6 md:p-8 flex flex-col gap-8 flex-1">
                {/* Article Title */}
                <div className="flex flex-col gap-2">
                  <label className="text-foreground font-medium text-sm flex justify-between" htmlFor="article-title">
                    <span>Article Title <span className="text-red-500">*</span></span>
                    <span className="text-muted-foreground font-normal text-xs">0/300 characters</span>
                  </label>
                  <input className="form-input block w-full rounded-lg border-input bg-background text-foreground focus:border-primary focus:ring-primary h-12 px-4 placeholder:text-muted-foreground text-base" id="article-title" placeholder="Enter a descriptive title for your research" type="text" />
                </div>
                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-border pt-6 mt-auto">
                  <button className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors" type="button">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors" type="button">
                    Next: Research Details
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SubmissionWizard;