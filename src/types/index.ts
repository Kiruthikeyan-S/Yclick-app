export interface RoomScores {
  lighting: string;
  spaciousness: string;
  coziness: string;
}

export interface RoomAnalysisData {
  roomType: string;
  detectedObjects: string[];
  correctionsNeeded: string[];
  itemsToRemove: string[];
  diySelfImprovements: string[];
  suggestedTemplate: string;
  scores?: RoomScores;
  detectedLighting?: string;
  detectedFeatures?: string[];
  spatialNotes?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt?: string;
  isEmailVerified: boolean;
}

export type SpaceCategoryId = 
  | 'home-rooms' 
  | 'restaurants-cafes' 
  | 'hotels' 
  | 'offices' 
  | 'shops';

export interface SpaceSubcategory {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export interface SpaceCategory {
  id: SpaceCategoryId;
  name: string;
  description: string;
  iconName: string;
  subcategories: SpaceSubcategory[];
}

export type DesignStyle =
  | 'Modern'
  | 'Minimalist'
  | 'Cozy'
  | 'Traditional'
  | 'Scandinavian'
  | 'Industrial'
  | 'Luxury'
  | 'Contemporary'
  | 'Let AI suggest a style';

export type BudgetChoice =
  | 'Under ₹5,000'
  | '₹5,000–₹10,000'
  | '₹10,000–₹25,000'
  | '₹25,000 and above'
  | 'Custom budget'
  | 'Not sure yet';

export interface CategorySpecificAnswers {
  primaryPriority?: string;
  approxCapacity?: string; // e.g. seating count, desk count
  subType?: string;
  productType?: string;
  notes?: string;
}

export interface DesignPreferences {
  categoryId: SpaceCategoryId;
  subcategoryId: string;
  photoUri: string;
  consentGiven: boolean;
  budgetChoice: BudgetChoice;
  customBudget?: string;
  style: DesignStyle;
  itemsToKeep: string[];
  improvementGoals: string[];
  constraints: string[];
  additionalNotes?: string;
  roomMeasurements?: string;
  cityPincode?: string;
  categoryAnswers?: CategorySpecificAnswers;
}

export type VariantType = 'Budget Refresh' | 'Balanced Makeover' | 'Premium Redesign';

export interface DesignVariant {
  id: string;
  type: VariantType;
  title: string;
  imageUrl: string;
  summary: string;
  proposedChanges: string[];
  estimatedBudgetRange: string;
  itemsPreserved: string[];
  pros: string[];
  limitations: string[];
}

export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type DifficultyLevel = 'Easy' | 'Moderate' | 'Professional Help';

export interface ImprovementSuggestion {
  id: string;
  order: number;
  title: string;
  whyItMatters: string;
  recommendedAction: string;
  priority: PriorityLevel;
  difficulty: DifficultyLevel;
  materialsNeeded: string[];
  estimatedCostRange?: string;
}

export type ProductCategory =
  | 'Furniture'
  | 'Lighting'
  | 'Curtains'
  | 'Decoration'
  | 'Storage'
  | 'Paint and materials';

export interface ProductRecommendation {
  id: string;
  name: string;
  category: ProductCategory;
  imageUrl: string;
  reason: string;
  price?: number;
  currency?: string;
  merchant?: string;
  productUrl: string;
  isEssential: boolean;
  isDemo?: boolean;
}

export interface ThreeDSceneSettings {
  wallColor: string;
  floorType: 'wood' | 'tile' | 'concrete' | 'carpet';
  lightingPreset: 'daylight' | 'warm-evening' | 'bright-studio';
  furnitureVisible: {
    seating: boolean;
    storage: boolean;
    tables: boolean;
    plants: boolean;
    lighting: boolean;
  };
  cameraPreset: 'perspective' | 'top-down' | 'front';
}

export type GenerationStatus = 'draft' | 'analyzing' | 'generating' | 'completed' | 'failed';

export interface DesignProject {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  originalPhotoUri: string;
  status: GenerationStatus;
  preferences: DesignPreferences;
  variants: DesignVariant[];
  selectedVariantId?: string;
  suggestions: ImprovementSuggestion[];
  products: ProductRecommendation[];
  sceneSettings: ThreeDSceneSettings;
  error?: string;
}
