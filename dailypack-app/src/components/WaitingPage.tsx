// src/components/WaitingPage.tsx
import React from 'react';

interface WaitingPageProps {
  onComplete: () => void;
  onSaveToNotion: () => void;
  onPackToN8n: () => void;
  isSaving: boolean;
  inputText: string;
}

export default function WaitingPage({ onComplete, onSaveToNotion, onPackToN8n, isSaving, inputText }: WaitingPageProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-1/3 h-1/3 object-contain"
        onLoadedData={() => console.log('视频加载完成')}
        onError={(e) => console.error('视频播放错误:', e)}
      >
        <source src="/waiting-video.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
