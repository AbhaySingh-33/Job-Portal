import psycopg2
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path('../job/.env'))
db_url = os.getenv('DB_URL')

print("=== Checking DB Jobs ===\n")

conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute('SELECT job_id, title, description, role FROM jobs WHERE is_active = true;')

jobs = cur.fetchall()
print(f"Total active jobs: {len(jobs)}\n")

for job_id, title, desc, role in jobs:
    print(f"Job ID: {job_id}")
    print(f"  Title: {title}")
    print(f"  Role: {role}")
    print(f"  Desc: {(desc[:80] if desc else 'NULL')}...")
    print()

cur.close()
conn.close()

# Now check the trained model
print("\n=== Checking Trained Model ===\n")

import joblib
MODEL_DIR = Path('model')

try:
    vectorizer = joblib.load(MODEL_DIR / 'vectorizer.pkl')
    jobs_df = joblib.load(MODEL_DIR / 'jobs.pkl')
    
    print(f"Vectorizer vocab size: {len(vectorizer.get_feature_names_out())}")
    print(f"Jobs in model: {len(jobs_df)}\n")
    print("Jobs in model file:")
    print(jobs_df[['jobId', 'title', 'skills']])
    
except Exception as e:
    print(f"Error loading model: {e}")
