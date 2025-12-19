import requests
import json

url = "http://localhost:9001/recommend"

# Test 1: ReactJs query
payload = {
    "skills": ["ReactJs"],
    "num_recommendations": 5
}

print("Test 1: Query with ['ReactJs']")
resp = requests.post(url, json=payload)
print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(resp.json(), indent=2)}\n")

# Test 2: Backend query
payload = {
    "skills": ["backend", "api"],
    "num_recommendations": 5
}

print("Test 2: Query with ['backend', 'api']")
resp = requests.post(url, json=payload)
print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(resp.json(), indent=2)}\n")

# Test 3: HR query
payload = {
    "skills": ["talent", "hiring"],
    "num_recommendations": 5
}

print("Test 3: Query with ['talent', 'hiring']")
resp = requests.post(url, json=payload)
print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(resp.json(), indent=2)}")
