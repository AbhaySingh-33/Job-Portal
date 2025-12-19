import sys
from pathlib import Path

# Add src directory to sys.path so recommend can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Union, Optional
from src.recommend import recommend

app = FastAPI()

class RecommendRequest(BaseModel):
    skills: Union[List[str], str]
    num_recommendations: Optional[int] = 5

@app.post("/recommend")
def get_recommendation(payload: RecommendRequest):
    skills_val = payload.skills
    if isinstance(skills_val, list):
        skills_text = " ".join(skills_val)
    else:
        skills_text = skills_val

    top_k = payload.num_recommendations or 5
    recommendations = recommend(skills_text, top_k=top_k)
    return {"recommendedJobs": recommendations}

@app.get("/health")
def health():
    return {"status": "healthy"}
