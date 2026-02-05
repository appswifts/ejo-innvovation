import React from 'react';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Link } from 'react-router-dom';

const Career: React.FC = () => {
    const jobs = [
        {
            id: '1',
            title: 'Senior Research Fellow',
            department: 'Public Health',
            location: 'Nairobi, Kenya',
            type: 'Full-time',
            posted: '2 days ago',
            description: 'Lead research initiatives in community health systems and epidemiology.'
        },
        {
            id: '2',
            title: 'Assistant Editor',
            department: 'Editorial',
            location: 'Remote / Kigali',
            type: 'Part-time',
            posted: '5 days ago',
            description: 'Manage peer review processes for the Journal of African Development.'
        },
        {
            id: '3',
            title: 'Data Analyst',
            department: 'Technology',
            location: 'Remote',
            type: 'Contract',
            posted: '1 week ago',
            description: 'Analyze large datasets for our open access publishing metrics.'
        },
        // Add more mock jobs
    ];

    return (
        <DashboardLayout>
            <div className="px-6 py-8 max-w-[1400px] mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-foreground">Careers</h1>
                        <p className="text-muted-foreground text-lg mt-2">Join our team and help shape the future of African research.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {jobs.map((job) => (
                        <div key={job.id} className="group bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">{job.department}</p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    {job.type}
                                </span>
                            </div>

                            <p className="text-muted-foreground mb-6 line-clamp-2">
                                {job.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="size-3.5" />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="size-3.5" />
                                        <span>{job.posted}</span>
                                    </div>
                                </div>
                                <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:translate-x-1 transition-transform">
                                    Apply Now <ArrowRight className="size-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-secondary/30 rounded-2xl p-8 text-center border border-border border-dashed">
                    <Briefcase className="size-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-bold">No suitable roles?</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        We are always looking for talented individuals. Send your CV to careers@ejoinnovation.com and we'll keep you on file.
                    </p>
                    <button className="px-5 py-2.5 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity">
                        Send Open Application
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Career;
