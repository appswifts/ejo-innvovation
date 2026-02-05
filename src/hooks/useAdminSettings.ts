import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SystemSetting {
    id: string;
    key: string;
    value: any;
    description: string | null;
}

export const useAdminSettings = () => {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .order('key');

            if (error) throw error;
            setSettings(data || []);
        } catch (err: any) {
            console.error('Error fetching settings:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSetting = async (key: string, value: any) => {
        try {
            const { error } = await supabase
                .from('system_settings')
                .update({ value })
                .eq('key', key);

            if (error) throw error;
            await fetchSettings();
            return { success: true };
        } catch (err: any) {
            console.error('Error updating setting:', err);
            return { success: false, error: err.message };
        }
    };

    const getSettingValue = (key: string, defaultValue: any = null) => {
        const setting = settings.find(s => s.key === key);
        return setting ? setting.value : defaultValue;
    };

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        loading,
        error,
        fetchSettings,
        updateSetting,
        getSettingValue
    };
};
