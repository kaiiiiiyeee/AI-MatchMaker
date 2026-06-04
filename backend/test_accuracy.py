import pandas as pd
import requests
from sklearn.metrics import accuracy_score
import concurrent.futures
import time

# 1. Load the test data
print("Loading test data...")
test_df = pd.read_csv("api_test_data.csv")
test_df = test_df.head(500)

actual_outcomes = test_df["actual_outcome"].tolist()
API_URL = "http://localhost:8000/predict"


# 2. Define a single prediction task
def get_prediction(row):
    payload = {
        "gender": str(row.get("gender", "Male")),
        "sexual_orientation": str(row.get("sexual_orientation", "Straight")),
        "location_type": str(row.get("location_type", "Urban")),
        "income_bracket": str(row.get("income_bracket", "Middle")),
        "education_level": str(row.get("education_level", "Bachelor’s")),
        "swipe_time_of_day": str(row.get("swipe_time_of_day", "Evening")),
        "app_usage_time_min": int(row.get("app_usage_time_min", 60)),
        "likes_received": int(row.get("likes_received", 10)),
        "mutual_matches": int(row.get("mutual_matches", 2)),
        "profile_pics_count": int(row.get("profile_pics_count", 3)),
        "bio_length": int(row.get("bio_length", 100)),
        "message_sent_count": int(row.get("message_sent_count", 5)),
        "last_active_hour": int(row.get("last_active_hour", 20)),
        "swipe_right_ratio": float(row.get("swipe_right_ratio", 0.5)),
        "emoji_usage_rate": float(row.get("emoji_usage_rate", 0.2)),
        "interest_tags": [],
    }

    try:
        response = requests.post(API_URL, json=payload)
        probability = response.json()["match_probability_percentage"]
        return 1 if probability >= 50.0 else 0
    except Exception:
        return 0


print(f"🚀 Firing {len(test_df)} profiles concurrently...")
start_time = time.time()

# 3. Use ThreadPoolExecutor to blast 50 requests at the exact same time
with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
    # We map the rows to the function, and it maintains the exact order!
    rows = [row for _, row in test_df.iterrows()]
    api_predictions = list(executor.map(get_prediction, rows))

end_time = time.time()

# 4. Calculate and print the final accuracy
accuracy = accuracy_score(actual_outcomes, api_predictions) * 100

print("\n" + "=" * 40)
print(f"🔥 LIVE API ACCURACY SCORE: {accuracy:.2f}%")
print(f"⏱️  Time taken: {end_time - start_time:.2f} seconds")
print("=" * 40)
