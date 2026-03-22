import React from 'react';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';

const Copyright: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <TopNav />

            {/* Hero */}
            <section className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 text-white py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
                        Legal
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Copyright & Terms</h1>
                    <p className="text-amber-100 text-sm">Effective: February 2026</p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-6 max-w-4xl mx-auto">
                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 leading-relaxed mb-10 text-lg">
                        All content published on the Nkiza Center for Research platform is protected by copyright law.
                        This page outlines the rights of authors, the platform, and users regarding published works.
                    </p>

                    {/* Author Rights */}
                    <div className="mb-10 p-6 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-primary text-2xl">person</span>
                            <h2 className="text-xl font-extrabold text-slate-900">Author Rights</h2>
                        </div>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                                <span>Authors retain full copyright ownership of their original works (articles, books, creative content) published through Nkiza Center for Research.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                                <span>By submitting work, authors grant Nkiza Center for Research a non-exclusive license to publish, distribute, and display the work on its platform.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                                <span>Authors may self-archive pre-print versions and share their work on personal websites or institutional repositories.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                                <span>Authors are responsible for ensuring their work does not infringe on third-party copyrights.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Platform Rights */}
                    <div className="mb-10 p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-emerald-600 text-2xl">shield</span>
                            <h2 className="text-xl font-extrabold text-slate-900">Platform Rights</h2>
                        </div>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5">check</span>
                                <span>Nkiza Center for Research owns the platform design, branding, logos, and proprietary technology.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5">check</span>
                                <span>The platform may remove content that violates copyright, plagiarism policies, or community standards.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5">check</span>
                                <span>Editorial decisions regarding peer review outcomes are made independently and are final.</span>
                            </li>
                        </ul>
                    </div>

                    {/* User/Reader Rights */}
                    <div className="mb-10 p-6 bg-purple-50 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-purple-600 text-2xl">menu_book</span>
                            <h2 className="text-xl font-extrabold text-slate-900">User & Reader Rights</h2>
                        </div>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-purple-600 text-sm mt-0.5">check</span>
                                <span>Users may access and read published content for personal, educational, and research purposes.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-purple-600 text-sm mt-0.5">check</span>
                                <span>Quoting published works is permitted with proper attribution following standard citation practices.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-purple-600 text-sm mt-0.5">check</span>
                                <span>Bulk downloading, redistribution, or commercial use of published content is prohibited without explicit permission.</span>
                            </li>
                        </ul>
                    </div>

                    {/* DMCA */}
                    <div className="mb-10 p-6 bg-red-50 rounded-xl border border-red-100">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-red-600 text-2xl">gavel</span>
                            <h2 className="text-xl font-extrabold text-slate-900">Copyright Infringement Claims</h2>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            If you believe content on our platform infringes your copyright, please submit a takedown notice to
                            <a href="mailto:contact@nkiza.com" className="text-primary font-semibold hover:underline ml-1">contact@nkiza.com</a>
                            {' '}including:
                        </p>
                        <ol className="space-y-2 text-sm text-slate-600 list-decimal pl-5">
                            <li>A description of the copyrighted work claimed to be infringed.</li>
                            <li>The URL or location of the allegedly infringing material on our platform.</li>
                            <li>Your contact information (name, email, phone number).</li>
                            <li>A statement of good faith belief that the use is not authorized.</li>
                            <li>A statement under penalty of perjury that the information is accurate.</li>
                        </ol>
                    </div>

                    {/* Creative Commons */}
                    <div className="mb-10 p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-slate-700 text-2xl">license</span>
                            <h2 className="text-xl font-extrabold text-slate-900">Open Access & Creative Commons</h2>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Some journals and publications on our platform may adopt Creative Commons licensing (e.g., CC BY, CC BY-NC).
                            When applicable, the specific license type will be clearly displayed on the publication page.
                            Authors selecting open access options retain copyright while granting readers broader usage rights as defined by the chosen license.
                        </p>
                    </div>
                </div>

                <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Legal Inquiries</h3>
                    <p className="text-sm text-slate-500">
                        For copyright questions or legal matters, contact{' '}
                        <a href="mailto:contact@nkiza.com" className="text-primary font-semibold hover:underline">
                            contact@nkiza.com
                        </a>
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Copyright;
