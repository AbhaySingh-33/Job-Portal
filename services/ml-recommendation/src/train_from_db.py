import os
from pathlib import Path
import psycopg2
import pandas as pd
import joblib
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

# Load .env from job service (parent dir) or ml-recommendation
_base = Path(__file__).resolve().parent.parent
_env_paths = [
    _base.parent / "job" / ".env",  # services/job/.env
    _base / ".env",                  # services/ml-recommendation/.env
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
    # Build a text field combining title/role/description for embeddings
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

def train_semantic(df: pd.DataFrame):
    """Generate semantic embeddings for jobs using all-MiniLM-L6-v2 model."""
    print("Loading semantic model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')

    # Generate vectors for every job description
    print(f"Generating embeddings for {len(df)} jobs...")
    job_embeddings = model.encode(
        df["skills"].tolist(),
        show_progress_bar=True,
        convert_to_tensor=True
    )

    # Save the artifacts
    joblib.dump(df, MODEL_DIR / "jobs.pkl")
    joblib.dump(job_embeddings, MODEL_DIR / "job_embeddings.pkl")
    print(f"Semantic model trained successfully on {len(df)} jobs.")
    print(f"Embeddings saved to {MODEL_DIR}")

def main():
    df = fetch_jobs()
    if df.empty:
        raise SystemExit("No active jobs found in DB; nothing to train")
    train_semantic(df)

if __name__ == "__main__":
    main()