import joblib
import torch
from sentence_transformers import SentenceTransformer, util
from pathlib import Path

_BASE_DIR = Path(__file__).resolve().parent.parent
_MODEL_DIR = _BASE_DIR / "model"

_model = None

def _get_model():
    """Lazily load the sentence-transformer model to avoid blocking imports."""
    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def get_recommendations(query_skills, num_recommendations: int = 5, threshold: float = 0.3):
    """
    Recommend jobs based on semantic similarity.

    Args:
        query_skills: str or list of skills to search for
        num_recommendations: max number of jobs to return
        threshold: minimum similarity score (0-1, default 0.3)

    Returns:
        List of recommended jobs with scores OR an error dict
    """
    # Load the jobs database (saved during training)
    try:
        jobs_df = joblib.load(_MODEL_DIR / "jobs.pkl")
        job_embeddings = joblib.load(_MODEL_DIR / "job_embeddings.pkl")
    except FileNotFoundError as e:
        return {"error": f"Model files not found: {str(e)}. Please run training first."}
    except Exception as e:
        return {"error": f"Failed to load model artifacts: {e}"}

    # Handle both string and list inputs
    if isinstance(query_skills, list):
        query_text = ' '.join(query_skills)
    else:
        query_text = query_skills

    # Encode the user's input skills into a semantic vector
    model = _get_model()
    query_embedding = model.encode(query_text, convert_to_tensor=True)

    # Calculate Cosine Similarity between query and all jobs
    cosine_scores = util.cos_sim(query_embedding, job_embeddings)[0]

    # Get the top K results
    top_results = torch.topk(cosine_scores, k=min(num_recommendations, len(jobs_df)))

    recommended_jobs = []
    for score, idx in zip(top_results.values, top_results.indices):
        score_value = float(score)
        idx_value = idx.item()

        if score_value < threshold:
            continue

        recommended_jobs.append({
            "jobId": int(jobs_df.iloc[idx_value]["jobId"]),
            "title": jobs_df.iloc[idx_value]["title"],
            "skills": jobs_df.iloc[idx_value]["skills"],
            "score": score_value
        })

    return recommended_jobs

# Backward compatibility wrapper expected by API or older callers
def recommend(skills, num_recommendations: int = 5, threshold: float = 0.3, top_k: int = None):
    if top_k:
        num_recommendations = top_k
    return get_recommendations(skills, num_recommendations=num_recommendations, threshold=threshold)