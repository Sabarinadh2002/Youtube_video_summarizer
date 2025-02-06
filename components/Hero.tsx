"use client";

import React, { useState } from "react";
import { Spotlight } from "./ui/spotlight";
import { TextGenerateEffect } from "./ui/text-generate-effect";

type SummarizedData = {
  summary: string;
  highlights: string[];
  key_insights: string[];
};

// Language options for translation + TTS
const LANG_OPTIONS = [
  { label: "English (en)", value: "en" },
  { label: "Spanish (es)", value: "es" },
  { label: "French (fr)", value: "fr" },
  { label: "German (de)", value: "de" },
];

/**
 * Remove typical emojis so TTS doesn't read them as "rocket emoji," etc.
 */
function removeEmojis(str: string): string {
  return str.replace(
    /[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1FAFF}\u{2700}-\u{27BF}]+/gu,
    ""
  );
}

const Hero = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [summarizedData, setSummarizedData] = useState<SummarizedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Translation state
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translatedSummary, setTranslatedSummary] = useState("");
  const [translatedHighlights, setTranslatedHighlights] = useState<string[]>([]);
  const [translatedInsights, setTranslatedInsights] = useState<string[]>([]);

  // Handle user input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
  };

  // Summarize logic
  const handleSummarize = async () => {
    setSummarizedData(null);
    setTranslatedSummary("");
    setTranslatedHighlights([]);
    setTranslatedInsights([]);
    setError("");
    setLoading(true);

    try {
      // Directly call Python backend at localhost:8000
      const response = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: youtubeUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        // data should be { summary, highlights, key_insights }
        setSummarizedData(data);
      } else {
        setError(data.detail || data.error || "An error occurred during processing.");
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError("An error occurred while fetching the summary.");
    } finally {
      setLoading(false);
    }
  };

  // Translate logic
  const handleTranslate = async () => {
    if (!summarizedData) return;

    try {
      // 1) Translate summary
      const resSum = await fetch("http://localhost:8000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: summarizedData.summary,
          target_language: targetLanguage
        })
      });
      const dataSum = await resSum.json();
      const newSummary = dataSum.translated_text || "";

      // 2) Translate highlights
      const newHighlights: string[] = [];
      for (const h of summarizedData.highlights) {
        const resH = await fetch("http://localhost:8000/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: h,
            target_language: targetLanguage
          })
        });
        const dH = await resH.json();
        newHighlights.push(dH.translated_text);
      }

      // 3) Translate insights
      const newInsights: string[] = [];
      for (const i of summarizedData.key_insights) {
        const resI = await fetch("http://localhost:8000/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: i,
            target_language: targetLanguage
          })
        });
        const dI = await resI.json();
        newInsights.push(dI.translated_text);
      }

      setTranslatedSummary(newSummary);
      setTranslatedHighlights(newHighlights);
      setTranslatedInsights(newInsights);

    } catch (error) {
      console.error(error);
      setError("Failed to translate the text. Check console.");
    }
  };

  // Text-to-Speech function
  const handleSpeak = (text: string) => {
    if (!text) return;
    const noEmojiText = removeEmojis(text);
    const utterance = new SpeechSynthesisUtterance(noEmojiText);
    utterance.lang = targetLanguage;
    speechSynthesis.speak(utterance);
  };

  // Combine text for TTS
  const combinedTextForTTS = (): string => {
    const s = translatedSummary || summarizedData?.summary || "";
    const h = translatedHighlights.length > 0 ? translatedHighlights : (summarizedData?.highlights || []);
    const i = translatedInsights.length > 0 ? translatedInsights : (summarizedData?.key_insights || []);

    // Insert punctuation so it doesn't run together
    return `Summary: ${s}. Highlights: ${h.join(". ")}. Key Insights: ${i.join(". ")}.`;
  };

  return (
    <div className="h-screen pt-36">
      {/* Some Spotlights (optional UI) */}
      <div>
        <Spotlight className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen" fill="white" />
        <Spotlight className="h-[80vh] w-[50vw] top-10 left-full" fill="purple" />
        <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="white" />
        <Spotlight className="top-28 left-80 h-[80vh] w-[50vw]" fill="blue" />
      </div>

      <div className="flex justify-center relative my-20 z-10">
        <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          <p className="uppercase tracking-widest text-xs text-center text-blue-100 max-w-80">
            Hi,
          </p>
          <TextGenerateEffect
            className="text-center text-[40px] md:text-5xl lg:text-6xl"
            words="Watch less, learn more and fast from long videos"
          />
          <p className="text-center md:tracking-wider mb-4 text-sm md:text-lg lg:text-1xl">
            Get YouTube video summaries in a minute. Just paste the link below.
          </p>

          {/* Input + Submit Button */}
          <div className="flex items-center gap-4 mt-6">
            <input
              type="text"
              placeholder="Paste YouTube video link here"
              value={youtubeUrl}
              onChange={handleInputChange}
              className="w-80 p-2 border border-white bg-blue-600 rounded-md text-white placeholder:text-white"
            />
            <button
              onClick={handleSummarize}
              disabled={loading || !youtubeUrl}
              className="inline-flex h-12 items-center justify-center rounded-md border border-slate-800
                bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)]
                bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors
                focus:outline-none focus:ring-2 focus:ring-slate-400
                focus:ring-offset-2 focus:ring-offset-slate-50
                relative overflow-hidden"
            >
              {loading ? (
                <span className="animate-pulse">Summarizing.....</span>
              ) : (
                "Submit"
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 mt-4 text-center">
              {error}
            </p>
          )}

          {/* Summarized Data */}
          {summarizedData && (
            <div className="mt-8 p-4 bg-gray-100 rounded-md text-black w-full max-h-[500px] overflow-y-auto">
              <h2 className="text-xl font-bold mb-2">
                {translatedSummary ? "Translated Summary:" : "Summary:"}
              </h2>
              <p className="mb-4">
                {translatedSummary || summarizedData.summary}
              </p>

              <h2 className="text-xl font-bold mb-2">
                {translatedHighlights.length ? "Translated Highlights:" : "Highlights:"}
              </h2>
              <ul className="list-none mb-4">
                {(translatedHighlights.length
                  ? translatedHighlights
                  : summarizedData.highlights
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start mb-1">
                    <span className="mr-2 text-lg">{item.split(" ")[0]}</span>
                    <span>{item.replace(/^\S+\s/, "")}</span>
                  </li>
                ))}
              </ul>

              <h2 className="text-xl font-bold mb-2">
                {translatedInsights.length ? "Translated Key Insights:" : "Key Insights:"}
              </h2>
              <ul className="list-none">
                {(translatedInsights.length
                  ? translatedInsights
                  : summarizedData.key_insights
                ).map((insight, idx) => (
                  <li key={idx} className="flex items-start mb-1">
                    <span className="mr-2 text-lg">{insight.split(" ")[0]}</span>
                    <span>{insight.replace(/^\S+\s/, "")}</span>
                  </li>
                ))}
              </ul>

              {/* Language + Translate + TTS Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="language-select" className="font-semibold">
                    Language:
                  </label>
                  <select
                    id="language-select"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="border border-gray-400 rounded p-1"
                  >
                    {LANG_OPTIONS.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleTranslate}
                  className="px-4 py-2 bg-blue-600 text-white rounded shadow"
                >
                  Translate
                </button>

                <button
                  onClick={() => handleSpeak(combinedTextForTTS())}
                  className="px-4 py-2 bg-green-600 text-white rounded shadow"
                >
                  Speak
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
