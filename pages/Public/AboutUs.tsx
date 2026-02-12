import React from 'react';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';

const AboutUs: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <TopNav />

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white py-24">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>
                <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
                        About Us
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                        Empowering African Scholarship<br />& Innovation
                    </h1>
                    <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Nkiza Center is dedicated to advancing scholarly publishing, creative expression,
                        and intellectual discourse across Africa and the global diaspora.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 px-6 max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                            <span className="material-symbols-outlined text-primary text-2xl">flag</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Our Mission</h2>
                        <p className="text-slate-600 leading-relaxed">
                            To provide a world-class digital platform for the publication, peer review, and distribution
                            of scholarly journals, books, and creative content — making African knowledge accessible,
                            discoverable, and impactful worldwide.
                        </p>
                    </div>
                    <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
                            <span className="material-symbols-outlined text-emerald-600 text-2xl">visibility</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Our Vision</h2>
                        <p className="text-slate-600 leading-relaxed">
                            A future where every African researcher, author, and thinker has equal access to
                            publish their work, participate in global scholarly discourse, and contribute to
                            the world's body of knowledge.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-12">Our Core Values</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: 'school', title: 'Academic Rigor', desc: 'Upholding the highest standards of scholarly peer review and editorial excellence.' },
                            { icon: 'diversity_3', title: 'Inclusivity', desc: 'Ensuring access and representation for diverse voices, languages, and disciplines.' },
                            { icon: 'lightbulb', title: 'Innovation', desc: 'Leveraging technology to make publishing more efficient, transparent, and accessible.' },
                            { icon: 'public', title: 'Pan-African Impact', desc: 'Amplifying African scholarship on the global stage while grounding our work locally.' },
                        ].map((v, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <span className="material-symbols-outlined text-primary text-3xl mb-4 block">{v.icon}</span>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{v.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What We Do */}
            <section className="py-20 px-6 max-w-5xl mx-auto">
                <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-4">What We Offer</h2>
                <p className="text-center text-slate-500 max-w-2xl mx-auto mb-12">
                    A comprehensive publishing ecosystem built for researchers, authors, and institutions.
                </p>
                <div className="space-y-6">
                    {[
                        { icon: 'menu_book', title: 'Journal Publishing', desc: 'Host and manage peer-reviewed academic journals with rigorous editorial workflows, from submission to publication.' },
                        { icon: 'auto_stories', title: 'Book Publishing', desc: 'Publish scholarly monographs, creative works, and nonfiction with global digital distribution and discoverability.' },
                        { icon: 'rate_review', title: 'Peer Review Management', desc: 'Streamlined reviewer assignment, double-blind review processes, and automated communication for editors.' },
                        { icon: 'analytics', title: 'Author Analytics', desc: 'Track readership, downloads, citations, and impact metrics for published works in real time.' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-5 p-6 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary">{item.icon}</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutUs;
