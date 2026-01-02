import joblib
import torch
from sentence_transformers import SentenceTransformer, util
from pathlib import Path

_BASE_DIR = Path(__file__).resolve().parent.parent
_MODEL_DIR = _BASE_DIR / "model"
_SENTENCE_MODEL_DIR = _MODEL_DIR / "sentence_model"

# Globals (loaded once)
model = None
jobs_df = None
job_embeddings = None


def load_artifacts():
    """Load ML artifacts once at startup."""
    global model, jobs_df, job_embeddings

    model = SentenceTransformer(str(_SENTENCE_MODEL_DIR))
    jobs_df = joblib.load(_MODEL_DIR / "jobs.pkl")
    job_embeddings = joblib.load(_MODEL_DIR / "job_embeddings.pkl")

    if not torch.is_tensor(job_embeddings):
        job_embeddings = torch.tensor(job_embeddings)


def get_recommendations(query_skills, num_recommendations=5, threshold=0.3):
    if model is None:
        return {"error": "Model not loaded"}

    if isinstance(query_skills, list):
        query_text = " ".join(query_skills)
    else:
        query_text = str(query_skills)

    if not query_text.strip():
        return {"error": "Skills cannot be empty"}

    query_embedding = model.encode(query_text, convert_to_tensor=True)
    cosine_scores = util.cos_sim(query_embedding, job_embeddings)[0]

    top_k = min(num_recommendations, len(jobs_df))
    top_results = torch.topk(cosine_scores, k=top_k)

    recommendations = []
    for score, idx in zip(top_results.values, top_results.indices):
        score_val = float(score)
        if score_val < threshold:
            continue

        job = jobs_df.iloc[idx.item()]
        recommendations.append({
            "jobId": int(job["jobId"]),
            "title": job["title"],
            "skills": job["skills"],
            "score": score_val
        })

    return recommendations
