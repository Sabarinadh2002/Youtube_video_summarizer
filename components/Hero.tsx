'use client';

import React, { useState } from 'react';
import { AuroraBackground } from './ui/aurora-background'
import { Spotlight } from './ui/spotlight'
import { TextGenerateEffect } from './ui/text-generate-effect'
import { ButtonsCard } from './ui/tailwindcss-buttons'

const Hero = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
  };

  const handleSubmit = async () => {
    console.log('Submit button clicked');
    console.log('YouTube URL:', youtubeUrl);

    setSummary('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl }),
      });

      console.log('Fetch response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setSummary(data.summary);
      } else {
        setError(data.error || 'An error occurred during processing.');
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError('An error occurred while fetching the summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-screen pt-36'>
      <div>
        <Spotlight className='-top-40 -left-10 md:-left-32 md:-top-20 h-screen' fill='white' />
        <Spotlight className='h-[80vh] w-[50vw] top-10 left-full' fill='purple' />
        <Spotlight className='left-80 top-28 h-[80vh] w-[50vw]' fill='white' />
        <Spotlight className='top-28 left-80 h-[80vh] w-[50vw]' fill='blue' />
      </div>
      <div className="h-screen w-full dark:bg-black-100 bg-white dark:bg-grid-white/[0.01] bg-grid-black/[0.2] absolute top-0 left-0 flex items-center justify-center">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black-100 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>
      <div className='flex justify-center relative my-20 z-10'>
        <div className='max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center'>
          <p className='uppercase tracking-widest text-xs text-center text-blue-100 max-w-80'>
            Hi,
          </p>
          <TextGenerateEffect
            className='text-center text-[40px] md:text-5xl lg:text-6xl'
            words='Watch less, learn more and fast from long videos'
          />
          <p className='text-center md:tracking-wider mb-4 text-sm md:text-lg lg:text-1xl'>
            Get YouTube video summaries in a minute. Just paste the link below.
          </p>
          <div className="flex items-center gap-4 mt-6">
            <input
              type="text"
              placeholder="Paste YouTube video link here"
              value={youtubeUrl}
              onChange={handleInputChange}
              className="w-80 p-2 border border-white bg-blue-600 rounded-md text-white placeholder:text-white"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !youtubeUrl}
              className="inline-flex h-12 items-center justify-center rounded-md border border-slate-800
                         bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] 
                         px-6 font-medium text-slate-400 transition-colors focus:outline-none
                         focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50
                         relative overflow-hidden"
            >
              {loading ? (
                <span className='animate-pulse'>Summarizing.....</span>
              ) : (
                'Submit'
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-500 mt-4 text-center">
              {error}
            </p>
          )}
          {summary && (
            <div className="mt-8 p-4 bg-gray-100 rounded-md text-black">
              <h2 className="text-xl font-bold mb-2">Summary:</h2>
              <p>{summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
