# 🎬 AI‑Based YouTube Video Summariser

This project lets you **paste any YouTube link** and instantly receive:

* **Summary** (1‑2 lines)  
* **Highlights** (emoji‑bullet key points)  
* **Key Insights** (take‑aways)  
* **Optional translation** into 25 + languages  
* **Text‑to‑Speech** (Play / Pause / Resume)

The system is split into two parts:

| Layer | Tech | Main file/command |
|-------|------|-------------------|
| **Back‑end** | FastAPI + Ollama (running the **LLaMA 3 7B** model), Google‑Translate, YouTube‑Transcript‑API | `model/app.py` → `python app.py` or `uvicorn app:app --reload` |
| **Front‑end** | Next.js (React 18), Tailwind CSS, Framer‑Motion | `npm run dev` |

---

## 1 . Quick start

> **Prerequisites**  
> • Python 3.9+ • Node 18+ / npm 9+ • Git • Ollama (local LLM runtime – <https://ollama.ai>)

```bash
# 1. Clone the repo
git clone https://github.com/<your‑username>/yt‑summariser.git
cd yt‑summariser

# 2. Install back‑end deps
python -m venv .venv && source .venv/bin/activate   # optional virtual‑env
pip install -r requirements.txt                     # or use the list below

# 3. Pull the LLaMA 3.2 model (≈ 4 GB) for Ollama
ollama pull llama3.2                                # first‑run only

# 4. Install front‑end deps
npm install                                         # grabs React, Next, Tailwind, etc.

# 5. Open TWO terminals
# ── Terminal A – start FastAPI (port 8000)
python model/app.py                                 # or: uvicorn model.app:app --reload
# ── Terminal B – start Next.js (port 3000)
npm run dev

# 6. Visit http://localhost:3000  🎉
