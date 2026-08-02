
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Editor, JournalEditor, Journal, UserProfile } from '../../../types';
import Modal from '../../../components/Modal';

const JOURNAL_ROLES = [
    { value: 'editor_in_chief', label: 'Editor-in-Chief' },
    { value: 'handling_editor', label: 'Handling Editor' },
    { value: 'board_member', label: 'Editorial Board Member' },
];

interface EditorForm {
    mode: 'existing' | 'new';
    user_id: string;
    full_name: string;
    email: string;
    title: string;
    bio: string;
    is_active: boolean;
    journal_role: string;
}

const emptyForm = (): EditorForm => ({
    mode: 'existing',
    user_id: '',
    full_name: '',
    email: '',
    title: '',
    bio: '',
    is_active: true,
    journal_role: 'handling_editor',
});

const EditorManagement: React.FC = () => {
    const [editors, setEditors] = useState<Editor[]>([]);
    const [links, setLinks] = useState<JournalEditor[]>([]);
    const [journals, setJournals] = useState<Journal[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Editor | null>(null);
    const [form, setForm] = useState<EditorForm>(emptyForm());
    const [selectedJournals, setSelectedJournals] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [editorsRes, linksRes, journalsRes, usersRes] = await Promise.all([
            supabase.from('editors').select('*').order('full_name'),
            supabase.from('journal_editors').select('*'),
            supabase.from('journals').select('id, title').order('title'),
            supabase.from('profiles').select('id, full_name, email').order('full_name'),
        ]);
        if (editorsRes.data) setEditors(editorsRes.data as Editor[]);
        if (linksRes.data) setLinks(linksRes.data as JournalEditor[]);
        if (journalsRes.data) setJournals(journalsRes.data as Journal[]);
        if (usersRes.data) setUsers(usersRes.data as UserProfile[]);
        setLoading(false);
    };

    const availableUsers = users.filter(u => !editors.some(e => e.user_id === u.id));

    const editorJournals = (editorId: string) => {
        const editorLinkIds = links.filter(l => l.editor_id === editorId).map(l => l.journal_id);
        return journals.filter(j => editorLinkIds.includes(j.id));
    };

    const openAddModal = () => {
        setEditing(null);
        setForm(emptyForm());
        setSelectedJournals([]);
        setIsModalOpen(true);
    };

    const openEditModal = (editor: Editor) => {
        setEditing(editor);
        setForm({
            mode: 'existing',
            user_id: editor.user_id,
            full_name: editor.full_name,
            email: editor.email,
            title: editor.title || '',
            bio: editor.bio || '',
            is_active: editor.is_active,
            journal_role: links.find(l => l.editor_id === editor.id)?.role || 'handling_editor',
        });
        setSelectedJournals(links.filter(l => l.editor_id === editor.id).map(l => l.journal_id));
        setIsModalOpen(true);
    };

    const replaceJournalLinks = async (editorId: string) => {
        const { error: delError } = await supabase
            .from('journal_editors')
            .delete()
            .eq('editor_id', editorId);
        if (delError) throw delError;
        if (selectedJournals.length === 0) return;
        const rows = selectedJournals.map(journal_id => ({
            journal_id,
            editor_id: editorId,
            role: form.journal_role,
        }));
        const { error: insError } = await supabase.from('journal_editors').insert(rows);
        if (insError) throw insError;
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            if (editing) {
                const { error } = await supabase
                    .from('editors')
                    .update({
                        full_name: form.full_name.trim(),
                        email: form.email.trim().toLowerCase(),
                        title: form.title.trim() || null,
                        bio: form.bio.trim() || null,
                        is_active: form.is_active,
                    })
                    .eq('id', editing.id);
                if (error) throw error;
                await replaceJournalLinks(editing.id);
                alert('Editor updated successfully.');
            } else if (form.mode === 'existing') {
                if (!form.user_id) throw new Error('Please select a user.');
                const selectedUser = users.find(u => u.id === form.user_id);
                if (!selectedUser) throw new Error('Selected user not found.');
                const { data: editorRow, error } = await supabase
                    .from('editors')
                    .insert({
                        user_id: form.user_id,
                        full_name: selectedUser.full_name || form.full_name.trim(),
                        email: selectedUser.email,
                        title: form.title.trim() || null,
                        bio: form.bio.trim() || null,
                    })
                    .select('*')
                    .single();
                if (error) throw error;
                await replaceJournalLinks(editorRow.id);
                const { data: editorRole } = await supabase
                    .from('roles')
                    .select('id')
                    .eq('slug', 'editor')
                    .single();
                if (editorRole?.id) {
                    await supabase
                        .from('profiles')
                        .update({ role_id: editorRole.id })
                        .eq('id', form.user_id);
                }
                alert('Editor added successfully.');
            } else {
                const { error } = await supabase.functions.invoke('admin-create-editor', {
                    body: {
                        full_name: form.full_name.trim(),
                        email: form.email.trim().toLowerCase(),
                        title: form.title.trim() || null,
                        bio: form.bio.trim() || null,
                        journal_ids: selectedJournals,
                        role: form.journal_role,
                    },
                });
                if (error) throw error;
                alert('Editor created. The user has been invited by email.');
            }
            setIsModalOpen(false);
            await fetchData();
        } catch (error: any) {
            console.error('Error saving editor:', error);
            alert('Error saving editor: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (editor: Editor) => {
        if (!window.confirm(`Are you sure you want to remove editor "${editor.full_name || 'Unnamed'}"? This action cannot be undone.`)) return;
        try {
            const { error } = await supabase.from('editors').delete().eq('id', editor.id);
            if (error) throw error;
            alert('Editor removed successfully.');
            await fetchData();
        } catch (error: any) {
            console.error('Error deleting editor:', error);
            alert('Error deleting editor: ' + error.message);
        }
    };

    const filteredEditors = editors.filter(e =>
        (e.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleJournal = (id: string) => {
        setSelectedJournals(prev =>
            prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]
        );
    };

    const inputClass = 'w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm';

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Editor Management</h1>
                    <p className="text-slate-500 mt-1">Manage journal editors, assign them to journals, and add new editors.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search editors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm w-64"
                        />
                    </div>
                    <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all text-slate-700">
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                    </button>
                    <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-all shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Add Editor
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Editor</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Title</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Journals</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEditors.map(editor => (
                                <tr key={editor.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm">
                                                {editor.full_name?.charAt(0) || 'E'}
                                            </div>
                                            <span className="font-medium text-slate-900">{editor.full_name || 'Unnamed Editor'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">{editor.email}</td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">{editor.title || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                                            {editorJournals(editor.id).length === 0 && (
                                                <span className="text-slate-400 text-xs italic">Not assigned</span>
                                            )}
                                            {editorJournals(editor.id).map(journal => (
                                                <span key={journal.id} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                                    {journal.title}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${editor.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {editor.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => openEditModal(editor)}
                                                className="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors text-sm font-medium"
                                                title="Edit Editor"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(editor)}
                                                className="flex items-center gap-1 text-slate-400 hover:text-red-600 transition-colors text-sm font-medium"
                                                title="Remove Editor"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredEditors.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                        {searchTerm ? 'No editors match your search.' : 'No editors yet. Click "Add Editor" to get started.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mt-4 text-right text-xs text-slate-400">
                {filteredEditors.length} editor{filteredEditors.length !== 1 ? 's' : ''} total
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editing ? 'Edit Editor' : 'Add Editor'}
                maxWidth="max-w-3xl"
            >
                <div className="space-y-5">
                    {!editing && (
                        <div>
                            <p className="text-sm font-bold text-slate-700 mb-2">Editor source</p>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="mode"
                                        checked={form.mode === 'existing'}
                                        onChange={() => setForm({ ...form, mode: 'existing' })}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm text-slate-600">Select existing user</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="mode"
                                        checked={form.mode === 'new'}
                                        onChange={() => setForm({ ...form, mode: 'new' })}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm text-slate-600">Create new user automatically</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {!editing && form.mode === 'existing' && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Select user</label>
                            <select
                                value={form.user_id}
                                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                                className={inputClass}
                            >
                                <option value="">-- Choose a user --</option>
                                {availableUsers.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.full_name || 'Unnamed'} — {u.email}
                                    </option>
                                ))}
                            </select>
                            {availableUsers.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">All system users are already editors. Use "Create new user" to add a new one.</p>
                            )}
                        </div>
                    )}

                    {(!editing && form.mode === 'new') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Full name</label>
                                <input
                                    type="text"
                                    value={form.full_name}
                                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                    placeholder="e.g. Dr. Jane Doe"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="editor@example.com"
                                    className={inputClass}
                                />
                                <p className="text-xs text-slate-400 mt-1">A user account will be created and an invite email sent.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Editorial title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Editor-in-Chief"
                                className={inputClass}
                            />
                        </div>
                        {editing && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                                <select
                                    value={form.is_active ? 'true' : 'false'}
                                    onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
                                    className={inputClass}
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Bio</label>
                        <textarea
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            placeholder="Short bio / affiliation (optional)"
                            rows={3}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Role in selected journals</label>
                        <select
                            value={form.journal_role}
                            onChange={(e) => setForm({ ...form, journal_role: e.target.value })}
                            className={inputClass}
                        >
                            {JOURNAL_ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Assigned journals ({selectedJournals.length} selected)
                        </label>
                        <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-1">
                            {journals.length === 0 && (
                                <p className="text-xs text-slate-400 italic col-span-full">No journals available.</p>
                            )}
                            {journals.map(journal => (
                                <label key={journal.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedJournals.includes(journal.id)}
                                        onChange={() => toggleJournal(journal.id)}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm text-slate-700">{journal.title}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={submitting}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-50"
                        >
                            {submitting && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            )}
                            {editing ? 'Save Changes' : 'Add Editor'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EditorManagement;
