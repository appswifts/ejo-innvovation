import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-secondary pt-16 pb-8 border-t border-border">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2 lg:col-span-2 pr-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="size-8 rounded-lg bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center">
                                <Sparkles className="size-4 text-primary-foreground" strokeWidth={2.5} />
                            </div>
                            <span className="text-lg font-bold text-foreground">Ejo Innovation</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                            Accelerating scientific discovery by making research more accessible, transparent, and collaborative for everyone.
                        </p>
                        <div className="flex gap-4">
                            <a className="text-muted-foreground hover:text-primary transition-colors" href="#"><span className="sr-only">Twitter</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg></a>
                            <a className="text-muted-foreground hover:text-primary transition-colors" href="#"><span className="sr-only">LinkedIn</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg></a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Platform</h3>
                        <ul className="space-y-3">
                            <li><Link to="/search" className="text-sm text-muted-foreground hover:text-primary">Browse Journals</Link></li>
                            <li><Link to="/submit" className="text-sm text-muted-foreground hover:text-primary">Submit Manuscript</Link></li>
                            <li><Link to="/search" className="text-sm text-muted-foreground hover:text-primary">Institutions</Link></li>
                            <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Help Center</a></li>
                            <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">API Documentation</a></li>
                            <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Community Guidelines</a></li>
                            <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Blog</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">About Us</a></li>
                            <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Careers</a></li>
                            <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Legal</a></li>
                            <li><a className="text-sm text-muted-foreground hover:text-primary" href="#">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground text-center md:text-left">
                        © 2023 Ejo Innovation Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a className="text-xs text-muted-foreground hover:text-primary" href="#">Privacy Policy</a>
                        <a className="text-xs text-muted-foreground hover:text-primary" href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
