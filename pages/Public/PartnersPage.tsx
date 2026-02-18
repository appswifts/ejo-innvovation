import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import TopNav from '../../components/TopNav';
import Footer from '../../components/Footer';

interface Partner {
    id: string;
    name: string;
    logo_url: string | null;
    description: string | null;
    is_active: boolean;
}

const PartnersPage: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const { data, error } = await supabase
                .from('partners')
                .select('*')
                .eq('is_active', true)
                .order('name', { ascending: true });

            if (error) throw error;
            setPartners(data || []);
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <TopNav />

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white py-20">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
                        Collaboration
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Our Partners</h1>
                    <p className="text-lg text-blue-100 max-w-xl mx-auto">
                        We collaborate with leading institutions, organizations, and innovators to advance research and knowledge globally.
                    </p>
                </div>
            </section>

            {/* Partners Grid */}
            <section className="py-20 px-6 max-w-6xl mx-auto">
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-slate-50 rounded-2xl p-8 animate-pulse h-[250px] border border-slate-200"></div>
                        ))}
                    </div>
                ) : partners.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">handshake</span>
                        <h3 className="text-xl font-bold text-slate-400">Partners Coming Soon</h3>
                        <p className="text-slate-400 text-sm mt-2">We're building partnerships with leading organizations worldwide.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {partners.map(partner => (
                            <div
                                key={partner.id}
                                className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
                            >
                                {partner.logo_url ? (
                                    <img
                                        src={partner.logo_url}
                                        alt={partner.name}
                                        className="h-20 w-auto object-contain mb-6"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center mb-6">
                                        <span className="material-symbols-outlined text-primary text-3xl">handshake</span>
                                    </div>
                                )}
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{partner.name}</h3>
                                {partner.description && (
                                    <p className="text-sm text-slate-500 leading-relaxed">{partner.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
};

export default PartnersPage;
