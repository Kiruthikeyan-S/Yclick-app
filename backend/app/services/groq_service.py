import os
import json
import logging
import httpx
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from ..models.schemas import ImprovementSuggestionModel, DesignPreferencesModel

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")


class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.model = os.getenv("GROQ_MODEL", DEFAULT_MODEL)

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.startswith("gsk_"))

    async def chat(self, messages: List[Dict[str, str]], max_tokens: int = 500) -> str:
        """General interior design chat using Groq. Raises HTTPException on failure (Problem 12)."""
        if not self.is_configured:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Groq API service is not configured. Please supply GROQ_API_KEY in backend environment.",
            )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "YClick-Backend/1.0",
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7,
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(GROQ_API_URL, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices and "message" in choices[0]:
                        return choices[0]["message"]["content"]
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Groq API returned an empty or malformed completion.",
                    )
                else:
                    logger.error(f"Groq chat error {res.status_code}: {res.text}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Groq API provider error ({res.status_code}): {res.text}",
                    )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Groq exception: {e}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to communicate with Groq AI provider: {str(e)}",
            )

    async def generate_dynamic_recommendations(
        self, preferences: DesignPreferencesModel
    ) -> List[ImprovementSuggestionModel]:
        """Generate tailored, practical suggestions using Groq LPU."""
        if not self.is_configured:
            return []

        prompt = f"""You are a professional interior architect and spatial designer for the YClick app.
The user wants to redesign their {preferences.categoryId} ({preferences.subcategoryId}).
Preferences:
- Chosen Style: {preferences.style}
- Budget Tier: {preferences.budgetChoice} (Custom budget: {preferences.customBudget or 'Flexible'})
- Items to keep: {', '.join(preferences.itemsToKeep) if preferences.itemsToKeep else 'Existing layout'}
- Priority Goals: {', '.join(preferences.improvementGoals) if preferences.improvementGoals else 'Modernize aesthetics'}
- Constraints: {', '.join(preferences.constraints) if preferences.constraints else 'None'}
- Notes: {preferences.additionalNotes or 'None'}

Return EXACTLY 4 actionable, practical improvement suggestions in valid JSON format.
Each suggestion must have:
- "id": string like "sug-1"
- "order": integer (1 to 4)
- "title": concise action title
- "whyItMatters": clear architectural rationale
- "recommendedAction": specific step-by-step recommendation with measurements
- "priority": "High" | "Medium" | "Low"
- "difficulty": "Easy" | "Moderate" | "Professional Help"
- "materialsNeeded": array of strings (tools, fixtures, or materials)
- "estimatedCostRange": budget in Indian Rupees format (e.g. "₹1,500 – ₹3,000")

Respond ONLY with a JSON array of 4 objects. No markdown ticks, no preamble."""

        messages = [
            {"role": "system", "content": "You are a specialized interior design JSON generator. Return only JSON."},
            {"role": "user", "content": prompt},
        ]

        try:
            raw_response = await self.chat(messages, max_tokens=2500)
            clean_json = raw_response.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.startswith("```"):
                clean_json = clean_json[3:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            clean_json = clean_json.strip()

            parsed = json.loads(clean_json)
            suggestions = []
            for item in parsed:
                suggestions.append(ImprovementSuggestionModel(
                    id=item.get("id", f"sug-{len(suggestions)+1}"),
                    order=item.get("order", len(suggestions)+1),
                    title=item.get("title", "Spatial Enhancement"),
                    whyItMatters=item.get("whyItMatters", ""),
                    recommendedAction=item.get("recommendedAction", ""),
                    priority=item.get("priority", "Medium"),
                    difficulty=item.get("difficulty", "Moderate"),
                    materialsNeeded=item.get("materialsNeeded", []),
                    estimatedCostRange=item.get("estimatedCostRange", "₹2,000 – ₹5,000"),
                ))
            return suggestions
        except Exception as e:
            logger.warning(f"Failed to parse Groq suggestions: {e}")
            return []


groq_service = GroqService()
