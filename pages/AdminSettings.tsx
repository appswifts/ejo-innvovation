import React, { useEffect, useState } from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Save, Loader2, Globe, Mail, Shield } from 'lucide-react';
import { useAdminSettings } from '../src/hooks/useAdminSettings';

const AdminSettings: React.FC = () => {
    const { settings, loading, updateSetting, fetchSettings } = useAdminSettings();
    const [isSaving, setIsSaving] = useState(false);

    // Local state for form values
    const [formValues, setFormValues] = useState<Record<string, any>>({});

    useEffect(() => {
        if (settings.length > 0) {
            const initialValues: Record<string, any> = {};
            settings.forEach(s => {
                initialValues[s.key] = s.value;
            });
            setFormValues(initialValues);
        }
    }, [settings]);

    const handleSave = async (key: string) => {
        setIsSaving(true);
        await updateSetting(key, formValues[key]);
        setIsSaving(false);
    };

    const handleChange = (key: string, value: any) => {
        setFormValues(prev => ({ ...prev, [key]: value }));
    };

    /* Helper to render a setting input */
    const renderSettingInput = (label: string, key: string, description: string, type: 'text' | 'boolean' | 'textarea' = 'text') => {
        const value = formValues[key] ?? '';

        return (
            <div className="flex items-start justify-between p-4 border rounded-lg border-border hover:bg-secondary/20 transition-colors">
                <div className="flex-1 mr-4">
                    <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="flex items-center gap-2">
                    {type === 'boolean' ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={!!value}
                                onChange={(e) => handleChange(key, e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                    ) : type === 'textarea' ? (
                        <textarea
                            value={value}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="bg-background border border-border rounded-md px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/50 outline-none"
                            rows={3}
                        />
                    ) : (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="bg-background border border-border rounded-md px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                    )}
                    <button
                        onClick={() => handleSave(key)}
                        disabled={isSaving}
                        className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                        title="Save"
                    >
                        {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <DashboardLayout variant="admin">
                <div className="flex items-center justify-center h-full p-12">
                    <Loader2 className="size-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout variant="admin">
            <div className="max-w-4xl mx-auto p-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">System Settings</h1>
                <p className="text-muted-foreground mb-8">Manage global configuration for the platform.</p>

                <div className="space-y-8">
                    {/* General Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xl font-semibold border-b border-border pb-2">
                            <Globe className="size-5" /> General
                        </div>
                        {renderSettingInput('Site Name', 'site_name', 'The name of the platform displayed in the header and emails.', 'text')}
                        {renderSettingInput('Maintenance Mode', 'maintenance_mode', 'Put the site in maintenance mode. Only admins can access.', 'boolean')}
                    </div>

                    {/* Email Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xl font-semibold border-b border-border pb-2">
                            <Mail className="size-5" /> Email Logic
                        </div>
                        {renderSettingInput('Support Email', 'support_email', 'The email address where support inquiries are sent.', 'text')}
                    </div>

                    {/* Security Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xl font-semibold border-b border-border pb-2">
                            <Shield className="size-5" /> Security
                        </div>
                        {renderSettingInput('Allow Public Registration', 'allow_registration', 'If disabled, only admins can create new users.', 'boolean')}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminSettings;
