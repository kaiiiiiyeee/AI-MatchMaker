from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
import joblib
import numpy as np

# Initialize the FastAPI app
app = FastAPI(title="The (Data) Knot API")

# Load the models globally when the app starts
try:
    scaler = joblib.load("dating_scaler.pkl")
    model = joblib.load("dating_rf_model.pkl")

    expected_cols = joblib.load("expected_columns.pkl")
except Exception as e:
    print(f"Error loading models: {e}")


# Define the expected incoming JSON payload from Next.js
class UserProfile(BaseModel):
    gender: str
    sexual_orientation: str
    location_type: str
    income_bracket: str
    education_level: str
    app_usage_time_min: int
    swipe_right_ratio: float
    likes_received: int
    mutual_matches: int
    profile_pics_count: int
    bio_length: int
    message_sent_count: int
    emoji_usage_rate: float
    last_active_hour: int
    swipe_time_of_day: str
    interest_tags: List[str]


@app.post("/predict")
async def predict_success(profile: UserProfile):
    try:
        # 1. Convert the incoming Pydantic object to a dictionary (Updated for Pydantic V2)
        user_data = pd.DataFrame([profile.model_dump()])

        # 2. Replicate Ordinal Encoding
        income_mapping = {
            "Very Low": 0,
            "Low": 1,
            "Lower-Middle": 2,
            "Middle": 3,
            "Upper-Middle": 4,
            "High": 5,
        }
        education_mapping = {
            "No Formal Education": 0,
            "High School": 1,
            "Bachelor’s": 2,
            "Master’s": 3,
            "PhD": 4,
            "Postdoc": 5,
        }

        user_data["income_bracket"] = (
            user_data["income_bracket"].map(income_mapping).fillna(-1)
        )
        user_data["education_level"] = (
            user_data["education_level"].map(education_mapping).fillna(-1)
        )

        # 3. Handle Interest Tags
        all_possible_interests = [
            "tech",
            "yoga",
            "sneaker culture",
            "traveling",
            "writing",
        ]
        for interest in all_possible_interests:
            user_data[interest] = 1 if interest in profile.interest_tags else 0

        user_data = user_data.drop(columns=["interest_tags"])

        # 4. One-Hot Encoding for text categories
        nominal_cols = [
            "gender",
            "sexual_orientation",
            "location_type",
            "swipe_time_of_day",
        ]
        user_data = pd.get_dummies(user_data, columns=nominal_cols)

        # 5. Column Alignment (CRITICAL)
        # You must define expected_cols or load it via joblib for this to work
        user_data = user_data.reindex(columns=expected_cols, fill_value=0)

        # 6. Apply Standard Scaling
        user_data_scaled = scaler.transform(user_data)

        # 7. Make the Prediction
        prediction_probabilities = model.predict_proba(user_data_scaled)
        success_probability = round(prediction_probabilities[0][1] * 100, 2)

        # 8. Return the payload
        return {
            "status": "success",
            "match_probability_percentage": success_probability,
            "message": f"Your profile has a {success_probability}% chance of generating a mutual match.",
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


from fastapi.middleware.cors import CORSMiddleware

# Allow Next.js to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
