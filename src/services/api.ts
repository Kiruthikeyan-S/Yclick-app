import Constants from 'expo-constants';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
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
  // 1. Priority: Dynamically extract host IP from live Expo Metro connection
  // Ensures seamless connectivity on any Wi-Fi, mobile hotspot, or USB tethering
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8000`;
    }
  }

  // 2. Fallback to environment variable if explicitly configured
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl && !envUrl.includes('placeholder') && !envUrl.includes('192.168.88.8')) {
    return envUrl;
  }

  // 3. Default active subnet fallback
  return 'http://10.126.188.36:8000';
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
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for AI response

  try {
    const bearer = idToken || 'guest-token';
    const res = await fetch(`${API_BASE_URL}/api/designs/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({ messages, roomContext }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { success: true, reply: data.reply };
    }
    const errText = await res.text();
    let detail = `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.detail) detail = parsed.detail;
    } catch {}
    return { 
      success: false, 
      reply: '', 
      error: detail 
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
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s for Vision AI

  try {
    const bearer = idToken || 'guest-token';
    let bodyPayload: { imageBase64?: string; photoUri?: string; filename?: string } = {};

    if (photoUri.startsWith('http://') || photoUri.startsWith('https://')) {
      // Remote URI: send URL for backend download
      bodyPayload = { photoUri, filename: 'space.jpg' };
    } else {
      // Local image (file:// or content://): read as base64 - completely immune to FormData bugs
      const base64Data = await readAsStringAsync(photoUri, {
        encoding: EncodingType.Base64,
      });
      bodyPayload = { imageBase64: base64Data, filename: 'space.jpg' };
    }

    const res = await fetch(`${API_BASE_URL}/api/designs/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      let errorMsg = `Analyze error: HTTP ${res.status}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.detail) errorMsg = parsed.detail;
      } catch {
        if (errText) errorMsg = errText;
      }
      return { success: false, error: errorMsg };
    }

    const data: RoomAnalysisData = await res.json();
    return { success: true, data };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return { 
      success: false, 
      error: err.name === 'AbortError' 
        ? 'AI room scan timed out. Please try again.' 
        : err.message || 'Analysis failed' 
    };
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
