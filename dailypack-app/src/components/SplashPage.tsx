// src/components/SplashPage.tsx
import { useState } from 'react';

interface SplashPageProps {
  onEnter: () => void;
}

export default function SplashPage({ onEnter }: SplashPageProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 自动分栏功能：将输入文本分成左右两页
  const splitTextIntoPages = (text: string) => {
    const words = text.split(' ');
    const midPoint = Math.ceil(words.length / 2);
    const leftWords = words.slice(0, midPoint);
    const rightWords = words.slice(midPoint);
    
    return {
      leftPage: leftWords.join(' '),
      rightPage: rightWords.join(' ')
    };
  };

  const { leftPage, rightPage } = splitTextIntoPages(inputText);

  const handleSaveToNotion = async () => {
    if (!inputText.trim()) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputText }),
      });
      
      if (res.ok) {
        setInputText('');
        alert('已保存到 Notion！');
      } else {
        alert('保存失败，请检查配置');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请检查网络连接');
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="min-h-screen bg-white relative">
      {/* 笔记本图片区域 - 居中显示，更大尺寸 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <img
            src="/notebook.png"
            alt="Open notebook ready for ideas"
            className="w-auto h-[95vh] object-contain"
            style={{
              filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))'
            }}
          />
          
          {/* 输入框 - 隐藏但用于输入 */}
          {isHovering && (
            <div className="absolute left-[8%] top-[15%] w-[84%] h-[70%] opacity-0">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="开始记录你的想法..."
                className="w-full h-full bg-transparent border-none outline-none resize-none"
                autoFocus
              />
            </div>
          )}
          
          {/* 左侧页面显示区域 */}
          {isHovering && (
            <div className="absolute left-[8%] top-[15%] w-[38%] h-[70%] pointer-events-none">
              <div
                className="w-full h-full text-gray-700 text-sm leading-relaxed p-4 font-mono overflow-hidden"
                style={{
                  color: '#374151',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                }}
              >
                {leftPage}
              </div>
            </div>
          )}
          
          {/* 右侧页面显示区域 */}
          {isHovering && (
            <div className="absolute right-[8%] top-[15%] w-[38%] h-[70%] pointer-events-none">
              <div
                className="w-full h-full text-gray-700 text-sm leading-relaxed p-4 font-mono overflow-hidden"
                style={{
                  color: '#374151',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                }}
              >
                {rightPage}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 左侧保存按钮 */}
      <div className="absolute left-16 top-1/2 transform -translate-y-1/2">
        <button
          onClick={handleSaveToNotion}
          disabled={isSaving || !inputText.trim()}
          className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          {isSaving ? (
            <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg 
              className="w-8 h-8 text-gray-600 opacity-70" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          )}
        </button>
      </div>

      {/* 右侧 Pack 按钮图片 */}
      <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
        <button
          onClick={onEnter}
          className="transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none"
        >
          <img
            src="/button.png"
            alt="Pack button"
            className="w-20 h-20 object-contain"
            style={{
              filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
            }}
          />
        </button>
      </div>
    </div>
  );
}
