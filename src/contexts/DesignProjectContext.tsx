import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  DesignProject, 
  DesignPreferences, 
  GenerationStatus, 
  SpaceCategoryId, 
  DesignVariant, 
  ImprovementSuggestion, 
  ProductRecommendation,
  ThreeDSceneSettings,
} from '../types';
import { 
  supabase, 
  isSupabaseConfigured, 
  uploadRoomPhotoToSupabase, 
  getSignedRoomPhotoUrl 
} from '../services/supabase';
import { requestDesignGeneration } from '../services/api';
import { useAuth } from './AuthContext';
import { auth } from '../services/firebase';

interface DesignProjectContextType {
  preferences: DesignPreferences;
  currentProject: DesignProject | null;
  savedProjects: DesignProject[];
  status: GenerationStatus;
  errorMessage: string | null;
  isDemoGeneration: boolean;
  setCategory: (categoryId: SpaceCategoryId, subcategoryId: string) => void;
  setPhotoUri: (uri: string) => void;
  updatePreferences: (updates: Partial<DesignPreferences>) => void;
  setConsent: (consent: boolean) => void;
  startGeneration: () => Promise<boolean>;
  resetWorkflow: () => void;
  selectVariant: (variantId: string) => Promise<boolean>;
  updateSceneSettings: (settings: Partial<ThreeDSceneSettings>) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  loadProjectById: (projectId: string) => DesignProject | undefined;
  refreshProjects: () => Promise<void>;
}

const DesignProjectContext = createContext<DesignProjectContextType | undefined>(undefined);

export const DEFAULT_PREFERENCES: DesignPreferences = {
  categoryId: 'home-rooms',
  subcategoryId: 'living-room',
  photoUri: '',
  consentGiven: false,
  budgetChoice: 'Not sure yet',
  style: 'Modern',
  itemsToKeep: ['Flooring', 'Doors and windows'],
  improvementGoals: ['Enhance lighting', 'Optimize layout'],
  constraints: [],
  additionalNotes: '',
};

export const DEFAULT_SCENE_SETTINGS: ThreeDSceneSettings = {
  wallColor: '#F5F5DC',
  floorType: 'wood',
  lightingPreset: 'daylight',
  cameraPreset: 'perspective',
  furnitureVisible: {
    seating: true,
    tables: true,
    storage: true,
    plants: true,
    lighting: true,
  },
};

