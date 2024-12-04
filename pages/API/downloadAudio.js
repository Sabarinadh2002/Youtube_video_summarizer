import speech from '@google-cloud/speech';
import fs from 'fs';

async function transcribeAudio(audioFilePath) {
  const client = new speech.SpeechClient({
    keyFilename: 'path-to-your-service-account-file.json',
  });

  const file = fs.readFileSync(audioFilePath);
  const audioBytes = file.toString('base64');

  const audio = {
    content: audioBytes,
  };
  const config = {
    encoding: 'MP3',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };
  const request = {
    audio: audio,
    config: config,
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join('\n');
  return transcription;
}
