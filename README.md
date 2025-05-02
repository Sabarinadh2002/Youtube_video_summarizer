# 🎬 AI‑Based YouTube Video Summariser

Paste any YouTube link and instantly receive:

- **Summary** (1‑2 lines)  
- **Highlights** (emoji bullet‑points)  
- **Key Insights** (take‑aways)  
- **Optional translation** into 25 + languages  
- **Text‑to‑Speech** (Play / Pause / Resume)

| Layer        | Tech stack                                                                                                 | Main file / command                                          |
|--------------|------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|
| **Back‑end** | FastAPI · Ollama (**LLaMA 3 7B** model) · Google‑Translate · YouTube‑Transcript‑API                       | `model/app.py` → `python app.py` _or_ `uvicorn model.app:app --reload` |
| **Front‑end**| Next.js (React 18) · Tailwind CSS · Framer‑Motion                                                          | `npm run dev`                                                |

---

## 1 · Quick Start

> **Prerequisites**  
> • Python 3.9+ • Node 18+ / npm 9+ • Git • Ollama (<https://ollama.ai>)

```bash
# 1 Clone the repo
git clone https://github.com/<your‑username>/yt‑summariser.git
cd yt‑summariser

# 2 Install back‑end deps
python -m venv .venv && source .venv/bin/activate   # optional
pip install -r requirements.txt

# 3 Pull the LLaMA 3.2 model (≈ 4 GB)
ollama pull llama3.2                                # first‑run only

# 4 Install front‑end deps
npm install

# 5 Open TWO terminals
# – Terminal A (back‑end on :8000)
python model/app.py          # or: uvicorn model.app:app --reload
# – Terminal B (front‑end on :3000)
npm run dev

# 6 View in browser
http://localhost:3000

2 · Back‑end 

| Block / function                            | What it does                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **`SummarizeRequest` / `TranslateRequest`** | Pydantic models that validate the JSON coming in from the front‑end.                                                           |
| **`extract_video_id`**                      | Pulls the `v=` parameter out of any YouTube URL.                                                                               |
| **`get_youtube_transcript`**                | Uses **YouTube‑Transcript‑API** to fetch auto‑captions.                                                                        |
| **`chunk_transcript`**                      | Splits very long transcripts into \~1 200‑word chunks.                                                                         |
| **`llm_raw_summary` / `llm_chunk_summary`** | Sends the text (or chunk) to **Ollama** running the LLaMA 3 model; prompts it to return “Summary / Highlights / Key Insights”. |
| **`postprocess_summary`**                   | Cleans the model’s output (removes stray phrases, normalises bullets).                                                         |
| **`parse_summary_to_json`**                 | Converts the cleaned text into JSON lists for easy use on the front‑end.                                                       |
| **`/summarize` route**                      | Full pipeline: extract ID → fetch transcript → summarise → return JSON.                                                        |
| **`/translate` route**                      | Pipes any text through Google Translate; long inputs are split into sentences to dodge length limits.                          |


3 · Front‑end in Plain English
Hero.tsx

Stores user input & component state with React useState.

Calls /summarize and, when it returns, animates “Summary / Highlights / Insights” using Framer‑Motion (the TextGenerateEffect components).

Optional /translate call sends each part through the translation endpoint.

Uses the browser’s Speech‑Synthesis API for Play / Pause / Resume.

Visual extras: Spotlight gradient background, animated headline, gradient buttons (from Aceternity UI).

All network requests hit http://localhost:8000.


5 · Environment Setup
5.1 Python packages (requirements.txt)
nginx
Copy
Edit
fastapi
uvicorn[standard]
youtube_transcript_api
ollama
deep_translator
torch      # optional: checks for CUDA GPU
bash
Copy
Edit
pip install -r requirements.txt
5.2 Node / npm packages
bash
Copy
Edit
npm install next react react-dom
npm install tailwindcss postcss autoprefixer
npm install framer-motion clsx tailwind-merge
npm install @tabler/icons-react react-icons

