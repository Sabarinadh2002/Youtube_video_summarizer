import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from youtube_transcript_api import YouTubeTranscriptApi
import ollama
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import urlparse, parse_qs

import torch

print("Is CUDA available?", torch.cuda.is_available())
if torch.cuda.is_available():
    print("GPU Name:", torch.cuda.get_device_name(0))
else:
    print("No CUDA-capable GPU detected.")

# Using deep_translator for translation
from deep_translator import GoogleTranslator

app = FastAPI()

# Allow requests from Next.js on http://localhost:3000
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

###############################################################################
# Pydantic models for request bodies
###############################################################################
class SummarizeRequest(BaseModel):
    youtube_url: str
    model_name: Optional[str] = "llama3.2"

class TranslateRequest(BaseModel):
    text: str
    target_language: str

###############################################################################
# Helper: Extract video ID from URL
###############################################################################
def extract_video_id(url: str) -> Optional[str]:
    try:
        parsed = urlparse(url)
        query_params = parse_qs(parsed.query)
        return query_params.get('v', [None])[0]
    except Exception as e:
        print(f"[DEBUG] Error extracting video ID: {e}")
        return None

###############################################################################
# Helper: Fetch transcript from YouTube
###############################################################################
def get_youtube_transcript(youtube_url: str) -> str:
    video_id = extract_video_id(youtube_url)
    if not video_id:
        raise ValueError("Invalid YouTube URL. Couldn't extract video ID.")
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
        transcript_text = " ".join([seg['text'] for seg in transcript_list])
        print("\n[DEBUG] Transcript fetched (first 300 chars):")
        print(transcript_text[:300])
        return transcript_text
    except Exception as e:
        raise RuntimeError(f"Could not fetch transcript: {e}")

###############################################################################
# Helper: Chunk the transcript if it's too large
###############################################################################
def chunk_transcript(transcript: str, chunk_size: int = 1200) -> List[str]:
    words = transcript.split()
    chunks = []
    start_idx = 0
    while start_idx < len(words):
        end_idx = start_idx + chunk_size
        chunk = " ".join(words[start_idx:end_idx])
        chunks.append(chunk)
        start_idx = end_idx
    return chunks

###############################################################################
# Summarization functions
###############################################################################
def summarize_long_transcript(transcript: str, model_name: str) -> dict:
    text_chunks = chunk_transcript(transcript, chunk_size=1200)
    all_highlights = []
    all_insights = []
    summary_for_first_chunk = ""
    for i, chunk_text in enumerate(text_chunks):
        print(f"[DEBUG] Summarizing chunk {i+1}/{len(text_chunks)} (approx {len(chunk_text.split())} words)")
        partial_summary = llm_chunk_summary(chunk_text, model_name)
        cleaned = postprocess_summary(partial_summary)
        chunk_data = parse_summary_to_json(cleaned)
        all_highlights.extend(chunk_data.get("highlights", []))
        all_insights.extend(chunk_data.get("key_insights", []))
        if i == 0:
            summary_for_first_chunk = chunk_data.get("summary", "")
    result = {
        "summary": summary_for_first_chunk,
        "highlights": all_highlights,
        "key_insights": all_insights
    }
    return result

def llm_chunk_summary(chunk_text: str, model_name: str) -> str:
    prompt = (
        "You are an AI assistant. Summarize the following portion of a YouTube transcript into three sections. "
        "Use as many bullet points as needed if this chunk is large. Each bullet point starts with a relevant emoji:\n\n"
        "Summary:\n"
        "Highlights:\n"
        "Key Insights:\n\n"
        f"Chunk:\n{chunk_text}\n\n"
        "Format the output EXACTLY as:\n\n"
        "Summary: [short summary]\n\n"
        "Highlights:\n"
        "- 🚀 bullet 1\n"
        "- 📈 bullet 2\n"
        "\n"
        "Key Insights:\n"
        "- 🔍 bullet 1\n"
        "- 💡 bullet 2\n"
    )
    response = ollama.generate(
        model=model_name,
        prompt=prompt
    )
    raw_output = response.get("response", "")
    return raw_output

def llm_raw_summary(text: str, model_name: str) -> str:
    prompt = (
        "You are an AI assistant. Summarize the following YouTube transcript into three sections. "
        "Use as many bullet points as needed if the transcript is large. Each bullet point starts with a relevant emoji:\n\n"
        "Summary:\n"
        "[1-2 lines overview. No bullet points here.]\n\n"
        "Highlights:\n"
        "[Bullet points for key events, each with relevant emoji.]\n\n"
        "Key Insights:\n"
        "[Bullet points for deeper implications or lessons, each with relevant emoji.]\n\n"
        f"Transcript:\n{text}\n\n"
        "Format the output EXACTLY as:\n\n"
        "Summary: [short summary]\n\n"
        "Highlights:\n"
        "- 🚀 bullet 1\n"
        "- 📈 bullet 2\n"
        "\n"
        "Key Insights:\n"
        "- 🔍 bullet 1\n"
        "- 💡 bullet 2\n"
    )
    response = ollama.generate(
        model=model_name,
        prompt=prompt
    )
    raw_output = response.get("response", "")
    return raw_output

