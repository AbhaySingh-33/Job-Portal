import sys
from pathlib import Path

# Add src directory to sys.path so recommend can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Union, Optional
from recommend import get_recommendations, recommend

app = FastAPI(title="Job Recommendation Engine", version="2.0-semantic")

class RecommendRequest(BaseModel):
    skills: Union[List[str], str]
    num_recommendations: Optional[int] = 5
    threshold: Optional[float] = 0.3

@app.post("/recommend")
def get_recommendation(payload: RecommendRequest):
    """Get job recommendations based on user skills using semantic search."""
    skills_val = payload.skills
    if isinstance(skills_val, list):
        skills_text = " ".join(skills_val)
    else:
        skills_text = skills_val

    num_recs = payload.num_recommendations or 5
    threshold = payload.threshold or 0.3
    recommendations = get_recommendations(skills_text, num_recommendations=num_recs, threshold=threshold)
    
    # Handle error responses from recommend function
    if isinstance(recommendations, dict) and "error" in recommendations:
        return recommendations
    
    return {"recommendedJobs": recommendations}

@app.get("/health")
def health():
    return {"status": "healthy", "model": "semantic-search-v2.0"}
