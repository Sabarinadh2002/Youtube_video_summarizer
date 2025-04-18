"use client";

import React, { useState } from "react";
import { Spotlight } from "./ui/spotlight";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import { TextGenerateEffectSu } from "./ui/text-generate-effect-sum";

// Define the shape of the summary data from your backend
type SummarizedData = {
  summary: string;
  highlights: string[];
  key_insights: string[];
};

const LANG_OPTIONS = [
  { label: "English (en)", value: "en" },
  { label: "Spanish (es)", value: "es" },
  { label: "French (fr)", value: "fr" },
  { label: "German (de)", value: "de" },
];

/**
 * Remove typical emojis so the TTS engine doesn't say "rocket emoji", etc.
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

  // States for sequential display
  const [showSummary, setShowSummary] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
  };

  // Function to reveal sections sequentially
  const revealSections = () => {
    setTimeout(() => {
      setShowSummary(true);
      setTimeout(() => {
        setShowHighlights(true);
        setTimeout(() => {
          setShowInsights(true);
        }, 500);
      }, 500);
    }, 300);
  };

  // Summarize logic: call backend and then reveal sections sequentially.
  const handleSummarize = async () => {
    setSummarizedData(null);
    setTranslatedSummary("");
    setTranslatedHighlights([]);
    setTranslatedInsights([]);
    setShowSummary(false);
    setShowHighlights(false);
    setShowInsights(false);
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: youtubeUrl }),
      });
      const data = await response.json();
      if (response.ok) {
        setSummarizedData(data);
        revealSections();
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
      // Translate summary
      const resSum = await fetch("http://localhost:8000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: summarizedData.summary,
          target_language: targetLanguage,
        }),
      });
      const dataSum = await resSum.json();
      console.log("Translation response for summary:", dataSum);
      const newSummary = dataSum.translated_text || "";

      // Translate highlights
      const newHighlights: string[] = [];
      for (const h of summarizedData.highlights) {
        const resH = await fetch("http://localhost:8000/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: h,
            target_language: targetLanguage,
          }),
        });
        const dH = await resH.json();
        console.log("Translation response for highlight:", dH);
        newHighlights.push(dH.translated_text);
      }

      // Translate key insights
      const newInsights: string[] = [];
      for (const i of summarizedData.key_insights) {
        const resI = await fetch("http://localhost:8000/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: i,
            target_language: targetLanguage,
          }),
        });
        const dI = await resI.json();
        console.log("Translation response for key insight:", dI);
        newInsights.push(dI.translated_text);
      }

      setTranslatedSummary(newSummary);
      setTranslatedHighlights(newHighlights);
      setTranslatedInsights(newInsights);
    } catch (error) {
      console.error("Translation error:", error);
      setError("Failed to translate the text. Check console.");
    }
  };

  // Text-to-Speech (removes emoji descriptions)
  const handleSpeak = (text: string) => {
    if (!text) return;
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    const noEmojiText = removeEmojis(text);
    const utterance = new SpeechSynthesisUtterance(noEmojiText);
    utterance.lang = targetLanguage;
    speechSynthesis.speak(utterance);
  };

  // New functions for Pause and Resume
  const handlePauseSpeech = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  };

  const handleResumeSpeech = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  };

  // Combine text for TTS
  const combinedTextForTTS = (): string => {
    const s = translatedSummary || (summarizedData?.summary || "");
    const h =
      translatedHighlights.length > 0 ? translatedHighlights : (summarizedData?.highlights || []);
    const i =
      translatedInsights.length > 0 ? translatedInsights : (summarizedData?.key_insights || []);
    return `Summary: ${s}. Highlights: ${h.join(". ")}. Key Insights: ${i.join(". ")}.`;
  };

  return (
    <div className="min-h-screen pt-36 pb-16">
      {/* Decorative Spotlights */}
      <div>
    <Spotlight className='-top-40 -left-10
    md:-left-32 md:-top-20 h-screen' fill='white'/>
    <Spotlight className='top-10 left-full
    h-[80vh] w-[50vw]' fill='purple'/>
    <Spotlight className='top-28 left-80
    h-[80vh] w-[50vw]' fill='blue'/>

    </div>

    <div className="h-screen w-full dark:bg-black-100 bg-white  dark:bg-grid-white/[0.03] bg-grid-black/[0.2]  flex items-center justify-center absolute top-0 left-0">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black-100 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
    </div>
    <div className='flex justify-center relative
     my-20 z-10'>
     <div className='max-w-[89vw] md:max-w-2xl
      lg:max-w-[60vw] flex flex-col items-center justify-center'>
      <h2 className='uppercase tracking-widest
       text-xs text-center text-blue-100 max-w-80'>
        Dynamic Web Magic 
      </h2>
          <TextGenerateEffectSu
            className="text-center text-[40px]"
            words="Watch less, learn more and fast from long videos"
          />
          <p className="text-center md:tracking-wider mb-4 text-sm">
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
              className="inline-flex h-12 items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 relative overflow-hidden"
            >
              {loading ? (
                <span className="animate-pulse">Summarizing.....</span>
              ) : (
                "Submit"
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 mt-4 text-center">{error}</p>
          )}

          {/* Summarized Data Section */}
          {summarizedData && (
            <div
              className="mt-8 p-4 rounded-md w-full max-h-[500px] overflow-y-auto"
              style={{ backgroundColor: "transparent", border: "4px solid white" }}
            >
              {/* Summary Section */}
              <h2 className="text-lg font-bold mb-2">
                {translatedSummary ? "Translated Summary:" : "Summary:"}
              </h2>
              {showSummary ? (
                <TextGenerateEffect
                  words={translatedSummary || summarizedData.summary}
                  className="mb-4 text-base"
                  duration={0.5}
                />
              ) : (
                <p className="mb-4 italic text-base">Loading summary...</p>
              )}

              {/* Highlights Section */}
              <h2 className="text-lg font-bold mb-2">
                {translatedHighlights.length ? "Translated Highlights:" : "Highlights:"}
              </h2>
              {showHighlights ? (
                <ul className="list-none mb-4 text-base">
                  {(translatedHighlights.length
                    ? translatedHighlights
                    : summarizedData.highlights
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-start mb-1">
                      <span className="mr-2 text-base">{item.split(" ")[0]}</span>
                      <TextGenerateEffect
                        words={item.replace(/^\S+\s/, "")}
                        duration={0.5}
                        className="text-base"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="italic mb-4 text-base">Loading highlights...</p>
              )}

              {/* Key Insights Section */}
              <h2 className="text-lg font-bold mb-2">
                {translatedInsights.length ? "Translated Key Insights:" : "Key Insights:"}
              </h2>
              {showInsights ? (
                <ul className="list-none text-base">
                  {(translatedInsights.length
                    ? translatedInsights
                    : summarizedData.key_insights
                  ).map((insight, idx) => (
                    <li key={idx} className="flex items-start mb-1">
                      <span className="mr-2 text-base">{insight.split(" ")[0]}</span>
                      <TextGenerateEffect
                        words={insight.replace(/^\S+\s/, "")}
                        duration={0.5}
                        className="text-base"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-base">Loading key insights...</p>
              )}
            </div>
          )}

          {/* Fixed Controls Section (Outside the scrollable container) */}
          {summarizedData && (
            <div className="mt-4 flex flex-col sm:flex-row gap-4 p-4 bg-black/70">
              <div className="flex items-center gap-2">
                <label htmlFor="language-select" className="font-semibold text-sm text-white">
                  Language:
                </label>
                <select
                  id="language-select"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="border border-gray-400 rounded p-1 text-sm"
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
                className="px-4 py-2 bg-blue-600 text-white rounded shadow text-sm"
              >
                Translate
              </button>

              <button
                onClick={() => handleSpeak(combinedTextForTTS())}
                className="px-4 py-2 bg-green-600 text-white rounded shadow text-sm"
              >
                Speak
              </button>

              {/* Popup buttons for Pause and Resume */}
              <div className="flex gap-2">
                <button
                  onClick={handlePauseSpeech}
                  className="px-3 py-2 bg-yellow-600 text-white rounded shadow text-sm"
                >
                  Pause
                </button>
                <button
                  onClick={handleResumeSpeech}
                  className="px-3 py-2 bg-indigo-600 text-white rounded shadow text-sm"
                >
                  Resume
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
