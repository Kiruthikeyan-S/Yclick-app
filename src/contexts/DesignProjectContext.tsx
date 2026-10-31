import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  DesignPreferences, 
  DesignProject, 
  DesignVariant, 
  ImprovementSuggestion, 
  ProductRecommendation, 
  SpaceCategoryId, 
  ThreeDSceneSettings,
  GenerationStatus 
} from '../types';
import { useAuth } from './AuthContext';
import { auth } from '../services/firebase';
import { DEMO_VARIANTS, DEMO_SUGGESTIONS, DEMO_PRODUCTS, DEFAULT_SCENE_SETTINGS } from '../services/demoData';
import { requestDesignGeneration } from '../services/api';
import { 
  supabase, 
  isSupabaseConfigured, 
  uploadRoomPhotoToSupabase, 
  getSignedRoomPhotoUrl 
} from '../services/supabase';

const DEFAULT_PREFERENCES: DesignPreferences = {
  categoryId: 'home-rooms',
  subcategoryId: 'living-room',
  photoUri: '',
  consentGiven: false,
  budgetChoice: 'Not sure yet',
  style: 'Let AI suggest a style',
  itemsToKeep: ['Flooring', 'Doors and windows'],
  improvementGoals: ['Better lighting', 'Better furniture arrangement'],
  constraints: [],
  categoryAnswers: {},
};

interface DesignProjectContextType {
  preferences: DesignPreferences;
  currentProject: DesignProject | null;
  savedProjects: DesignProject[];
  status: GenerationStatus;
  errorMessage: string | null;
  isDemoGeneration: boolean;
  setCategory: (catId: SpaceCategoryId, subId: string) => void;
  setPhotoUri: (uri: string) => void;
  setConsent: (consent: boolean) => void;
  updatePreferences: (updates: Partial<DesignPreferences>) => void;
  resetWorkflow: () => void;
  startGeneration: () => Promise<boolean>;
  selectVariant: (variantId: string) => void;
  updateSceneSettings: (settings: Partial<ThreeDSceneSettings>) => void;
  deleteProject: (projectId: string) => Promise<boolean>;
  loadProjectById: (projectId: string) => DesignProject | undefined;
  refreshProjects: () => Promise<void>;
}

const DesignProjectContext = createContext<DesignProjectContextType | undefined>(undefined);

