import Constants from 'expo-constants';
import { 
  DesignPreferences, 
  DesignProject, 
  DesignVariant, 
  ImprovementSuggestion, 
  ProductRecommendation, 
  RoomAnalysisData 
} from '../types';

export { RoomAnalysisData };

/**
 * Determine dynamic API Base URL:
 * On physical devices connected via Expo Go, dynamically extracts the development machine's
 * local Wi-Fi IP from Metro hostUri so backend requests never fail with loopback timeouts.
 */
function resolveApiBaseUrl(): string {
  // 1. If explicit environment variable is set
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl && !envUrl.includes('placeholder')) {
    return envUrl;
  }

  // 2. Extract host from Expo Metro connection
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8000`;
  }

  // 3. Fallback to active Wi-Fi subnet
  return 'http://192.168.88.3:8000';
}

export const API_BASE_URL = resolveApiBaseUrl();

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isDemo?: boolean;
}

export interface ChatMessageParam {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function askDesignerChat(
  messages: ChatMessageParam[], 
  roomContext: string = '',
  idToken?: string
): Promise<{ success: boolean; reply: string; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const res = await fetch(`${API_BASE_URL}/api/designs/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({ messages, roomContext }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { success: true, reply: data.reply };
    }
    return { 
      success: false, 
      reply: '', 
      error: `HTTP ${res.status}` 
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return { 
      success: false, 
      reply: '', 
      error: err.name === 'AbortError' ? 'Chat request timed out' : err.message 
    };
  }
}

export async function checkBackendHealth(): Promise<{ status: string; isLive: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return { status: data.status || 'ok', isLive: true };
    }
    return { status: 'unhealthy', isLive: false, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { status: 'offline', isLive: false, error: err.message || 'Cannot connect to backend' };
  }
}

export async function analyzeImage(photoUri: string, idToken?: string): Promise<ApiResponse<RoomAnalysisData>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s for vision AI

  try {
    const formData = new FormData();
    const filename = photoUri.split('/').pop() || 'photo.jpg';
    
    // @ts-ignore React Native FormData
    formData.append('file', {
      uri: photoUri,
      name: filename,
      type: 'image/jpeg',
    });

    const res = await fetch(`${API_BASE_URL}/api/designs/analyze`, {
      method: 'POST',
      headers: {
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Analyze error: ${res.status} - ${err}`);
    }

    const data: RoomAnalysisData = await res.json();
    return { success: true, data };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return { success: false, error: err.message };
  }
}

export async function requestDesignGeneration(
  preferences: DesignPreferences,
  userId: string,
  idToken?: string
): Promise<ApiResponse<{ projectId: string; variants: DesignVariant[]; suggestions: ImprovementSuggestion[]; products: ProductRecommendation[]; isDemo?: boolean }>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for image-to-image synthesis

  try {
    const res = await fetch(`${API_BASE_URL}/api/designs/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({
        userId,
        preferences,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Generation failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return { success: false, error: err.message };
  }
}
