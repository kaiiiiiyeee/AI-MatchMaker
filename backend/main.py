from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
import joblib
import numpy as np
import sys
from fastapi.middleware.cors import CORSMiddleware


# Initialize the FastAPI app
app = FastAPI(title="The (Data) Knot API")


# 1. Define the tokenizer function
def custom_tokenizer(text):
    return [tag.strip() for tag in str(text).split(",")]


# 2. INJECT into the active __main__ module namespace so joblib/pickle can locate it
import __main__

__main__.custom_tokenizer = custom_tokenizer
sys.modules["__main__"].custom_tokenizer = custom_tokenizer


# Load the Scaler, the SMOTE Model, Feature Columns, and the Vectorizer
try:
    scaler = joblib.load("dating_scaler.pkl")
    model = joblib.load("dating_rf_model_smote.pkl")
    expected_cols = joblib.load("feature_columns.pkl")
    # This will now successfully look up the injected function name!
    vectorizer = joblib.load("interest_vectorizer.pkl")

except Exception as e:
    import traceback

    print("====== ERROR CRASH REPORT ======")
    traceback.print_exc()
    print("================================")
    raise HTTPException(status_code=400, detail=str(e))


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
        # Convert the incoming Pydantic object to a dictionary
        user_data = pd.DataFrame([profile.model_dump()])

        # Replicate Ordinal Encoding
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

        # ---------------------------------------------------------
        # ALIGNED INTEREST PROCESSING (Using training vectorizer)
        # ---------------------------------------------------------
        # Join the list of tags into a single comma-separated string
        interest_string = ", ".join(profile.interest_tags)

        # Transform using the exported vectorizer and convert to DataFrame
        interest_counts = vectorizer.transform([interest_string]).toarray()
        interest_df = pd.DataFrame(
            interest_counts, columns=vectorizer.get_feature_names_out()
        )

        # Combine back with the primary user data and drop the raw tags column
        user_data = pd.concat(
            [user_data.drop(columns=["interest_tags"]), interest_df], axis=1
        )
        # ---------------------------------------------------------

        # One-Hot Encoding for text categories
        nominal_cols = [
            "gender",
            "sexual_orientation",
            "location_type",
            "swipe_time_of_day",
        ]

        # FIXED: Added drop_first=True to match your training code
        user_data = pd.get_dummies(user_data, columns=nominal_cols, drop_first=True)

        # Column Alignment
        # This automatically aligns the features and fills missing ones with 0
        user_data = user_data.reindex(columns=expected_cols, fill_value=0)

        # Apply Standard Scaling
        user_data_scaled = scaler.transform(user_data)

        # Make the Prediction using the SMOTE model
        prediction_probabilities = model.predict_proba(user_data_scaled)
        success_probability = round(prediction_probabilities[0][1] * 100, 2)

        return {
            "status": "success",
            "match_probability_percentage": success_probability,
            "message": f"Your profile has a {success_probability}% chance of generating a mutual match.",
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Allow Next.js to talk to FastAPI
# Allow Next.js to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
