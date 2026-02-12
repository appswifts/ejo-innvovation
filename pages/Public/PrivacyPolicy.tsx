import React from 'react';
import TopNav from '../../components/TopNav';

const PrivacyPolicy: React.FC = () => {
    const sections = [
        {
            title: 'Information We Collect',
            content: `We collect information you provide directly to us when you create an account, submit manuscripts, purchase books, or contact us. This includes:
            
• **Personal Information**: Full name, email address, institutional affiliation, and profile details.
• **Manuscript Data**: Research papers, abstracts, cover letters, and supplementary files submitted for peer review.
• **Payment Information**: Transaction records processed through our secure payment partners. We do not store credit card numbers directly.
• **Usage Data**: Browser type, IP address, pages visited, and interaction patterns to improve our services.`
        },
        {
            title: 'How We Use Your Information',
            content: `We use the information we collect to:

• Operate, maintain, and improve the Nkiza Center platform.
• Process manuscript submissions, conduct peer reviews, and manage publication workflows.
• Facilitate book purchases, downloads, and author royalty payments.
• Send you updates about submission status, review decisions, and platform announcements.
• Respond to your inquiries and provide customer support.
• Analyze usage patterns to enhance user experience and platform performance.`
        },
        {
            title: 'Information Sharing',
            content: `We do not sell, trade, or rent your personal information. We may share information in the following circumstances:

• **Peer Review**: Manuscript details are shared with assigned reviewers under strict confidentiality agreements.
• **Publication**: Published works and associated author metadata are made publicly accessible as part of the scholarly record.
• **Service Providers**: We work with trusted third-party services (hosting, payment processing, analytics) who are contractually bound to protect your data.
• **Legal Requirements**: We may disclose information if required by law, court order, or to protect the rights and safety of our users and platform.`
        },
        {
            title: 'Data Security',
            content: `We implement industry-standard security measures to protect your data, including:

• Encryption of data in transit (TLS/SSL) and at rest.
• Secure authentication with hashed passwords.
• Regular security audits and vulnerability assessments.
• Role-based access controls limiting data access to authorized personnel only.

While we strive to protect your information, no method of electronic storage is 100% secure, and we cannot guarantee absolute security.`
        },
        {
            title: 'Your Rights',
            content: `You have the right to:

• **Access**: Request a copy of the personal data we hold about you.
• **Correction**: Update or correct inaccurate personal information.
• **Deletion**: Request deletion of your account and associated data, subject to legal retention requirements.
• **Portability**: Receive your data in a structured, machine-readable format.
• **Opt-out**: Unsubscribe from marketing communications at any time.

To exercise these rights, contact us at privacy@nkizacenter.com.`
        },
        {
            title: 'Cookies & Tracking',
            content: `We use cookies and similar technologies to maintain your session, remember preferences, and analyze site usage. You can manage cookie preferences through your browser settings. Disabling cookies may affect certain platform functionalities.`
        },
        {
            title: 'Changes to This Policy',
            content: `We may update this Privacy Policy from time to time. We will notify registered users of significant changes via email. The "Last updated" date at the top reflects the most recent revision.`
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <TopNav />

            {/* Hero */}
            <section className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
                        Legal
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Privacy Policy</h1>
                    <p className="text-slate-400 text-sm">Last updated: February 2026</p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-6 max-w-4xl mx-auto">
                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 leading-relaxed mb-10 text-lg">
                        At Nkiza Center, we are committed to protecting your privacy and ensuring the security of your personal information.
                        This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
                    </p>

                    {sections.map((section, i) => (
                        <div key={i} className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-extrabold">{i + 1}</span>
                                <h2 className="text-xl font-extrabold text-slate-900">{section.title}</h2>
                            </div>
                            <div className="pl-11 text-slate-600 leading-relaxed text-sm whitespace-pre-line"
                                dangerouslySetInnerHTML={{ __html: section.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Questions about our privacy practices?</h3>
                    <p className="text-sm text-slate-500">
                        Contact our Data Protection Officer at{' '}
                        <a href="mailto:privacy@nkizacenter.com" className="text-primary font-semibold hover:underline">
                            privacy@nkizacenter.com
                        </a>
                    </p>
                </div>
            </section>

            <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
                &copy; {new Date().getFullYear()} Nkiza Center. All rights reserved.
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
