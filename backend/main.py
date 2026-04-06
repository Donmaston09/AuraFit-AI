from __future__ import annotations

import json
import os
from typing import Literal

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class Biometrics(BaseModel):
    age: str
    weightKg: str
    heightCm: str


class WorkoutSummary(BaseModel):
    pushups: int = 0
    squats: int = 0
    situps: int = 0


class CoachRequest(BaseModel):
    provider: Literal["openai", "gemini"]
    model: str = Field(min_length=1)
    apiKey: str = Field(min_length=1)
    goals: str = Field(min_length=1)
    activityLevel: str = Field(min_length=1)
    biometrics: Biometrics
    workoutSummary: WorkoutSummary
    notes: str = ""


app = FastAPI(title="AuraFit AI Coach API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("AURAFIT_ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


SYSTEM_PROMPT = """
You are AuraFit AI, a practical and safety-conscious fitness and lifestyle coach.
You will receive workout totals, biometrics, activity level, and user goals.

Return JSON only with this exact shape:
{
  "overview": "short paragraph",
  "complementaryExercises": [
    {"name": "exercise", "instructions": "1-2 sentence instruction"}
  ],
  "mealPlan": {
    "title": "Daily meal plan",
    "items": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"]
  },
  "sleepAdvice": ["tip 1", "tip 2", "tip 3"],
  "stressAdvice": ["tip 1", "tip 2", "tip 3"],
  "disclaimer": "brief safety disclaimer"
}

Rules:
- Recommend 3 to 5 complementary exercises.
- Keep diet advice practical and non-medical.
- Tailor sleep and stress guidance to workout intensity and stated goals.
- Mention hydration and recovery when relevant.
- Never claim to diagnose or treat disease.
""".strip()


def build_user_prompt(payload: CoachRequest) -> str:
    return f"""
Create a post-workout coaching summary for this user.

Goal: {payload.goals}
Activity level: {payload.activityLevel}
Age: {payload.biometrics.age}
Weight kg: {payload.biometrics.weightKg}
Height cm: {payload.biometrics.heightCm}
Workout totals:
- Pushups: {payload.workoutSummary.pushups}
- Squats: {payload.workoutSummary.squats}
- Sit-ups: {payload.workoutSummary.situps}

Extra context:
{payload.notes or "No additional notes provided."}
""".strip()


async def call_openai(payload: CoachRequest) -> dict:
    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {payload.apiKey}",
                "Content-Type": "application/json",
            },
            json={
                "model": payload.model,
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": build_user_prompt(payload)},
                ],
                "temperature": 0.7,
            },
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text,
        )

    body = response.json()
    content = body["choices"][0]["message"]["content"]
    return json.loads(content)


async def call_gemini(payload: CoachRequest) -> dict:
    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{payload.model}:generateContent?key={payload.apiKey}"
    )

    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(
            endpoint,
            headers={"Content-Type": "application/json"},
            json={
                "system_instruction": {
                    "parts": [{"text": SYSTEM_PROMPT}],
                },
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": build_user_prompt(payload)}],
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "responseMimeType": "application/json",
                },
            },
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text,
        )

    body = response.json()
    content = body["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(content)


@app.get("/health")
async def health_check():
    return {"ok": True}


@app.post("/api/coach/analyze")
async def analyze_workout(payload: CoachRequest):
    try:
        if payload.provider == "openai":
            return await call_openai(payload)

        return await call_gemini(payload)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Model response was not valid JSON: {exc}",
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to contact provider API: {exc}",
        ) from exc
