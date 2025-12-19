import sys
from pathlib import Path
sys.path.insert(0, str(Path('src').resolve()))

import joblib
from sklearn.metrics.pairwise import cosine_similarity

MODEL_DIR = Path('model')

vectorizer = joblib.load(MODEL_DIR / 'vectorizer.pkl')
job_vectors = joblib.load(MODEL_DIR / 'job_vectors.pkl')
jobs = joblib.load(MODEL_DIR / 'jobs.pkl')

def test_recommend(user_skills_input):
    print(f"\n=== Testing: {user_skills_input} ===")
    
    # Vectorize input
    user_vector = vectorizer.transform([user_skills_input])
    print(f"User vector sparsity: {user_vector.nnz} non-zero terms")
    
    # Compute similarity
    similarity = cosine_similarity(user_vector, job_vectors)
    print(f"Similarity scores: {similarity[0]}")
    print(f"Similarity sum: {similarity.sum()}")
    
    # Check if guard triggers
    if similarity.sum() == 0:
        print("⚠️  GUARD TRIGGERED: Returning empty list")
        return []
    
    top_indices = similarity[0].argsort()[-5:][::-1]
    results = jobs.iloc[top_indices]
    
    print(f"Top result: {results.iloc[0]['title']} (score: {similarity[0][top_indices[0]]:.4f})")
    return results

# Test cases
test_recommend("ReactJs")
test_recommend("backend api")
test_recommend("talent hiring")
test_recommend("Backend Developer Handling api")
