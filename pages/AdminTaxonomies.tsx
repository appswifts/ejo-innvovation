import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Plus, Tag, Edit, Trash2, X, FolderTree, ChevronRight, ChevronDown } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface Taxonomy {
    id: string;
    key: string;
    label: string;
    description: string | null;
    is_hierarchical: boolean;
    is_multiple: boolean;
    is_active: boolean;
    terms?: Term[];
}

interface Term {
    id: string;
    taxonomy_id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    parent_id: string | null;
    display_order: number;
    is_active: boolean;
    children?: Term[];
}

const AdminTaxonomies: React.FC = () => {
    const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTaxonomy, setSelectedTaxonomy] = useState<Taxonomy | null>(null);
    const [terms, setTerms] = useState<Term[]>([]);
    const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

    const [isTaxonomyModalOpen, setIsTaxonomyModalOpen] = useState(false);
    const [isTermModalOpen, setIsTermModalOpen] = useState(false);
    const [editingTaxonomy, setEditingTaxonomy] = useState<Taxonomy | null>(null);
    const [editingTerm, setEditingTerm] = useState<Term | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Taxonomy form
    const [taxonomyForm, setTaxonomyForm] = useState({
        key: '',
        label: '',
        description: '',
        is_hierarchical: false,
        is_multiple: true
    });

    // Term form
    const [termForm, setTermForm] = useState({
        name: '',
        slug: '',
        description: '',
        icon: '',
        color: '#3B82F6',
        parent_id: ''
    });

    // Fetch taxonomies
    const fetchTaxonomies = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('taxonomies')
                .select('*')
                .order('label');

            if (error) throw error;
            setTaxonomies(data || []);
        } catch (err) {
            console.error('Error fetching taxonomies:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch terms for selected taxonomy
    const fetchTerms = useCallback(async () => {
        if (!selectedTaxonomy) {
            setTerms([]);
            return;
        }
        try {
            const { data, error } = await supabase
                .from('terms')
                .select('*')
                .eq('taxonomy_id', selectedTaxonomy.id)
                .order('display_order');

            if (error) throw error;
            setTerms(data || []);
        } catch (err) {
            console.error('Error fetching terms:', err);
        }
    }, [selectedTaxonomy]);

    useEffect(() => {
        fetchTaxonomies();
    }, [fetchTaxonomies]);

    useEffect(() => {
        fetchTerms();
    }, [fetchTerms]);

    // Build term tree for hierarchical display
    const buildTermTree = (terms: Term[]): Term[] => {
        const termMap = new Map<string, Term>();
        terms.forEach(t => termMap.set(t.id, { ...t, children: [] }));

        const rootTerms: Term[] = [];
        termMap.forEach(term => {
            if (term.parent_id && termMap.has(term.parent_id)) {
                termMap.get(term.parent_id)!.children!.push(term);
            } else {
                rootTerms.push(term);
            }
        });

        return rootTerms;
    };

    const termTree = buildTermTree(terms);

    // Taxonomy CRUD
    const handleSaveTaxonomy = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionLoading(true);

        try {
            if (editingTaxonomy) {
                const { error } = await supabase
                    .from('taxonomies')
                    .update(taxonomyForm)
                    .eq('id', editingTaxonomy.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('taxonomies')
                    .insert({ ...taxonomyForm, is_active: true });
                if (error) throw error;
            }

            await fetchTaxonomies();
            setIsTaxonomyModalOpen(false);
            resetTaxonomyForm();
        } catch (err: any) {
            alert('Failed: ' + err.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteTaxonomy = async (tax: Taxonomy) => {
        if (!confirm(`Delete taxonomy "${tax.label}"? This will also delete all its terms.`)) return;

        try {
            const { error } = await supabase.from('taxonomies').delete().eq('id', tax.id);
            if (error) throw error;
            await fetchTaxonomies();
            if (selectedTaxonomy?.id === tax.id) setSelectedTaxonomy(null);
        } catch (err: any) {
            alert('Failed: ' + err.message);
        }
    };

    const resetTaxonomyForm = () => {
        setTaxonomyForm({ key: '', label: '', description: '', is_hierarchical: false, is_multiple: true });
        setEditingTaxonomy(null);
    };

    // Term CRUD
    const handleSaveTerm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTaxonomy) return;
        setIsActionLoading(true);

        try {
            const termData = {
                taxonomy_id: selectedTaxonomy.id,
                name: termForm.name,
                slug: termForm.slug || termForm.name.toLowerCase().replace(/\s+/g, '-'),
                description: termForm.description || null,
                icon: termForm.icon || null,
                color: termForm.color || null,
                parent_id: termForm.parent_id || null,
                display_order: editingTerm?.display_order ?? terms.length,
                is_active: true
            };

            if (editingTerm) {
                const { taxonomy_id, display_order, is_active, ...update } = termData;
                const { error } = await supabase.from('terms').update(update).eq('id', editingTerm.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('terms').insert(termData);
                if (error) throw error;
            }

            await fetchTerms();
            setIsTermModalOpen(false);
            resetTermForm();
        } catch (err: any) {
            alert('Failed: ' + err.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteTerm = async (term: Term) => {
        if (!confirm(`Delete term "${term.name}"?`)) return;

        try {
            const { error } = await supabase.from('terms').delete().eq('id', term.id);
            if (error) throw error;
            await fetchTerms();
        } catch (err: any) {
            alert('Failed: ' + err.message);
        }
    };

    const resetTermForm = () => {
        setTermForm({ name: '', slug: '', description: '', icon: '', color: '#3B82F6', parent_id: '' });
        setEditingTerm(null);
    };

    const toggleTermExpand = (termId: string) => {
        setExpandedTerms(prev => {
            const next = new Set(prev);
            if (next.has(termId)) next.delete(termId);
            else next.add(termId);
            return next;
        });
    };

    const renderTermRow = (term: Term, depth: number = 0): React.ReactNode => {
        const hasChildren = term.children && term.children.length > 0;
        const isExpanded = expandedTerms.has(term.id);

        return (
            <React.Fragment key={term.id}>
                <div
                    className={`flex items-center gap-3 p-3 border-b border-border hover:bg-secondary/30 transition-colors`}
                    style={{ paddingLeft: `${12 + depth * 24}px` }}
                >
                    {hasChildren ? (
                        <button onClick={() => toggleTermExpand(term.id)} className="p-0.5 hover:bg-secondary rounded">
                            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        </button>
                    ) : <div className="w-5" />}

                    {term.color && (
                        <div className="size-4 rounded-full" style={{ backgroundColor: term.color }} />
                    )}

                    <span className="font-medium flex-1">{term.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{term.slug}</span>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => {
                                setEditingTerm(term);
                                setTermForm({
                                    name: term.name,
                                    slug: term.slug,
                                    description: term.description || '',
                                    icon: term.icon || '',
                                    color: term.color || '#3B82F6',
                                    parent_id: term.parent_id || ''
                                });
                                setIsTermModalOpen(true);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md"
                        >
                            <Edit className="size-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteTerm(term)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                </div>
                {hasChildren && isExpanded && term.children!.map(child => renderTermRow(child, depth + 1))}
            </React.Fragment>
        );
    };

    return (
        <DashboardLayout variant="admin">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Taxonomies</h1>
                        <p className="text-muted-foreground mt-1">Manage categories, tags, and other classification systems.</p>
                    </div>
                    <button
                        onClick={() => { resetTaxonomyForm(); setIsTaxonomyModalOpen(true); }}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary/90 transition"
                    >
                        <Plus className="size-5" />
                        <span>Add Taxonomy</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Taxonomy List */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-border bg-secondary/50">
                            <h2 className="font-bold text-lg">All Taxonomies</h2>
                        </div>
                        {loading ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-secondary animate-pulse rounded-lg" />)}
                            </div>
                        ) : taxonomies.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <FolderTree className="size-10 mx-auto mb-3 opacity-50" />
                                <p>No taxonomies yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {taxonomies.map(tax => (
                                    <div
                                        key={tax.id}
                                        onClick={() => setSelectedTaxonomy(tax)}
                                        className={`p-4 cursor-pointer hover:bg-secondary/30 transition-colors flex items-center justify-between ${selectedTaxonomy?.id === tax.id ? 'bg-primary/10 border-l-4 border-primary' : ''}`}
                                    >
                                        <div>
                                            <div className="font-medium">{tax.label}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{tax.key}</div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingTaxonomy(tax);
                                                    setTaxonomyForm({
                                                        key: tax.key,
                                                        label: tax.label,
                                                        description: tax.description || '',
                                                        is_hierarchical: tax.is_hierarchical,
                                                        is_multiple: tax.is_multiple
                                                    });
                                                    setIsTaxonomyModalOpen(true);
                                                }}
                                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md"
                                            >
                                                <Edit className="size-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteTaxonomy(tax); }}
                                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Terms Panel */}
                    <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
                        {selectedTaxonomy ? (
                            <>
                                <div className="p-4 border-b border-border bg-secondary/50 flex items-center justify-between">
                                    <div>
                                        <h2 className="font-bold text-lg">{selectedTaxonomy.label} Terms</h2>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedTaxonomy.is_hierarchical ? 'Hierarchical' : 'Flat'} • {selectedTaxonomy.is_multiple ? 'Multi-select' : 'Single-select'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { resetTermForm(); setIsTermModalOpen(true); }}
                                        className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition"
                                    >
                                        <Plus className="size-4" /> Add Term
                                    </button>
                                </div>
                                {terms.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <Tag className="size-10 mx-auto mb-3 opacity-50" />
                                        <p>No terms in this taxonomy</p>
                                        <button
                                            onClick={() => { resetTermForm(); setIsTermModalOpen(true); }}
                                            className="mt-3 text-primary hover:underline font-medium"
                                        >
                                            Add the first term
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {termTree.map(term => renderTermRow(term))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-12 text-center text-muted-foreground">
                                <Tag className="size-12 mx-auto mb-4 opacity-50" />
                                <h3 className="font-bold text-lg text-foreground mb-1">Select a Taxonomy</h3>
                                <p>Click on a taxonomy to view and manage its terms</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Taxonomy Modal */}
            {isTaxonomyModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl shadow-xl w-full max-w-md border border-border">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-bold">{editingTaxonomy ? 'Edit' : 'Create'} Taxonomy</h2>
                            <button onClick={() => { setIsTaxonomyModalOpen(false); resetTaxonomyForm(); }} className="p-2 hover:bg-secondary rounded-full">
                                <X className="size-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTaxonomy} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Label <span className="text-destructive">*</span></label>
                                <input
                                    type="text" required
                                    value={taxonomyForm.label}
                                    onChange={(e) => setTaxonomyForm({ ...taxonomyForm, label: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="e.g. Categories"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Key <span className="text-destructive">*</span></label>
                                <input
                                    type="text" required
                                    value={taxonomyForm.key}
                                    onChange={(e) => setTaxonomyForm({ ...taxonomyForm, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                                    placeholder="e.g. categories"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    rows={2}
                                    value={taxonomyForm.description}
                                    onChange={(e) => setTaxonomyForm({ ...taxonomyForm, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={taxonomyForm.is_hierarchical} onChange={(e) => setTaxonomyForm({ ...taxonomyForm, is_hierarchical: e.target.checked })} className="rounded border-border" />
                                    <span className="text-sm">Hierarchical (parent/child)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={taxonomyForm.is_multiple} onChange={(e) => setTaxonomyForm({ ...taxonomyForm, is_multiple: e.target.checked })} className="rounded border-border" />
                                    <span className="text-sm">Allow multiple</span>
                                </label>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => { setIsTaxonomyModalOpen(false); resetTaxonomyForm(); }} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-secondary">Cancel</button>
                                <button type="submit" disabled={isActionLoading} className="px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                                    {isActionLoading && <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />}
                                    {editingTaxonomy ? 'Save Changes' : 'Create Taxonomy'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Term Modal */}
            {isTermModalOpen && selectedTaxonomy && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl shadow-xl w-full max-w-md border border-border">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-bold">{editingTerm ? 'Edit' : 'Add'} Term</h2>
                            <button onClick={() => { setIsTermModalOpen(false); resetTermForm(); }} className="p-2 hover:bg-secondary rounded-full">
                                <X className="size-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTerm} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
                                <input
                                    type="text" required
                                    value={termForm.name}
                                    onChange={(e) => setTermForm({ ...termForm, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="e.g. Health Sciences"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Slug</label>
                                <input
                                    type="text"
                                    value={termForm.slug}
                                    onChange={(e) => setTermForm({ ...termForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                                    placeholder="Auto-generated from name"
                                />
                            </div>
                            {selectedTaxonomy.is_hierarchical && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Parent Term</label>
                                    <select
                                        value={termForm.parent_id}
                                        onChange={(e) => setTermForm({ ...termForm, parent_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="">None (Top Level)</option>
                                        {terms.filter(t => t.id !== editingTerm?.id).map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Color</label>
                                    <input
                                        type="color"
                                        value={termForm.color}
                                        onChange={(e) => setTermForm({ ...termForm, color: e.target.value })}
                                        className="w-full h-10 bg-background border border-border rounded-lg cursor-pointer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Icon</label>
                                    <input
                                        type="text"
                                        value={termForm.icon}
                                        onChange={(e) => setTermForm({ ...termForm, icon: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="emoji or class"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => { setIsTermModalOpen(false); resetTermForm(); }} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-secondary">Cancel</button>
                                <button type="submit" disabled={isActionLoading} className="px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                                    {isActionLoading && <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />}
                                    {editingTerm ? 'Save Changes' : 'Add Term'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminTaxonomies;
