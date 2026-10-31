import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { auth } from './firebase';

const rawUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
const rawKey = (
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  ''
).trim();

function isValidHttpUrl(stringUrl: string): boolean {
  try {
    const url = new URL(stringUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Supabase is considered configured only when both a valid HTTP/HTTPS URL
 * and a non-empty publishable/anon API key are provided via environment variables.
 */
export const isSupabaseConfigured: boolean = Boolean(
  rawUrl &&
  rawKey &&
  isValidHttpUrl(rawUrl) &&
  !rawUrl.includes('placeholder') &&
  !rawKey.includes('placeholder')
);

export const supabaseConfigError: string = isSupabaseConfigured
  ? ''
  : 'Supabase is not configured. Please supply valid EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.';

/**
 * Internal Supabase client instance configured to forward the active Firebase
 * ID token via the accessToken callback for third-party Firebase Authentication.
 */
const clientInstance: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      accessToken: async () => {
        try {
          const currentFbUser = auth?.currentUser;
          if (currentFbUser) {
            const token = await currentFbUser.getIdToken(false);
            return token || null;
          }
        } catch (err) {
          console.warn('[Supabase] Failed to obtain Firebase ID token for accessToken callback:', err);
        }
        return null;
      },
    })
  : null;

/**
 * Returns the configured Supabase client or throws a descriptive error.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    throw new Error(supabaseConfigError);
  }
  return clientInstance;
}

/**
 * Direct client export with safety proxy so calls like supabase.from(...)
 * produce a clear actionable error if environment variables are not set.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!clientInstance) {
      throw new Error(supabaseConfigError);
    }
    const val = (clientInstance as any)[prop];
    return typeof val === 'function' ? val.bind(clientInstance) : val;
  },
});

/**
 * Upload an image file to the private 'room-photos' bucket under the user-specific path:
 * {firebase_uid}/{project_id}/{unique_filename}
 *
 * Returns the storage path and a time-limited signed URL for private viewing.
 */
export async function uploadRoomPhotoToSupabase(
  uri: string,
  firebaseUid: string,
  projectId: string,
  fileName?: string
): Promise<{ success: boolean; storagePath?: string; signedUrl?: string; error?: string }> {
  if (!isSupabaseConfigured || !clientInstance) {
    return {
      success: false,
      error: supabaseConfigError,
    };
  }

  if (!firebaseUid || !projectId) {
    return {
      success: false,
      error: 'Authenticated Firebase user ID and Project ID are required for private storage upload.',
    };
  }

  try {
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt) ? fileExt : 'jpg';
    const uniqueName = fileName || `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;
    const storagePath = `${firebaseUid}/${projectId}/${uniqueName}`;

    // Read local URI as blob
    const response = await fetch(uri);
    const blob = await response.blob();

    const { error: uploadError } = await clientInstance.storage
      .from('room-photos')
      .upload(storagePath, blob, {
        contentType: `image/${cleanExt === 'png' ? 'png' : 'jpeg'}`,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Generate signed URL (valid for 1 hour) for private display in client
    const { data: signData, error: signError } = await clientInstance.storage
      .from('room-photos')
      .createSignedUrl(storagePath, 3600);

    if (signError || !signData?.signedUrl) {
      throw signError || new Error('Could not create signed URL for uploaded image');
    }

    return {
      success: true,
      storagePath,
      signedUrl: signData.signedUrl,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to upload photo to private Supabase storage.',
    };
  }
}

/**
 * Generate a fresh time-limited signed URL for displaying a private room photo.
 */
export async function getSignedRoomPhotoUrl(
  storagePath: string,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  if (!isSupabaseConfigured || !clientInstance || !storagePath) {
    return null;
  }

  try {
    const { data, error } = await clientInstance.storage
      .from('room-photos')
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn('[Supabase] Failed to generate signed URL:', error?.message);
      return null;
    }

    return data.signedUrl;
  } catch (e: any) {
    console.warn('[Supabase] Exception generating signed URL:', e?.message);
    return null;
  }
}
