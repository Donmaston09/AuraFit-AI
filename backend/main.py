from __future__ import annotations

import json
import os
from typing import Literal

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator


class Biometrics(BaseModel):
    age: int = Field(ge=13, le=120)
    weightKg: float = Field(gt=20, le=400)
    heightCm: float = Field(gt=90, le=260)


class WorkoutSummary(BaseModel):
    pushups: int = Field(default=0, ge=0, le=5000)
    squats: int = Field(default=0, ge=0, le=5000)
    situps: int = Field(default=0, ge=0, le=5000)


class CoachRequest(BaseModel):
    provider: Literal["openai", "gemini"]
    model: str = Field(min_length=1)
    apiKey: str = Field(min_length=1)
    goals: Literal["strength", "weight-loss", "mobility"]
    activityLevel: Literal["light", "moderate", "high"]
    biometrics: Biometrics
    workoutSummary: WorkoutSummary
    notes: str = Field(default="", max_length=1200)
    useWebResearch: bool = True
    timezone: str | None = Field(default=None, max_length=80)

    @field_validator("model", "apiKey", mode="before")
    @classmethod
    def strip_required_strings(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("Must be a string.")

        value = value.strip()
        if not value:
            raise ValueError("Cannot be empty.")
        return value

    @field_validator("notes", mode="before")
    @classmethod
    def normalize_notes(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else ""

    @field_validator("timezone", mode="before")
    @classmethod
    def normalize_timezone(cls, value: str | None) -> str | None:
        if value is None:
            return None

        if not isinstance(value, str):
            return None

        value = value.strip()
        return value or None


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


def build_research_prompt(payload: CoachRequest) -> str:
    return f"""
You are preparing fresh, internet-grounded fitness guidance for a completed workout.

User goal: {payload.goals}
Activity level: {payload.activityLevel}
Age: {payload.biometrics.age}
Weight kg: {payload.biometrics.weightKg}
Height cm: {payload.biometrics.heightCm}
Workout totals:
- Pushups: {payload.workoutSummary.pushups}
- Squats: {payload.workoutSummary.squats}
- Sit-ups: {payload.workoutSummary.situps}

Context:
{payload.notes or "No additional notes provided."}

Search the web for current, reputable advice and return a concise response with:
1. a short paragraph of fresh recommendations tailored to this user,
2. 3 bullet-style action points covering training, nutrition, and recovery,
3. only practical, non-medical advice.
""".strip()


def provider_error_message(response: httpx.Response) -> str:
    if response.status_code in {401, 403}:
        return "Provider rejected the request. Check your API key and model access."

    if 400 <= response.status_code < 500:
        return "Provider could not process the request. Check the selected model and request inputs."

    return "Provider service is temporarily unavailable. Please try again in a moment."


def unique_sources(sources: list[dict]) -> list[dict]:
    seen: set[str] = set()
    unique: list[dict] = []

    for source in sources:
        url = source.get("url")
        if not url or url in seen:
            continue

        seen.add(url)
        unique.append(
            {
                "title": source.get("title") or url,
                "url": url,
            }
        )

    return unique[:6]


def extract_openai_sources(body: dict) -> list[dict]:
    sources: list[dict] = []

    for item in body.get("output", []):
        if item.get("type") != "message":
            continue

        for content in item.get("content", []):
            for annotation in content.get("annotations", []):
                if annotation.get("type") == "url_citation":
                    sources.append(
                        {
                            "title": annotation.get("title") or annotation.get("url"),
                            "url": annotation.get("url"),
                        }
                    )

    return unique_sources(sources)


def extract_gemini_sources(body: dict) -> list[dict]:
    chunks = body.get("candidates", [{}])[0].get("groundingMetadata", {}).get("groundingChunks", [])
    sources: list[dict] = []

    for chunk in chunks:
        web = chunk.get("web")
        if not web:
            continue
        sources.append(
            {
                "title": web.get("title") or web.get("uri"),
                "url": web.get("uri"),
            }
        )

    return unique_sources(sources)


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
            status_code=response.status_code if response.status_code < 500 else 502,
            detail=provider_error_message(response),
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
            status_code=response.status_code if response.status_code < 500 else 502,
            detail=provider_error_message(response),
        )

    body = response.json()
    content = body["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(content)


async def call_openai_research(payload: CoachRequest) -> dict:
    request_body = {
        "model": payload.model,
        "input": build_research_prompt(payload),
        "tools": [{"type": "web_search"}],
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            "https://api.openai.com/v1/responses",
            headers={
                "Authorization": f"Bearer {payload.apiKey}",
                "Content-Type": "application/json",
            },
            json=request_body,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code if response.status_code < 500 else 502,
            detail=provider_error_message(response),
        )

    body = response.json()
    return {
        "enabled": True,
        "provider": "openai",
        "summary": body.get("output_text", "").strip(),
        "sources": extract_openai_sources(body),
    }


async def call_gemini_research(payload: CoachRequest) -> dict:
    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{payload.model}:generateContent?key={payload.apiKey}"
    )

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            endpoint,
            headers={"Content-Type": "application/json"},
            json={
                "tools": [{"google_search": {}}],
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": build_research_prompt(payload)}],
                    }
                ],
                "generationConfig": {
                    "temperature": 0.6,
                },
            },
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code if response.status_code < 500 else 502,
            detail=provider_error_message(response),
        )

    body = response.json()
    summary = body["candidates"][0]["content"]["parts"][0]["text"].strip()
    return {
        "enabled": True,
        "provider": "gemini",
        "summary": summary,
        "sources": extract_gemini_sources(body),
    }


@app.get("/health")
async def health_check():
    return {"ok": True}


@app.get("/")
async def root():
    return {
        "service": "AuraFit AI Coach API",
        "status": "ok",
        "health": "/health",
        "analyze": "/api/coach/analyze",
    }


@app.post("/api/coach/analyze")
async def analyze_workout(payload: CoachRequest):
    try:
        if payload.provider == "openai":
            coaching = await call_openai(payload)
            research = (
                await call_openai_research(payload)
                if payload.useWebResearch
                else {"enabled": False, "provider": "openai", "summary": "", "sources": []}
            )
            return {**coaching, "liveResearch": research}

        coaching = await call_gemini(payload)
        research = (
            await call_gemini_research(payload)
            if payload.useWebResearch
            else {"enabled": False, "provider": "gemini", "summary": "", "sources": []}
        )
        return {**coaching, "liveResearch": research}
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
