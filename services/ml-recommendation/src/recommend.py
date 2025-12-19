import joblib
from sklearn.metrics.pairwise import cosine_similarity
from pathlib import Path

# Resolve file-relative paths so CWD doesn't matter
_BASE_DIR = Path(__file__).resolve().parent.parent  # services/ml-recommendation
_MODEL_DIR = _BASE_DIR / "model"

vectorizer = joblib.load(_MODEL_DIR / "vectorizer.pkl")
job_vectors = joblib.load(_MODEL_DIR / "job_vectors.pkl")
jobs_df = joblib.load(_MODEL_DIR / "jobs.pkl")

def recommend(skills, num_recommendations: int = 5, threshold: float = 0.05, top_k: int = None):
    """
    Recommend jobs based on skills.
    
    Args:
        skills: str or list of skills
        num_recommendations: max number of jobs to return
        threshold: minimum similarity score (0-1)
        top_k: legacy parameter, same as num_recommendations
    """
    # Handle both string and list inputs
    if isinstance(skills, list):
        query_text = ' '.join(skills)
    else:
        query_text = skills
    
    # Use top_k if provided (backward compatibility)
    if top_k:
        num_recommendations = top_k
    
    # Convert query skills to vector
    query_vector = vectorizer.transform([query_text])
    
    # Calculate similarity with all jobs
    similarities = cosine_similarity(query_vector, job_vectors)[0]
    
    # Filter by threshold and sort
    top_indices = similarities.argsort()[::-1]  # Sort descending
    
    recommended_jobs = []
    for idx in top_indices:
        similarity_score = similarities[idx]
        
        # Only include jobs above threshold
        if similarity_score < threshold:
            break
        
        recommended_jobs.append({
            "jobId": int(jobs_df.iloc[idx]["jobId"]),
            "title": jobs_df.iloc[idx]["title"],
            "skills": jobs_df.iloc[idx]["skills"],
            "similarity": float(similarity_score)
        })
        
        if len(recommended_jobs) >= num_recommendations:
            break
    
    return recommended_jobs