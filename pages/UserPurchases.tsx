import React, { useEffect, useState } from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { usePayment } from '../src/hooks';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

const UserPurchases: React.FC = () => {
    const { purchases, loading, fetchPurchases } = usePayment();
    const [purchasedItems, setPurchasedItems] = useState<any[]>([]);

    useEffect(() => {
        // Fetch details for purchased items
        const fetchDetails = async () => {
            if (purchases.length === 0) return;

            const ids = purchases.map(p => p.submission_id);
            const { data } = await supabase
                .from('submissions')
                .select('*')
                .in('id', ids);

            setPurchasedItems(data || []);
        };

        if (purchases.length > 0) {
            fetchDetails();
        }
    }, [purchases]);

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <BookOpen className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Library</h1>
                        <p className="text-muted-foreground">Access your purchased content anytime.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-card rounded-xl border border-border animate-pulse" />
                        ))}
                    </div>
                ) : purchasedItems.length === 0 ? (
                    <div className="bg-card rounded-xl border border-border p-12 text-center">
                        <div className="size-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">No purchases yet</h3>
                        <p className="text-muted-foreground mb-6">Content you purchase will appear here.</p>
                        <Link to="/" className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                            Browse Content
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {purchasedItems.map((item) => (
                            <div key={item.id} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all group">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                                            Owned
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="size-3" />
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{item.abstract || 'No description available.'}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <Link
                                        to={`/submissions/${item.id}`} // Assuming generic route for now
                                        className="inline-flex items-center justify-center px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-medium transition-colors gap-2"
                                    >
                                        Read Now
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserPurchases;
