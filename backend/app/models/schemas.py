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
    itemsToKeep: List[str] = []
    improvementGoals: List[str] = []
    constraints: List[str] = []
    additionalNotes: Optional[str] = None
    roomMeasurements: Optional[str] = None
    cityPincode: Optional[str] = None
    categoryAnswers: Optional[CategorySpecificAnswers] = None

class GenerateDesignRequest(BaseModel):
    userId: str
    preferences: DesignPreferencesModel

class DesignVariantModel(BaseModel):
    id: str
    type: str  # 'Budget Refresh' | 'Balanced Makeover' | 'Premium Redesign'
    title: str
    imageUrl: str
    summary: str
    proposedChanges: List[str]
    estimatedBudgetRange: str
    itemsPreserved: List[str]
    pros: List[str]
    limitations: List[str]

class ImprovementSuggestionModel(BaseModel):
    id: str
    order: int
    title: str
    whyItMatters: str
    recommendedAction: str
    priority: str  # 'High' | 'Medium' | 'Low'
    difficulty: str  # 'Easy' | 'Moderate' | 'Professional Help'
    materialsNeeded: List[str]
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
    productUrl: str
    isEssential: bool
    isDemo: Optional[bool] = False

class GenerateDesignResponse(BaseModel):
    success: bool
    projectId: str
    variants: List[DesignVariantModel]
    suggestions: List[ImprovementSuggestionModel]
    products: List[ProductRecommendationModel]
    isDemo: bool = False
    message: Optional[str] = None

class RoomScores(BaseModel):
    lighting: str = "5/10"
    spaciousness: str = "6/10"
    coziness: str = "5/10"

class AnalyzeImageResponse(BaseModel):
    roomType: str
    detectedObjects: List[str] = []
    correctionsNeeded: List[str] = []
    itemsToRemove: List[str] = []
    diySelfImprovements: List[str] = []
    suggestedTemplate: str = "Modern Scandinavian"
    scores: Optional[RoomScores] = None
    detectedLighting: Optional[str] = "Natural daylight with secondary shadows"
    detectedFeatures: Optional[List[str]] = []
    spatialNotes: Optional[str] = None
