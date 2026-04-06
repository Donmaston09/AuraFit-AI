# AuraFit AI

AuraFit AI is a mobile-responsive fitness web app built with React, Vite, Tailwind CSS, Framer Motion, Mediapipe Pose Landmarker, and FastAPI.

## Creator

- Anthony Onoja
- School of Health Sciences, University of Surrey
- Email: donmaston09@gmail.com

## Support the mission

Support my work: I am raising funds for internally displaced children across Middle Belt Nigeria as a result of the ongoing genocide to fund access to education and AI literacy.

- PayPal: [paypal.me/Onoja412](https://paypal.me/Onoja412)

## What it does

- Starts with the front-facing camera and lets users switch between front and rear cameras on supported phones
- Runs pose estimation entirely client-side for privacy
- Tracks real-time reps for pushups, squats, and sit-ups
- Shows live form feedback on top of the camera feed
- Sends only workout totals and user inputs to a stateless backend
- Generates complementary exercise ideas, meal guidance, sleep tips, and stress habits with a BYOK OpenAI or Gemini flow

## Privacy and safety

- Video is not recorded or stored
- Pose estimation happens in the browser
- API keys are supplied by the user at request time and forwarded through the stateless backend for that single request
- Recommendations are informational only and should not replace professional advice

## Frontend stack

- React 19 + Vite
- Tailwind CSS 4
- Framer Motion
- `@mediapipe/tasks-vision`
- `@tensorflow/tfjs`

## Backend stack

- FastAPI
- HTTPX
- Uvicorn

## Local setup

### Frontend

1. Install dependencies:

```bash
npm install
```

2. Start the frontend:

```bash
npm run dev
```

3. Optional: set a backend URL in a `.env` file:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Backend

1. Create a virtual environment and install dependencies:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Start FastAPI locally:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3. Open the frontend and paste your own OpenAI or Gemini API key into the coaching form.

## Deployment

### GitHub

1. Create a new GitHub repository.
2. In your terminal:

```bash
cd /Users/ao0028/Desktop/AuraFit-AI
git init
git add .
git commit -m "Initial AuraFit AI app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Render

This repo now includes a root Blueprint file at [`render.yaml`](/Users/ao0028/Desktop/AuraFit-AI/render.yaml) so you can deploy both the frontend and backend from the same GitHub repo.

1. Push the project to GitHub.
2. In Render, click `New +` -> `Blueprint`.
3. Connect your GitHub repository.
4. Render will detect `render.yaml` and propose two services:
   - `aurafit-ai-api` for FastAPI
   - `aurafit-ai-web` for the React frontend
5. During setup, provide:
   - `AURAFIT_ALLOWED_ORIGINS` = your frontend Render URL, for example `https://aurafit-ai-web.onrender.com`
   - `VITE_API_BASE_URL` = your backend Render URL, for example `https://aurafit-ai-api.onrender.com`
6. Finish the Blueprint deploy and wait for both services to go live.

Important:
- `VITE_API_BASE_URL` is intentionally marked `sync: false` in the Blueprint, so Render will ask for it during the initial setup instead of hardcoding it in the repo.
- If your frontend URL changes later, update both `VITE_API_BASE_URL` on the static site and `AURAFIT_ALLOWED_ORIGINS` on the backend, then redeploy.
- Optional overrides: `VITE_MEDIAPIPE_MODEL_ASSET_URL` and `VITE_MEDIAPIPE_WASM_ROOT` let you self-host Mediapipe assets instead of relying on the default CDNs.

### Manual Render setup instead of Blueprint

If you prefer not to use a Blueprint, Render’s docs also support creating a [Static Site](https://render.com/docs/static-sites) for the frontend and a separate web service for the backend.

## Notes

- The pose detector downloads the Mediapipe model at runtime
- The current rep counting logic is angle-threshold based, which is lightweight and fast for an MVP but may need calibration for different body types and camera angles
- Render Blueprints should live in the repo root as a single `render.yaml`, and Render recommends managing each service with only one Blueprint