def summarize_text(text: str, model_name: str = "llama3.2") -> dict:
    words = text.split()
    if len(words) > 1800:
        return summarize_long_transcript(text, model_name)
    else:
        raw_summary = llm_raw_summary(text, model_name)
        print("\n[DEBUG] Raw LLM output (first 300 chars):")
        print(raw_summary[:300])
        final_summary = postprocess_summary(raw_summary)
        print("\n[DEBUG] Final post-processed summary (first 300 chars):")
        print(final_summary[:300])
        return parse_summary_to_json(final_summary)

def postprocess_summary(llm_output: str) -> str:
    disallowed_phrases = [
        "Here are the 3 sections:",
        "****",
        "Here is the summarized transcript in three sections:",
        "Here is the summary, highlights, and key insights in the requested format:",
    ]
    for phrase in disallowed_phrases:
        llm_output = llm_output.replace(phrase, "")
    sections = llm_output.split("Highlights:")
    if len(sections) < 2:
        return llm_output.strip()
    summary_part = sections[0].replace("Summary:", "").strip()
    summary_part = summary_part.replace('*', '').strip()
    summary_part = summary_part.replace('transcript', 'video').strip()
    hi_split = sections[1].split("Key Insights:")
    highlights_part = hi_split[0].strip()
    key_insights_part = hi_split[1].strip() if len(hi_split) > 1 else ""
    def clean_bullets(text_block: str) -> str:
        lines = text_block.split('\n')
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            if line.startswith('*'):
                line = line.lstrip('*').strip()
            elif line.startswith('-'):
                line = line.lstrip('-').strip()
            if line:
                cleaned_lines.append(f"- {line}")
        return "\n".join(cleaned_lines)
    highlights_bullets = clean_bullets(highlights_part)
    insights_bullets = clean_bullets(key_insights_part)
    final_output = (
        f"Summary:\n{summary_part}\n\n"
        f"Highlights:\n{highlights_bullets}\n\n"
        f"Key Insights:\n{insights_bullets}"
    )
    return final_output.strip()

def parse_summary_to_json(final_summary: str) -> dict:
    result = {
        "summary": "",
        "highlights": [],
        "key_insights": []
    }
    try:
        summary_split = final_summary.split("Highlights:")
        summary_text = summary_split[0].replace("Summary:", "").strip()
        if len(summary_split) < 2:
            result["summary"] = summary_text
            return result
        highlights_split = summary_split[1].split("Key Insights:")
        highlights_text = highlights_split[0].strip()
        key_insights_text = ""
        if len(highlights_split) > 1:
            key_insights_text = highlights_split[1].strip()
        result["summary"] = summary_text
        def extract_bullets(text_block: str):
            lines = text_block.split('\n')
            bullets = []
            for line in lines:
                if line.startswith('- '):
                    bullet = line[2:].strip()
                    bullets.append(bullet)
            return bullets
        result["highlights"] = extract_bullets(highlights_text)
        result["key_insights"] = extract_bullets(key_insights_text)
    except Exception as e:
        print("[DEBUG] Error parsing summary to JSON:", e)
        result["summary"] = final_summary.strip()
    return result

###############################################################################
# Summarize Endpoint
###############################################################################
@app.post("/summarize")
def summarize_route(req: SummarizeRequest):
    youtube_url = req.youtube_url
    model = req.model_name
    print(f"\n[DEBUG] Summarize request for: {youtube_url} using model: {model}")
    try:
        transcript = get_youtube_transcript(youtube_url)
    except Exception as e:
        print("[DEBUG] Error fetching transcript:", e)
        raise HTTPException(status_code=400, detail=str(e))
    try:
        data = summarize_text(transcript, model)
        return data
    except Exception as e:
        print("[DEBUG] Summarization error:", e)
        raise HTTPException(status_code=500, detail=str(e))

###############################################################################
# Translation Endpoint with Debug Logging
###############################################################################
@app.post("/translate")
def translate_text(req: TranslateRequest):
    try:
        translator = GoogleTranslator(source='auto', target=req.target_language)
        # If text is too long, split it into sentences and translate each
        let_text = req.text
        if len(let_text) > 500:
            sentences = let_text.split('. ')
            translated_sentences = []
            for sentence in sentences:
                trans = translator.translate(sentence)
                translated_sentences.append(trans)
            translated_text = '. '.join(translated_sentences)
        else:
            translated_text = translator.translate(let_text)
        print(f"\n[DEBUG] Translated text (target {req.target_language}):")
        print(translated_text)
        return {"translated_text": translated_text}
    except Exception as e:
        print(f"[DEBUG] Translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

###############################################################################
# Main
###############################################################################
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
