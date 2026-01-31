import React from 'react';
import { User, Lock, Bell, Globe, Save } from 'lucide-react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { useAuth } from '../src/hooks';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = React.useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'language', label: 'Language', icon: Globe },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-[1000px] mx-auto p-6 md:p-8 lg:p-10 flex flex-col gap-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your profile, preferences, and security settings.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Nav (Local) */}
                    <nav className="flex flex-col gap-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm text-left transition-colors ${activeTab === tab.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Icon className="size-4" /> {tab.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Content Area */}
                    <div className="md:col-span-3 space-y-6">

                        {activeTab === 'profile' && (
                            <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
                                <div className="flex items-center gap-4 pb-6 border-b border-border">
                                    <div className="size-16 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-secondary-foreground border-2 border-background ring-2 ring-border">
                                        {user?.email?.[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Profile Picture</h2>
                                        <p className="text-sm text-muted-foreground">Upload a professional photo for your researcher profile.</p>
                                    </div>
                                    <div className="flex-1"></div>
                                    <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors">Change</button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <input
                                            type="text"
                                            defaultValue={user?.user_metadata?.full_name || ''}
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <input
                                            type="email"
                                            defaultValue={user?.email || ''}
                                            disabled
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-muted-foreground cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-sm font-medium">Affiliation / Institution</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. University of Science & Technology"
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-sm font-medium">Bio</label>
                                        <textarea
                                            rows={4}
                                            placeholder="Tell us a bit about your research interests..."
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                        <Save className="size-4" /> Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold">Email Preferences</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="size-4 text-primary rounded border-border focus:ring-primary/50" />
                                        <span className="text-sm">Receive email notifications for submission updates</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="size-4 text-primary rounded border-border focus:ring-primary/50" />
                                        <span className="text-sm">Receive weekly research digest</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold">Security Settings</h3>
                                <p className="text-sm text-muted-foreground">Manage your password and security keys.</p>
                                <div className="pt-4">
                                    <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors">Change Password</button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'language' && (
                            <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold">Language & Region</h3>
                                <div className="space-y-2 max-w-xs">
                                    <label className="text-sm font-medium">Interface Language</label>
                                    <select className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                                        <option>English (US)</option>
                                        <option>French (FR)</option>
                                        <option>Swahili</option>
                                    </select>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