export const DesignProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<DesignPreferences>(DEFAULT_PREFERENCES);
  const [currentProject, setCurrentProject] = useState<DesignProject | null>(null);
  const [savedProjects, setSavedProjects] = useState<DesignProject[]>([]);
  const [status, setStatus] = useState<GenerationStatus>('draft');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDemoGeneration, setIsDemoGeneration] = useState(false);

  // Load user's saved projects permanently from Supabase database
  const loadSavedProjects = useCallback(async () => {
    if (!user?.uid || !isSupabaseConfigured) {
      // In offline/guest development mode, clear projects or leave as empty
      if (!user) {
        setSavedProjects([]);
        setCurrentProject(null);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('design_projects')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });

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

        setSavedProjects(mapped);
        if (!currentProject && mapped.length > 0) {
          setCurrentProject(mapped[0]);
        }
      } else {
        setSavedProjects([]);
      }
    } catch (err: any) {
      console.warn('[DesignProject] Exception loading projects:', err.message);
    }
  }, [user, currentProject]);

  useEffect(() => {
    loadSavedProjects();
  }, [user?.uid]);

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

  const setConsent = (consent: boolean) => {
    setPreferences(prev => ({
      ...prev,
      consentGiven: consent,
    }));
  };

  const updatePreferences = (updates: Partial<DesignPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...updates,
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
      // 1. Upload captured photo to Supabase private storage if user is authenticated and Supabase is configured
      if (user?.uid && isSupabaseConfigured) {
        try {
          const uploadRes = await uploadRoomPhotoToSupabase(
            preferences.photoUri,
            user.uid,
            projectId
          );

          if (uploadRes.success && uploadRes.storagePath) {
            storagePath = uploadRes.storagePath;
            effectivePhotoUrl = uploadRes.signedUrl || preferences.photoUri;
          } else {
            console.warn('[DesignProject] Storage upload note:', uploadRes.error);
          }
        } catch (storageErr) {
          console.warn('[DesignProject] Storage upload exception, continuing with local photo:', storageErr);
        }
      }

      // 2. Obtain Firebase ID token for protected backend endpoints
      const idToken = user ? await auth?.currentUser?.getIdToken() : undefined;

      // 3. Request generation from backend
      const res = await requestDesignGeneration(
        { ...preferences, photoUri: effectivePhotoUrl },
        effectiveUserId,
        idToken
      );

      let variants: DesignVariant[] = DEMO_VARIANTS;
      let suggestions: ImprovementSuggestion[] = DEMO_SUGGESTIONS;
      let products: ProductRecommendation[] = DEMO_PRODUCTS;
      let isDemo = true;

      if (res.success && res.data) {
        variants = res.data.variants || DEMO_VARIANTS;
        suggestions = res.data.suggestions || DEMO_SUGGESTIONS;
        products = res.data.products || DEMO_PRODUCTS;
        isDemo = Boolean(res.data.isDemo);
      } else {
        throw new Error(res.error || 'Backend design generation failed.');
      }

      setIsDemoGeneration(isDemo);

      const newProject: DesignProject = {
        id: projectId,
        userId: effectiveUserId,
        title: `${preferences.style} ${preferences.subcategoryId.replace('-', ' ')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        originalPhotoUri: effectivePhotoUrl,
        originalPhotoPath: storagePath,
        status: 'completed',
        preferences: { ...preferences, photoUri: effectivePhotoUrl },
        variants,
        selectedVariantId: variants[1]?.id || variants[0]?.id,
        suggestions,
        products,
        sceneSettings: DEFAULT_SCENE_SETTINGS,
      };

      // 4. Persist to Supabase Database
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

        if (insertError) {
          console.warn('[DesignProject] Database insert note:', insertError.message);
        }
      }

      setCurrentProject(newProject);
      setSavedProjects(prev => [newProject, ...prev]);
      setStatus('completed');
      return true;
    } catch (err: any) {
      setStatus('failed');
      setErrorMessage(err.message || 'Design generation was interrupted.');
      return false;
    }
  };

  const selectVariant = async (variantId: string) => {
    if (currentProject) {
      setCurrentProject(prev => prev ? { ...prev, selectedVariantId: variantId } : null);
      setSavedProjects(prev => 
        prev.map(p => p.id === currentProject.id ? { ...p, selectedVariantId: variantId } : p)
      );

      if (user?.uid && isSupabaseConfigured) {
        try {
          await supabase
            .from('design_projects')
            .update({ selected_variant_id: variantId, updated_at: new Date().toISOString() })
            .eq('id', currentProject.id);
        } catch (e: any) {
          console.warn('[DesignProject] Error updating variant:', e.message);
        }
      }
    }
  };

  const updateSceneSettings = async (settings: Partial<ThreeDSceneSettings>) => {
    if (currentProject) {
      const updatedSettings = { ...currentProject.sceneSettings, ...settings };
      setCurrentProject(prev => prev ? { ...prev, sceneSettings: updatedSettings } : null);
      setSavedProjects(prev =>
        prev.map(p => p.id === currentProject.id ? { ...p, sceneSettings: updatedSettings } : p)
      );

      if (user?.uid && isSupabaseConfigured) {
        try {
          await supabase
            .from('design_projects')
            .update({ scene_settings: updatedSettings, updated_at: new Date().toISOString() })
            .eq('id', currentProject.id);
        } catch (e: any) {
          console.warn('[DesignProject] Error updating scene settings:', e.message);
        }
      }
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    const projectToDelete = savedProjects.find(p => p.id === projectId);

    if (user?.uid && isSupabaseConfigured) {
      try {
        await supabase.from('design_projects').delete().eq('id', projectId);
        if (projectToDelete?.originalPhotoPath) {
          await supabase.storage.from('room-photos').remove([projectToDelete.originalPhotoPath]);
        }
      } catch (e: any) {
        console.warn('[DesignProject] Error deleting project from Supabase:', e.message);
      }
    }

    setSavedProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
    return true;
  };

  const loadProjectById = (projectId: string) => {
    const proj = savedProjects.find(p => p.id === projectId);
    if (proj) {
      setCurrentProject(proj);
      setPreferences(proj.preferences);
    }
    return proj;
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
        setConsent,
        updatePreferences,
        resetWorkflow,
        startGeneration,
        selectVariant,
        updateSceneSettings,
        deleteProject,
        loadProjectById,
        refreshProjects: loadSavedProjects,
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
