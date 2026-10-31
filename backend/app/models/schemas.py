from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CategorySpecificAnswers(BaseModel):
    primaryPriority: Optional[str] = None
    approxCapacity: Optional[str] = None
    subType: Optional[str] = None
    productType: Optional[str] = None
    notes: Optional[str] = None

class DesignPreferencesModel(BaseModel):
    categoryId: str
    subcategoryId: str
    photoUri: str
    consentGiven: bool
    budgetChoice: str
    customBudget: Optional[str] = None
    style: str
    itemsToKeep: List[str] = Field(default_factory=list)
    improvementGoals: List[str] = Field(default_factory=list)
    constraints: List[str] = Field(default_factory=list)
    additionalNotes: Optional[str] = None
    roomMeasurements: Optional[str] = None
    cityPincode: Optional[str] = None
    categoryAnswers: Optional[CategorySpecificAnswers] = None

class GenerateDesignRequest(BaseModel):
    userId: str
    preferences: DesignPreferencesModel
    demoMode: Optional[bool] = False

class DesignVariantModel(BaseModel):
    id: str
    type: str  # 'Budget Refresh' | 'Balanced Makeover' | 'Premium Redesign'
    title: str
    imageUrl: str
    summary: str
    proposedChanges: List[str] = Field(default_factory=list)
    estimatedBudgetRange: str
    itemsPreserved: List[str] = Field(default_factory=list)
    pros: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)

class ImprovementSuggestionModel(BaseModel):
    id: str
    order: int
    title: str
    whyItMatters: str
    recommendedAction: str
    priority: str  # 'High' | 'Medium' | 'Low'
    difficulty: str  # 'Easy' | 'Moderate' | 'Professional Help'
    materialsNeeded: List[str] = Field(default_factory=list)
    estimatedCostRange: Optional[str] = None

class ProductRecommendationModel(BaseModel):
    id: str
    name: str = Field(default='', alias='name')
    category: str
    imageUrl: str
    reason: str
    price: Optional[float] = None
    currency: Optional[str] = '₹'
    merchant: Optional[str] = None
    productUrl: str = ''
    isEssential: bool = False
    isDemo: Optional[bool] = False

class GenerateDesignResponse(BaseModel):
    success: bool
    projectId: str
    variants: List[DesignVariantModel] = Field(default_factory=list)
    suggestions: List[ImprovementSuggestionModel] = Field(default_factory=list)
    products: List[ProductRecommendationModel] = Field(default_factory=list)
    isDemo: bool = False
    message: Optional[str] = None

class RoomScores(BaseModel):
    lighting: str = "5/10"
    spaciousness: str = "6/10"
    coziness: str = "5/10"

class AnalyzeImageResponse(BaseModel):
    roomType: str
    detectedObjects: List[str] = Field(default_factory=list)
    correctionsNeeded: List[str] = Field(default_factory=list)
    itemsToRemove: List[str] = Field(default_factory=list)
    diySelfImprovements: List[str] = Field(default_factory=list)
    suggestedTemplate: str = "Modern Scandinavian"
    scores: Optional[RoomScores] = None
    detectedLighting: Optional[str] = "Natural daylight with secondary shadows"
    detectedFeatures: Optional[List[str]] = Field(default_factory=list)
    spatialNotes: Optional[str] = None
    isDemo: bool = False
