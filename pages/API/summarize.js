// pages/api/summarize.js

import { HfInference } from '@huggingface/inference';
import { getSubtitles } from 'youtube-captions-scraper';

function isValidYoutubeUrl(url) {
  const regex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
  return regex.test(url);
}

function extractVideoId(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v');
  } catch (error) {
    throw new Error('Invalid YouTube URL');
  }
}

async function getVideoTranscript(youtubeUrl) {
  const videoId = extractVideoId(youtubeUrl);

  try {
    const captions = await getSubtitles({ videoID: videoId, lang: 'en' });
    const transcript = captions.map((caption) => caption.text).join(' ');
    return transcript;
  } catch (error) {
    throw new Error('Captions not available for this video.');
  }
}

async function summarizeText(text) {
  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  const maxChunkSize = 500;
  const textChunks = text.match(new RegExp(`(.|[\r\n]){1,${maxChunkSize}}`, 'g'));
  const summaries = [];

  for (const chunk of textChunks) {
    const result = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: chunk,
    });
    summaries.push(result.summary_text);
  }

  return summaries.join(' ');
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { youtubeUrl } = req.body;

    if (!isValidYoutubeUrl(youtubeUrl)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
      const transcript = await getVideoTranscript(youtubeUrl);

      if (!transcript) {
        throw new Error('Transcript could not be retrieved.');
      }

      const summary = await summarizeText(transcript);

      // Print the summary to the server's terminal/logs
      console.log('Generated Summary:', summary);

      res.status(200).json({ summary });
    } catch (error) {
      console.error('Error in processing:', error);
      res.status(500).json({ error: error.message || 'An error occurred during processing.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
