import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
from pathlib import Path

# Resolve paths relative to this file so CWD doesn't matter
BASE_DIR = Path(__file__).resolve().parent.parent  # services/ml-recommendation
DATA_FILE = BASE_DIR / "data" / "jobs.csv"
MODEL_DIR = BASE_DIR / "model"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

data = pd.read_csv(DATA_FILE)

vectorizer = TfidfVectorizer()
job_vectors = vectorizer.fit_transform(data["skills"])

joblib.dump(vectorizer, MODEL_DIR / "vectorizer.pkl")
joblib.dump(job_vectors, MODEL_DIR / "job_vectors.pkl")
joblib.dump(data, MODEL_DIR / "jobs.pkl")

print("Model trained successfully")