from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Union, Optional

from src.recommend import load_artifacts, get_recommendations

app = FastAPI(title="Job Recommendation Engine", version="2.0-semantic")

# Add CORS middleware to allow requests from other services
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for microservices communication
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    load_artifacts()


class RecommendRequest(BaseModel):
    skills: Union[List[str], str]
    num_recommendations: Optional[int] = 5
    threshold: Optional[float] = 0.3


@app.post("/recommend")
def recommend_api(payload: RecommendRequest):
    return {
        "recommendedJobs": get_recommendations(
            payload.skills,
            payload.num_recommendations,
            payload.threshold
        )
    }


@app.get("/health")
def health():
    return {"status": "healthy", "model": "semantic-search-v2.0"}
