import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { DEMO_VARIANTS, DEMO_SUGGESTIONS, DEMO_PRODUCTS, DEFAULT_SCENE_SETTINGS } from '../services/demoData';
import { requestDesignGeneration } from '../services/api';

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

  // Initialize with a sample project if new user
  useEffect(() => {
    if (savedProjects.length === 0) {
      const initialProject: DesignProject = {
        id: 'initial-sample-proj',
        userId: user?.uid || 'demo-user-123',
        title: 'Modern Living Room Refresh',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        originalPhotoUri: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
        status: 'completed',
        preferences: {
          ...DEFAULT_PREFERENCES,
          photoUri: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
          consentGiven: true,
          style: 'Scandinavian',
          budgetChoice: '₹10,000–₹25,000',
        },
        variants: DEMO_VARIANTS,
        selectedVariantId: 'var-balanced',
        suggestions: DEMO_SUGGESTIONS,
        products: DEMO_PRODUCTS,
        sceneSettings: DEFAULT_SCENE_SETTINGS,
      };
      setSavedProjects([initialProject]);
      setCurrentProject(initialProject);
    }
  }, [user]);

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

    try {
      // Attempt to invoke the Python FastAPI backend
      const res = await requestDesignGeneration(preferences, user?.uid || 'guest');
      
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
        // Backend not currently reachable or in demo setup mode:
        // We gracefully load realistic preview design data and explicitly tag it as demo
        isDemo = true;
      }

      setIsDemoGeneration(isDemo);

      const newProject: DesignProject = {
        id: `proj-${Date.now()}`,
        userId: user?.uid || 'guest-user',
        title: `${preferences.style} ${preferences.subcategoryId.replace('-', ' ')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        originalPhotoUri: preferences.photoUri,
        status: 'completed',
        preferences: { ...preferences },
        variants,
        selectedVariantId: variants[1]?.id || variants[0]?.id,
        suggestions,
        products,
        sceneSettings: DEFAULT_SCENE_SETTINGS,
      };

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

  const selectVariant = (variantId: string) => {
    if (currentProject) {
      setCurrentProject(prev => prev ? { ...prev, selectedVariantId: variantId } : null);
      setSavedProjects(prev => 
        prev.map(p => p.id === currentProject.id ? { ...p, selectedVariantId: variantId } : p)
      );
    }
  };

  const updateSceneSettings = (settings: Partial<ThreeDSceneSettings>) => {
    if (currentProject) {
      const updatedSettings = { ...currentProject.sceneSettings, ...settings };
      setCurrentProject(prev => prev ? { ...prev, sceneSettings: updatedSettings } : null);
      setSavedProjects(prev =>
        prev.map(p => p.id === currentProject.id ? { ...p, sceneSettings: updatedSettings } : p)
      );
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
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
