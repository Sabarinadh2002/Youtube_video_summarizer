# AI-Based YouTube Video Summarizer

A full‑stack web app that lets users paste a YouTube link and instantly get:
- A concise **Summary**  
- Key **Highlights**  
- Actionable **Insights**  
- **Multilingual** translation  
- **Text‑to‑Speech** playback with Play/Pause/Resume controls  

Built with a FastAPI + Ollama + GoogleTranslator backend and a Next.js/React + Tailwind + Framer Motion frontend.

---

## 📁 Project Structure

├── model/ # Backend
│ ├── app.py # FastAPI server
│ └── requirements.txt # Python deps
├── components/ # Frontend React components
│ ├── Hero.tsx # Main UI
│ ├── Spotlight.tsx
│ ├── text-generate-effect.tsx
│ └── …
├── pages/ # Next.js pages
│ └── index.tsx
├── public/ # Static assets
└── package.json # Frontend deps & scripts

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/your‑username/yt‑summarizer.git
cd yt‑summarizer

2. Backend setup

cd model
python3 -m venv .venv
source .venv/bin/activate        # on Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

Run the FastAPI server:

bash
Copy
Edit
uvicorn app:app --reload --host 0.0.0.0 --port 8000
Endpoints:

POST /summarize

POST /translate

3. Frontend setup
Open a new terminal:

bash
Copy
Edit
cd ../
npm install
Run the Next.js dev server:

bash
Copy
Edit
npm run dev
By default, it opens at http://localhost:3000.

⚙️ How to Use
Paste a YouTube URL into the input box.

Click Submit — the backend fetches the transcript, chunks it if needed, and calls Ollama’s Llama 3.2 model to generate:

Summary

Highlights

Key Insights

Optionally select a target language and click Translate.

Click Speak to hear the summary read aloud; use Pause/ Resume to control playback.

📦 Dependencies
Backend (model/requirements.txt)
txt
Copy
Edit
fastapi
uvicorn
youtube-transcript-api
ollama
deep-translator
torch
python-dotenv
Frontend (package.json)
json
Copy
Edit
{
  "dependencies": {
    "next": "latest",
    "react": "^18.x",
    "react-dom": "^18.x",
    "framer-motion": "^7.x",
    "clsx": "^1.x",
    "tailwind-merge": "^1.x",
    "tailwindcss": "^3.x",
    "typescript": "^5.x"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
Install all with:

bash
Copy
Edit
npm install
🔧 Configuration
CORS in app.py allows requests from http://localhost:3000.

Model: Llama 3.2 via Ollama.

Translator: deep-translator (Google Translate).

TTS: Browser’s built‑in SpeechSynthesis API (no extra setup).

📚 Further Reading
FastAPI

YouTube Transcript API

Ollama

Next.js

Tailwind CSS

Framer Motion

🤝 Contributing
Feel free to open issues or PRs. Please follow standard GitHub flow.
