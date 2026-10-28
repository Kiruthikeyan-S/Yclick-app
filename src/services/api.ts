import { DesignPreferences, DesignProject, DesignVariant, ImprovementSuggestion, ProductRecommendation } from '../types';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'; // 10.0.2.2 is Android emulator host loopback, or use local IP

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isDemo?: boolean;
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

export async function analyzeImage(photoUri: string, idToken?: string): Promise<ApiResponse<{ roomType: string; features: string[] }>> {
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
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Analyze error: ${res.status} - ${err}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function requestDesignGeneration(
  preferences: DesignPreferences,
  userId: string,
  idToken?: string
): Promise<ApiResponse<{ projectId: string; variants: DesignVariant[]; suggestions: ImprovementSuggestion[]; products: ProductRecommendation[]; isDemo?: boolean }>> {
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
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Generation failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
