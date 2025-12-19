import os
from pathlib import Path
import psycopg2
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
from dotenv import load_dotenv

# Load .env from job service (parent dir) or ml-recommendation
_base = Path(__file__).resolve().parent.parent
_env_paths = [
    _base.parent / "job" / ".env",  # services/job/.env
    _base / ".env",                   # services/ml-recommendation/.env
]
for env_path in _env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        print(f"Loaded .env from {env_path}")
        break

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent  # services/ml-recommendation
MODEL_DIR = BASE_DIR / "model"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Config
DB_URL = os.getenv("DATABASE_URL") or os.getenv("JOB_DB_URL") or os.getenv("DB_URL")
if not DB_URL:
    raise SystemExit("DATABASE_URL (or JOB_DB_URL/DB_URL) is required to train from DB")

# Simple SQL to pull active jobs; adjust text fields as needed
SQL = """
SELECT job_id, title, description, role
FROM jobs
WHERE is_active = true;
"""

def fetch_jobs():
    with psycopg2.connect(DB_URL) as conn:
        df = pd.read_sql(SQL, conn)
    # Build a text field combining title/role/description for vectorization
    df["skills"] = (
        df["title"].fillna("")
        + " "
        + df["role"].fillna("")
        + " "
        + df["description"].fillna("")
    )
    # Rename to match existing artifacts
    df = df.rename(columns={"job_id": "jobId"})
    return df[["jobId", "title", "skills"]]

def train(df: pd.DataFrame):
    vectorizer = TfidfVectorizer(
        lowercase=True,
        min_df=1,  # Include words that appear in at least 1 document
        max_df=1.0,  # Include words that appear in up to 100% of documents
        ngram_range=(1, 2),  # Include single words and 2-word phrases
        stop_words=None  # Don't remove stop words; keep all words
    )
    job_vectors = vectorizer.fit_transform(df["skills"])
    joblib.dump(vectorizer, MODEL_DIR / "vectorizer.pkl")
    joblib.dump(job_vectors, MODEL_DIR / "job_vectors.pkl")
    joblib.dump(df, MODEL_DIR / "jobs.pkl")
    print(f"Trained on {len(df)} jobs and saved artifacts to {MODEL_DIR}")
    print(f"Vectorizer vocabulary size: {len(vectorizer.get_feature_names_out())}")
    
def main():
    df = fetch_jobs()
    if df.empty:
        raise SystemExit("No active jobs found in DB; nothing to train")
    train(df)

if __name__ == "__main__":
    main()
