import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pptlsxpqyxewdkvhgzli.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cf4Mc4Ku03LBtfAlhKQ7Fg_SDdHhNY7';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy-key-placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

/**
 * Upload an image file to Supabase Storage bucket 'room-photos'.
 * Returns the public URL of the uploaded image.
 */
export async function uploadRoomPhotoToSupabase(
  uri: string,
  fileName?: string
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase is not configured yet. Please provide your Supabase anon API key.',
    };
  }

  try {
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = fileName || `room_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `uploads/${cleanFileName}`;

    // Fetch the image as blob from local URI
    const response = await fetch(uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('room-photos')
      .upload(filePath, blob, {
        contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('room-photos')
      .getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to upload photo to Supabase storage.',
    };
  }
}
