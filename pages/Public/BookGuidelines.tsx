
import React from 'react';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';

const BookGuidelines: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <TopNav />

            {/* Hero */}
            <section className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-primary/30 rounded-full blur-[120px]" />
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-[120px]" />
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
                        <span className="material-symbols-outlined text-sm">menu_book</span>
                        Author Guidelines
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Book Publication Guidelines</h1>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
                        Nkiza Center for Research welcomes high-quality book submissions. Review our guidelines to prepare your manuscript for publication.
                    </p>
                </div>
            </section>

            {/* Intro */}
            <section className="py-16 px-6 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-primary/5 to-indigo-50 rounded-2xl p-8 border border-primary/10 mb-12">
                    <p className="text-slate-700 leading-relaxed text-[15px]">
                        Nkiza Center for Research welcomes high-quality book submissions under three main categories:
                        <strong> Scholarly Books</strong> and <strong>Creative Content &amp; General Nonfiction Books</strong>.
                        All submitted books must demonstrate originality, intellectual contribution, ethical integrity, and professional presentation.
                        Manuscripts must be carefully proofread and submitted in PDF format following the official Nkiza Book Template (where applicable).
                    </p>
                    <p className="text-slate-600 leading-relaxed text-sm mt-4">
                        All books undergo an independent review process conducted by qualified experts in the relevant field.
                        Authors will receive an official decision indicating whether the manuscript has been accepted, requires revision, or has been rejected.
                    </p>
                </div>

                {/* ─── Category 1: Scholarly Books ─── */}
                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-indigo-600 text-2xl">school</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Category 1</span>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Scholarly Books</h2>
                        </div>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-8">
                        Scholarly books include academic monographs, research-based books, policy-oriented works, analytical texts,
                        professional references, and advanced theoretical or applied studies across disciplines.
                    </p>

                    {/* Submission Requirements */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">checklist</span>
                            Submission Requirements
                        </h3>
                        <div className="space-y-3">
                            {[
                                { icon: 'payments', text: 'Submission Fee: 172 USD (or equivalent in Rwandan Francs).' },
                                { icon: 'description', text: 'Maximum Length: 60 pages.' },
                                { icon: 'add_circle', text: 'If the author wishes to publish more than 60 pages, additional review fees will apply for the extra pages, based on the current review rate charged by Nkiza Center for Research.' },
                                { icon: 'translate', text: 'Manuscripts must be written in clear, professional English, French, or Kinyarwanda.' },
                                { icon: 'format_quote', text: 'Proper referencing is mandatory (APA latest edition unless otherwise specified).' },
                                { icon: 'article', text: 'A structured format is required (Abstract/Preface, Introduction, Literature Review or Conceptual Framework, Core Chapters, Conclusion, References, and Appendix where necessary).' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-primary text-base mt-0.5 flex-shrink-0">{item.icon}</span>
                                    <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ethical Standards */}
                    <div className="bg-red-50/50 rounded-2xl border border-red-100 p-6 mb-6">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-lg">gavel</span>
                            Ethical and Quality Standards
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">A scholarly book may be rejected if:</p>
                        <div className="space-y-2.5">
                            {[
                                'Plagiarism exceeds 5% similarity index.',
                                'AI tools are used without proper disclosure in a dedicated section titled "AI Use Disclosure."',
                                'The manuscript contains fabricated or unverifiable references.',
                                'There is violation of privacy, confidentiality, or data protection standards.',
                                'The work promotes divisive ideologies, hate speech, or personal attacks.',
                                'The content excessively recycles existing topics without originality, novelty, or meaningful contribution.',
                                'The work lacks academic rigor, methodological clarity, or intellectual contribution.',
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-red-400 text-sm mt-0.5 flex-shrink-0">close</span>
                                    <p className="text-sm text-slate-600 leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Refund Policy */}
                    <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-6">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-600 text-lg">account_balance</span>
                            Refund Policy
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            If the book is rejected, the author will receive <strong>20% of the submission fee</strong> as a refund,
                            while the remaining amount covers administrative processing and expert review costs.
                        </p>
                    </div>
                </div>

                {/* ─── Category 2: Creative & Nonfiction ─── */}
                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-pink-600 text-2xl">auto_stories</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em]">Category 2</span>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Creative Content &amp; General Nonfiction</h2>
                        </div>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-8">
                        This category includes essays, biographies, memoirs, reflective works, cultural commentary,
                        inspirational writing, educational books, and other general nonfiction content intended for a broader audience.
                    </p>

                    {/* Submission Requirements */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">checklist</span>
                            Submission Requirements
                        </h3>
                        <div className="space-y-3">
                            {[
                                { icon: 'payments', text: 'Submission Fee: 172 USD (or equivalent in Rwandan Francs).' },
                                { icon: 'description', text: 'Maximum Length: 60 pages.' },
                                { icon: 'add_circle', text: 'If the author wishes to publish more than 60 pages, additional review fees will apply for the extra pages, based on the current rate charged.' },
                                { icon: 'edit_note', text: 'Manuscripts must be professionally written in English, French, or Kinyarwanda and carefully proofread.' },
                                { icon: 'format_quote', text: 'Proper acknowledgment of sources is required where applicable.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-primary text-base mt-0.5 flex-shrink-0">{item.icon}</span>
                                    <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ethical Standards */}
                    <div className="bg-red-50/50 rounded-2xl border border-red-100 p-6 mb-6">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-lg">gavel</span>
                            Ethical and Content Standards
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">A creative or general nonfiction book may be rejected if:</p>
                        <div className="space-y-2.5">
                            {[
                                'Plagiarism exceeds 5% similarity index.',
                                'AI tools are used without proper disclosure in a dedicated section titled "AI Use Disclosure."',
                                'The manuscript infringes on privacy rights or contains defamatory statements.',
                                'The work promotes divisive ideologies, hate speech, discrimination, or personal attacks.',
                                'The content violates ethical publishing standards.',
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-red-400 text-sm mt-0.5 flex-shrink-0">close</span>
                                    <p className="text-sm text-slate-600 leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Refund Policy */}
                    <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-6">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-600 text-lg">account_balance</span>
                            Refund Policy
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            If the book is rejected, the author will receive <strong>20% of the submission fee</strong> as a refund,
                            as the remaining portion covers review and administrative costs.
                        </p>
                    </div>
                </div>

                {/* ─── General Publishing Conditions ─── */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Important</span>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">General Publishing Conditions</h2>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                        <div className="space-y-3">
                            {[
                                { icon: 'picture_as_pdf', text: 'Authors must submit the manuscript in PDF format.' },
                                { icon: 'receipt_long', text: 'Proof of submission fee payment must accompany the manuscript.' },
                                { icon: 'draw', text: 'A signed copyright declaration form is required.' },
                                { icon: 'shield', text: 'Authors bear full responsibility for the originality, legality, and authenticity of their work.' },
                                { icon: 'smart_toy', text: 'AI tools cannot be listed as authors under any circumstances.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50/60 border border-slate-100">
                                    <span className="material-symbols-outlined text-emerald-500 text-base mt-0.5 flex-shrink-0">{item.icon}</span>
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Closing Message */}
                <div className="bg-gradient-to-r from-primary/5 via-indigo-50 to-primary/5 rounded-2xl p-8 border border-primary/10 text-center">
                    <span className="material-symbols-outlined text-primary text-4xl mb-4 block">auto_awesome</span>
                    <p className="text-slate-700 leading-relaxed text-sm max-w-2xl mx-auto">
                        <strong>Nkiza Center for Research</strong> is committed to maintaining high standards of academic excellence,
                        intellectual integrity, and responsible publishing. We strongly encourage submissions that contribute meaningful knowledge,
                        inspire constructive dialogue, and promote ethical and innovative thinking across disciplines and communities.
                    </p>
                    <a
                        href="/dashboard/post-book"
                        className="inline-flex items-center gap-2 mt-6 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        <span className="material-symbols-outlined text-base">publish</span>
                        Submit Your Manuscript
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default BookGuidelines;