export const DesignProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, claimsReady } = useAuth();
  const [preferences, setPreferences] = useState<DesignPreferences>(DEFAULT_PREFERENCES);
  const [currentProject, setCurrentProject] = useState<DesignProject | null>(null);
  const [savedProjects, setSavedProjects] = useState<DesignProject[]>([]);
  const [status, setStatus] = useState<GenerationStatus>('draft');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDemoGeneration, setIsDemoGeneration] = useState(false);

  // Track active fetch to prevent stale async race conditions (Problem 5)
  const activeFetchUid = useRef<string | null>(null);
  const previousUserUid = useRef<string | null>(null);

  // Clear state immediately when user switches or logs out (Problem 5)
  useEffect(() => {
    const currentUid = user?.uid || null;
    if (previousUserUid.current !== currentUid) {
      previousUserUid.current = currentUid;
      setSavedProjects([]);
      setCurrentProject(null);
      setPreferences(DEFAULT_PREFERENCES);
      setStatus('draft');
      setErrorMessage(null);
    }
  }, [user?.uid]);

  // Load user's saved projects from Supabase database
  const loadSavedProjects = useCallback(async () => {
    if (!user?.uid || !isSupabaseConfigured) {
      setSavedProjects([]);
      setCurrentProject(null);
      return;
    }

    const requestUid = user.uid;
    activeFetchUid.current = requestUid;

    try {
      const { data, error } = await supabase
        .from('design_projects')
        .select('*')
        .eq('user_id', requestUid)
        .order('created_at', { ascending: false });

      // Check for stale response from previous user
      if (activeFetchUid.current !== requestUid) return;

      if (error) {
        console.warn('[DesignProject] Error fetching projects from Supabase:', error.message);
        return;
      }

      if (data && data.length > 0) {
        // Resolve private signed photo URLs for all projects
        const mapped: DesignProject[] = await Promise.all(
          data.map(async (row: any) => {
            let signedUri = '';
            if (row.original_photo_path) {
              const fetchedSigned = await getSignedRoomPhotoUrl(row.original_photo_path, 3600);
              signedUri = fetchedSigned || row.original_photo_path;
            }

            return {
              id: row.id,
              userId: row.user_id,
              title: row.title,
              originalPhotoPath: row.original_photo_path,
              originalPhotoUri: signedUri,
              status: row.status as GenerationStatus,
              preferences: row.preferences || DEFAULT_PREFERENCES,
              variants: row.variants || [],
              suggestions: row.suggestions || [],
              products: row.products || [],
              sceneSettings: row.scene_settings || DEFAULT_SCENE_SETTINGS,
              selectedVariantId: row.selected_variant_id,
              error: row.error,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            };
          })
        );

        if (activeFetchUid.current === requestUid) {
          setSavedProjects(mapped);
          if (mapped.length > 0) {
            setCurrentProject(prev => prev && prev.userId === requestUid ? prev : mapped[0]);
          } else {
            setCurrentProject(null);
          }
        }
      } else {
        if (activeFetchUid.current === requestUid) {
          setSavedProjects([]);
          setCurrentProject(null);
        }
      }
    } catch (err: any) {
      console.warn('[DesignProject] Exception loading projects:', err.message);
    }
  }, [user?.uid]);

  // Load projects after user is authenticated AND claims are ready (Problem 10)
  useEffect(() => {
    if (user?.uid && claimsReady) {
      loadSavedProjects();
    }
  }, [user?.uid, claimsReady, loadSavedProjects]);

  const setCategory = (catId: SpaceCategoryId, subId: string) => {
    setPreferences(prev => ({
      ...prev,
      categoryId: catId,
      subcategoryId: subId,
    }));
  };

  const setPhotoUri = (uri: string) => {
    setPreferences(prev => ({
      ...prev,
      photoUri: uri,
    }));
  };

  const updatePreferences = (updates: Partial<DesignPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const setConsent = (consent: boolean) => {
    setPreferences(prev => ({
      ...prev,
      consentGiven: consent,
    }));
  };

  const resetWorkflow = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setCurrentProject(null);
    setStatus('draft');
    setErrorMessage(null);
    setIsDemoGeneration(false);
  };

  const startGeneration = async (): Promise<boolean> => {
    if (!preferences.photoUri) {
      setErrorMessage('A photo of your space is required before designing.');
      setStatus('failed');
      return false;
    }
    if (!preferences.consentGiven) {
      setErrorMessage('Please confirm your consent to process the photo.');
      setStatus('failed');
      return false;
    }

    setStatus('generating');
    setErrorMessage(null);

    const projectId = `proj-${Date.now()}`;
    const effectiveUserId = user?.uid || 'guest-user';
    let storagePath = '';
    let effectivePhotoUrl = preferences.photoUri;

    try {
      // 1. Upload captured photo to Supabase private storage first (Problem 11)
      if (user?.uid && isSupabaseConfigured) {
        const uploadRes = await uploadRoomPhotoToSupabase(
          preferences.photoUri,
          user.uid,
          projectId
        );

        // Problem 11: Stop workflow if upload fails; do not send local mobile URI to remote backend
        if (!uploadRes.success || !uploadRes.storagePath) {
          const failureMsg = uploadRes.error || 'Failed to upload room photo to secure storage. Please check connection.';
          setErrorMessage(failureMsg);
          setStatus('failed');
          return false;
        }

        storagePath = uploadRes.storagePath;
        effectivePhotoUrl = uploadRes.signedUrl || preferences.photoUri;
      }

      // 2. Obtain fresh Firebase ID token for protected backend endpoint (Problem 1)
      const idToken = user ? await auth?.currentUser?.getIdToken(true) : undefined;

      // 3. Request generation from backend
      const res = await requestDesignGeneration(
        { ...preferences, photoUri: effectivePhotoUrl },
        effectiveUserId,
        idToken
      );

      if (!res.success || !res.data) {
        throw new Error(res.error || 'Design generation failed on the server.');
      }

      const variants = res.data.variants || [];
      const suggestions = res.data.suggestions || [];
      const products = res.data.products || [];
      const isDemo = Boolean(res.data.isDemo);

      if (variants.length === 0) {
        throw new Error('No design variants were returned by the AI provider.');
      }

      const newProject: DesignProject = {
        id: projectId,
        userId: effectiveUserId,
        title: `${preferences.style} ${preferences.subcategoryId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        originalPhotoUri: effectivePhotoUrl,
        originalPhotoPath: storagePath,
        status: 'completed',
        preferences,
        variants,
        suggestions,
        products,
        sceneSettings: DEFAULT_SCENE_SETTINGS,
        selectedVariantId: variants[0]?.id || 'var-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 4. Save completed project to Supabase database with error checking (Problem 4)
      if (user?.uid && isSupabaseConfigured) {
        const { error: insertError } = await supabase.from('design_projects').insert({
          id: newProject.id,
          user_id: user.uid,
          title: newProject.title,
          original_photo_path: storagePath || newProject.originalPhotoUri,
          status: 'completed',
          preferences: newProject.preferences,
          variants: newProject.variants,
          suggestions: newProject.suggestions,
          products: newProject.products,
          scene_settings: newProject.sceneSettings,
          selected_variant_id: newProject.selectedVariantId,
          created_at: newProject.createdAt,
          updated_at: newProject.updatedAt,
        });

        // Problem 4: Check error on insert
        if (insertError) {
          console.error('[DesignProject] Database insert failed:', insertError.message);
          setErrorMessage(`Saved locally, but database sync encountered an error: ${insertError.message}`);
        }
      }

      setCurrentProject(newProject);
      setSavedProjects(prev => [newProject, ...prev]);
      setIsDemoGeneration(isDemo);
      setStatus('completed');
      return true;
    } catch (err: any) {
      setStatus('failed');
      setErrorMessage(err.message || 'Design generation was interrupted.');
      return false;
    }
  };

  // Problem 4: Check error on update with state rollback on failure
  const selectVariant = async (variantId: string): Promise<boolean> => {
    if (!currentProject) return false;
    const prevVariantId = currentProject.selectedVariantId;

    // Optimistic update
    setCurrentProject(prev => prev ? { ...prev, selectedVariantId: variantId } : null);
    setSavedProjects(prev => 
      prev.map(p => p.id === currentProject.id ? { ...p, selectedVariantId: variantId } : p)
    );

    if (user?.uid && isSupabaseConfigured) {
      const { error } = await supabase
        .from('design_projects')
        .update({ selected_variant_id: variantId, updated_at: new Date().toISOString() })
        .eq('id', currentProject.id)
        .eq('user_id', user.uid);

      if (error) {
        console.error('[DesignProject] Error updating variant in Supabase:', error.message);
        // Rollback on failure
        setCurrentProject(prev => prev ? { ...prev, selectedVariantId: prevVariantId } : null);
        setSavedProjects(prev =>
          prev.map(p => p.id === currentProject.id ? { ...p, selectedVariantId: prevVariantId } : p)
        );
        return false;
      }
    }
    return true;
  };

  // Problem 4: Check error on update with rollback
  const updateSceneSettings = async (settings: Partial<ThreeDSceneSettings>): Promise<boolean> => {
    if (!currentProject) return false;
    const prevSettings = currentProject.sceneSettings;
    const updatedSettings = { ...currentProject.sceneSettings, ...settings };

    // Optimistic update
    setCurrentProject(prev => prev ? { ...prev, sceneSettings: updatedSettings } : null);
    setSavedProjects(prev =>
      prev.map(p => p.id === currentProject.id ? { ...p, sceneSettings: updatedSettings } : p)
    );

    if (user?.uid && isSupabaseConfigured) {
      const { error } = await supabase
        .from('design_projects')
        .update({ scene_settings: updatedSettings, updated_at: new Date().toISOString() })
        .eq('id', currentProject.id)
        .eq('user_id', user.uid);

      if (error) {
        console.error('[DesignProject] Error updating scene settings in Supabase:', error.message);
        // Rollback
        setCurrentProject(prev => prev ? { ...prev, sceneSettings: prevSettings } : null);
        setSavedProjects(prev =>
          prev.map(p => p.id === currentProject.id ? { ...p, sceneSettings: prevSettings } : p)
        );
        return false;
      }
    }
    return true;
  };

  // Problem 4: Check error on delete, never report success on failure
  const deleteProject = async (projectId: string): Promise<boolean> => {
    const projectToDelete = savedProjects.find(p => p.id === projectId);
    if (!projectToDelete) return false;

    if (user?.uid && isSupabaseConfigured) {
      const { error } = await supabase
        .from('design_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.uid);

      if (error) {
        console.error('[DesignProject] Error deleting project from Supabase:', error.message);
        return false; // Do not report success or delete from local state
      }

      if (projectToDelete.originalPhotoPath) {
        try {
          await supabase.storage.from('room-photos').remove([projectToDelete.originalPhotoPath]);
        } catch (storageErr) {
          console.warn('[DesignProject] Storage photo cleanup note:', storageErr);
        }
      }
    }

    setSavedProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(savedProjects.find(p => p.id !== projectId) || null);
    }
    return true;
  };

  const loadProjectById = (projectId: string): DesignProject | undefined => {
    return savedProjects.find(p => p.id === projectId);
  };

  const refreshProjects = async () => {
    await loadSavedProjects();
  };

  return (
    <DesignProjectContext.Provider
      value={{
        preferences,
        currentProject,
        savedProjects,
        status,
        errorMessage,
        isDemoGeneration,
        setCategory,
        setPhotoUri,
        updatePreferences,
        setConsent,
        startGeneration,
        resetWorkflow,
        selectVariant,
        updateSceneSettings,
        deleteProject,
        loadProjectById,
        refreshProjects,
      }}
    >
      {children}
    </DesignProjectContext.Provider>
  );
};

export const useDesignProject = () => {
  const context = useContext(DesignProjectContext);
  if (!context) {
    throw new Error('useDesignProject must be used within a DesignProjectProvider');
  }
  return context;
};
