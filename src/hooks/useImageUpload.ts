import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useImageUpload() {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = async (file: File, folder: string = 'uploads') => {
        setUploading(true);
        setError(null);

        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Please upload an image file');
            }

            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('public-assets')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage
                .from('public-assets')
                .getPublicUrl(filePath);

            return data.publicUrl;

        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || 'Error uploading image');
            return null;
        } finally {
            setUploading(false);
        }
    };

    return { uploadImage, uploading, error };
}
