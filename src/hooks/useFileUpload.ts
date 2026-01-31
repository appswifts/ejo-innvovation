import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '../types/database';

type FileType = Database['public']['Enums']['file_type'];

export function useFileUpload() {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = useCallback(async (
        file: File,
        submissionId: string,
        fileType: FileType,
        label?: string
    ) => {
        if (!user) {
            return { error: new Error('Not authenticated') };
        }

        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            // 1. Upload to Storage
            // Path format: userId/submissionId/timestamp-filename
            const timestamp = new Date().getTime();
            const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `${user.id}/${submissionId}/${timestamp}-${cleanFileName}`;

            const { data: storageData, error: storageError } = await supabase.storage
                .from('manuscripts')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (storageError) throw storageError;

            // 2. Create record in submission_files table
            const { data: fileRecord, error: dbError } = await supabase
                .from('submission_files')
                .insert({
                    submission_id: submissionId,
                    file_type: fileType,
                    file_name: file.name,
                    file_path: filePath,
                    file_size: file.size,
                    mime_type: file.type,
                    label: label || file.name,
                    uploaded_by: user.id
                })
                .select()
                .single();

            if (dbError) {
                // Cleanup storage if DB insert fails
                await supabase.storage.from('manuscripts').remove([filePath]);
                throw dbError;
            }

            setUploading(false);
            setProgress(100);
            return { data: fileRecord };

        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message);
            setUploading(false);
            return { error: err };
        }
    }, [user]);

    const getPublicUrl = (filePath: string) => {
        const { data } = supabase.storage.from('manuscripts').getPublicUrl(filePath);
        return data.publicUrl;
    };

    // Note: Since bucket is private, we should use createSignedUrl for download links
    const getDownloadUrl = async (filePath: string) => {
        const { data, error } = await supabase.storage
            .from('manuscripts')
            .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (error) return { error };
        return { data };
    };

    return {
        uploadFile,
        uploading,
        progress,
        error,
        getDownloadUrl
    };
}
