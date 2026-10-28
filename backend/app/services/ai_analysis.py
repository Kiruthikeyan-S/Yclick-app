from typing import List
from ..models.schemas import ImprovementSuggestionModel, DesignPreferencesModel, AnalyzeImageResponse

class SpatialAnalysisEngine:
    @staticmethod
    def analyze_space_photo(filename: str) -> AnalyzeImageResponse:
        return AnalyzeImageResponse(
            roomType="Residential / Commercial Space",
            detectedLighting="Direct Window Daylight with Secondary Shadowed Areas",
            detectedFeatures=[
                "Perimeter walls in neutral finish",
                "Primary floor boundary",
                "Central floor walking corridor",
                "Existing structural windows",
            ],
            spatialNotes="The room exhibits good structural proportions with ample opportunity to optimize lighting distribution and vertical wall storage."
        )

    @staticmethod
    def generate_practical_recommendations(preferences: DesignPreferencesModel) -> List[ImprovementSuggestionModel]:
        return [
            ImprovementSuggestionModel(
                id="sug-1",
                order=1,
                title="Optimize Natural Daylight & Primary Lighting",
                whyItMatters="Poorly positioned lighting creates harsh shadows, visual fatigue, and makes spaces feel smaller than their physical dimensions.",
                recommendedAction="Shift main seating 30cm closer to the primary window. Introduce a standing uplighter with a 3000K warm-white LED lamp to disperse light across the ceiling.",
                priority="High",
                difficulty="Easy",
                materialsNeeded=["Warm LED bulbs (3000K, 12W)", "Diffuser shade or standing floor lamp", "Cable organizer clips"],
                estimatedCostRange="₹1,200 – ₹2,500",
            ),
            ImprovementSuggestionModel(
                id="sug-2",
                order=2,
                title="Rearrange Furniture to Clear Primary Walking Pathway",
                whyItMatters="Obstructed movement paths cause friction and disrupt comfortable circulation throughout the room.",
                recommendedAction="Reposition bulky secondary furniture against the solid north wall, ensuring a minimum 75cm clear walkway between entry and primary seating.",
                priority="High",
                difficulty="Easy",
                materialsNeeded=["Furniture moving sliders or felt floor protector pads"],
                estimatedCostRange="₹300 – ₹600",
            ),
            ImprovementSuggestionModel(
                id="sug-3",
                order=3,
                title="Install Vertical Storage to Free Up Floor Footprint",
                whyItMatters="Floor clutter significantly impacts mental clarity and makes compact rooms feel overcrowded.",
                recommendedAction="Mount two shallow floating wooden shelves above desk height for books and display items, keeping floor space unobstructed.",
                priority="Medium",
                difficulty="Moderate",
                materialsNeeded=["Floating wooden shelves (60cm x 15cm)", "Wall anchors & mounting brackets", "Hand drill or adhesive heavy-duty strips"],
                estimatedCostRange="₹1,500 – ₹3,200",
            ),
            ImprovementSuggestionModel(
                id="sug-4",
                order=4,
                title="Apply Acoustic Soft Furnishings & Window Drapes",
                whyItMatters="Bare walls and hard floors cause unwanted audio reverberation and echo, diminishing cozy comfort.",
                recommendedAction="Hang floor-length linen drapes 10cm above the window frame to create visual height and absorb environmental noise.",
                priority="Low",
                difficulty="Easy",
                materialsNeeded=["Curtain rod with finials", "Dual panel semi-opaque textured linen curtains"],
                estimatedCostRange="₹2,000 – ₹4,500",
            ),
        ]
