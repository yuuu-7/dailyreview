// src/components/SplashPage.tsx
import React, { useState } from 'react';
import WaitingPage from './WaitingPage';
import ResultPage from './ResultPage';

interface SplashPageProps {
  onEnter: () => void;
}

export default function SplashPage({ onEnter }: SplashPageProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // 当前页面索引
  const [isInputActive, setIsInputActive] = useState(false); // 输入框是否激活
  const [isWaiting, setIsWaiting] = useState(false); // 是否显示等待页面
  const [isShowingResult, setIsShowingResult] = useState(false); // 是否显示结果页面
  const [resultData, setResultData] = useState<any>(null); // webhook 返回的数据

  // 页面容量常量 - 根据实际显示效果调整
  const CHARS_PER_LINE = 23; // 每行约23个字符
  const LINES_PER_PAGE = 15; // 每页约15行
  const CHARS_PER_PAGE = CHARS_PER_LINE * LINES_PER_PAGE; // 每页约345个字符
  const CHARS_PER_DOUBLE_PAGE = CHARS_PER_PAGE * 2; // 双页约690个字符

  // 多页面分栏功能：支持无限页面
  const splitTextIntoPages = (text: string, pageIndex: number = 0) => {
    if (!text.trim()) {
      return { leftPage: '', rightPage: '', totalPages: 1 };
    }
    
    const startIndex = pageIndex * CHARS_PER_DOUBLE_PAGE;
    const endIndex = startIndex + CHARS_PER_DOUBLE_PAGE;
    
    // 计算总页数
    const totalPages = Math.ceil(text.length / CHARS_PER_DOUBLE_PAGE);
    
    // 获取当前双页的文本
    const currentDoublePageText = text.substring(startIndex, endIndex);
    
    // 分割为左右两页
    const leftPage = currentDoublePageText.substring(0, CHARS_PER_PAGE);
    const rightPage = currentDoublePageText.substring(CHARS_PER_PAGE);
    
    return {
      leftPage,
      rightPage,
      totalPages
    };
  };

  const { leftPage, rightPage, totalPages } = splitTextIntoPages(inputText, currentPage);

  // 获取光标在分栏文本中的位置
  const getCursorPositionInPages = (text: string, cursorPos: number) => {
    const currentPageIndex = Math.floor(cursorPos / CHARS_PER_DOUBLE_PAGE);
    const { leftPage, rightPage } = splitTextIntoPages(text, currentPageIndex);
    
    const positionInCurrentPage = cursorPos % CHARS_PER_DOUBLE_PAGE;
    
    if (positionInCurrentPage < CHARS_PER_PAGE) {
      // 光标在左侧页面
      return {
        page: 'left',
        position: positionInCurrentPage,
        text: leftPage,
        pageIndex: currentPageIndex
      };
    } else {
      // 光标在右侧页面
      return {
        page: 'right',
        position: positionInCurrentPage - CHARS_PER_PAGE,
        text: rightPage,
        pageIndex: currentPageIndex
      };
    }
  };

  const cursorInfo = getCursorPositionInPages(inputText, cursorPosition);

  // 自动页面切换：当光标超出当前页面时自动切换
  React.useEffect(() => {
    const cursorPageIndex = Math.floor(cursorPosition / CHARS_PER_DOUBLE_PAGE);
    if (cursorPageIndex !== currentPage && cursorPageIndex >= 0) {
      setCurrentPage(cursorPageIndex);
    }
  }, [cursorPosition, currentPage]);

  // 获取选择范围在分栏文本中的位置
  const getSelectionInPages = (text: string, start: number, end: number) => {
    const currentPageIndex = Math.floor(start / CHARS_PER_DOUBLE_PAGE);
    const { leftPage, rightPage } = splitTextIntoPages(text, currentPageIndex);
    
    const startInCurrentPage = start % CHARS_PER_DOUBLE_PAGE;
    const endInCurrentPage = end % CHARS_PER_DOUBLE_PAGE;
    
    if (startInCurrentPage < CHARS_PER_PAGE && endInCurrentPage <= CHARS_PER_PAGE) {
      // 选择完全在左侧页面
      return {
        page: 'left',
        start: startInCurrentPage,
        end: endInCurrentPage,
        text: leftPage,
        selectedText: text.substring(start, end),
        pageIndex: currentPageIndex
      };
    } else if (startInCurrentPage >= CHARS_PER_PAGE) {
      // 选择完全在右侧页面
      return {
        page: 'right',
        start: startInCurrentPage - CHARS_PER_PAGE,
        end: endInCurrentPage - CHARS_PER_PAGE,
        text: rightPage,
        selectedText: text.substring(start, end),
        pageIndex: currentPageIndex
      };
    } else {
      // 选择跨页面（简化处理，显示在左侧）
      return {
        page: 'left',
        start: startInCurrentPage,
        end: Math.min(endInCurrentPage, CHARS_PER_PAGE),
        text: leftPage,
        selectedText: text.substring(start, Math.min(end, currentPageIndex * CHARS_PER_DOUBLE_PAGE + CHARS_PER_PAGE)),
        pageIndex: currentPageIndex
      };
    }
  };

  const selectionInfo = getSelectionInPages(inputText, selectionStart, selectionEnd);

  // 键盘事件处理
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    
    // 更新选择范围
    setSelectionStart(start);
    setSelectionEnd(end);
    setCursorPosition(start);

    // 处理键盘快捷键
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'a': // 全选
          e.preventDefault();
          target.select();
          setSelectionStart(0);
          setSelectionEnd(inputText.length);
          break;
          
        case 'ArrowLeft': // 上一页
          e.preventDefault();
          if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
          }
          break;
          
        case 'ArrowRight': // 下一页
          e.preventDefault();
          if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
          }
          break;
          
        case 'c': // 复制
          e.preventDefault();
          if (start !== end) {
            const selectedText = inputText.substring(start, end);
            await navigator.clipboard.writeText(selectedText);
          }
          break;
          
        case 'x': // 剪切
          e.preventDefault();
          if (start !== end) {
            const selectedText = inputText.substring(start, end);
            await navigator.clipboard.writeText(selectedText);
            const newText = inputText.substring(0, start) + inputText.substring(end);
            setInputText(newText);
            setCursorPosition(start);
          }
          break;
          
        case 'v': // 粘贴
          e.preventDefault();
          try {
            const clipboardText = await navigator.clipboard.readText();
            const newText = inputText.substring(0, start) + clipboardText + inputText.substring(end);
            setInputText(newText);
            setCursorPosition(start + clipboardText.length);
          } catch (err) {
            console.error('粘贴失败:', err);
          }
          break;
          
        case 'z': // 撤销 (简单实现)
          e.preventDefault();
          // 这里可以实现撤销功能，暂时跳过
          break;
      }
    } else {
      // 处理删除键
      switch (e.key) {
        case 'Backspace':
          e.preventDefault();
          if (start === end) {
            // 没有选择，删除光标前一个字符
            if (start > 0) {
              const newText = inputText.substring(0, start - 1) + inputText.substring(start);
              setInputText(newText);
              setCursorPosition(start - 1);
            }
          } else {
            // 有选择，删除选中的文本
            const newText = inputText.substring(0, start) + inputText.substring(end);
            setInputText(newText);
            setCursorPosition(start);
          }
          break;
          
        case 'Delete':
          e.preventDefault();
          if (start === end) {
            // 没有选择，删除光标后一个字符
            if (start < inputText.length) {
              const newText = inputText.substring(0, start) + inputText.substring(start + 1);
              setInputText(newText);
              setCursorPosition(start);
            }
          } else {
            // 有选择，删除选中的文本
            const newText = inputText.substring(0, start) + inputText.substring(end);
            setInputText(newText);
            setCursorPosition(start);
          }
          break;
      }
    }
  };

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

  const handlePackToN8n = async () => {
    if (!inputText.trim()) return;
    
    setIsSaving(true);
    try {
      // 通过代理API发送到n8n，避免CORS问题
      const res = await fetch('/api/send-to-n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: inputText,
          timestamp: new Date().toISOString()
        }),
      });
      
      const responseData = await res.json();
      
      if (res.ok) {
        console.log('内容已发送到n8n工作流');
        
        // 检查是否是超时情况
        if (responseData.timeout) {
          alert('n8n 工作流已启动！\n\n由于工作流执行时间较长，请稍等片刻后手动检查结果。\n\n如果工作流执行成功，你可以直接访问结果页面查看。');
          // 显示等待页面，但等待时间更长
          setIsWaiting(true);
          setTimeout(() => {
            setIsWaiting(false);
            // 使用模拟数据作为结果
            setResultData({
              message: 'n8n 工作流执行完成',
              data: JSON.stringify([
                {
                  "todo": [
                    {
                      "待办": ["检查 n8n 工作流执行结果", "查看生成的社交媒体内容"],
                      "distilled_insights": {
                        "经验": ["n8n 工作流执行时间较长，需要耐心等待"],
                        "点子": ["考虑优化工作流性能，减少执行时间"]
                      },
                      "social_media_posts": {
                        "即刻": {
                          "content": "n8n 工作流执行完成，请检查实际生成的内容"
                        },
                        "小红书": {
                          "title": "工作流执行完成",
                          "content": "n8n 工作流已执行完成，请查看实际生成的内容"
                        },
                        "x": {
                          "content": "n8n workflow completed, please check the actual generated content"
                        }
                      }
                    }
                  ]
                }
              ]),
              timestamp: new Date().toISOString()
            });
            setIsShowingResult(true);
          }, 15000); // 15秒后完成
        } else {
          // 正常情况
          setIsWaiting(true);
          setTimeout(() => {
            setIsWaiting(false);
            setResultData(responseData);
            setIsShowingResult(true);
          }, 10000);
        }
      } else {
        console.error('发送到n8n失败:', res.status, responseData);
        
        if (res.status === 404) {
          alert('n8n webhook未激活！\n\n请在n8n中：\n1. 打开你的工作流\n2. 点击"Execute workflow"按钮\n3. 然后再次尝试发送');
        } else if (res.status === 408) {
          // 超时错误，但 n8n 可能已经成功执行
          alert('n8n 工作流执行时间过长，但可能已经成功执行！\n\n请检查 n8n 工作流状态，如果执行成功，可以直接查看结果页面。');
        } else if (res.status === 500 && responseData.error === 'N8N Webhook URL not configured') {
          alert('N8N Webhook URL 未配置！\n\n请检查环境变量配置');
        } else {
          alert(`发送到n8n失败 (状态码: ${res.status})\n\n错误信息: ${responseData.message || responseData.error}\n\n请检查：\n1. n8n工作流是否正常运行\n2. webhook URL是否正确\n3. 网络连接是否正常`);
        }
      }
    } catch (error) {
      console.error('发送到n8n失败:', error);
      alert(`发送到n8n失败：${error instanceof Error ? error.message : '未知错误'}\n\n请检查：\n1. 网络连接是否正常\n2. 服务器是否正常运行\n3. API路由是否正确配置`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWaitingComplete = () => {
    setIsWaiting(false);
  };

  const handleBackFromResult = () => {
    setIsShowingResult(false);
    setResultData(null);
    setInputText(''); // 清空输入内容
  };

  // 如果正在等待，显示等待页面
  if (isWaiting) {
    return (
      <WaitingPage 
        onComplete={handleWaitingComplete}
        onSaveToNotion={handleSaveToNotion}
        onPackToN8n={handlePackToN8n}
        isSaving={isSaving}
        inputText={inputText}
      />
    );
  }

  // 如果显示结果页面
  if (isShowingResult) {
    return (
      <ResultPage 
        resultData={resultData}
        onBack={handleBackFromResult}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* 笔记本图片区域 - 居中显示，更大尺寸 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            // 只有在没有输入内容时才隐藏
            if (!inputText.trim()) {
              setIsHovering(false);
              setIsInputActive(false);
            }
          }}
        >
          <img
            src="/notebook.png"
            alt="Open notebook ready for ideas"
            className="w-auto h-[98vh] object-contain"
            style={{
              filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))'
            }}
          />
          
          {/* 输入框 - 隐藏但用于输入 */}
          {(isHovering || inputText.trim()) && (
            <div className="absolute left-[15%] top-[25%] w-[70%] h-[50%] opacity-0">
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setCursorPosition(e.target.selectionStart);
                  setIsInputActive(true);
                }}
                onSelect={(e) => {
                  setSelectionStart(e.currentTarget.selectionStart);
                  setSelectionEnd(e.currentTarget.selectionEnd);
                  setCursorPosition(e.currentTarget.selectionStart);
                  setIsInputActive(true);
                }}
                onKeyDown={handleKeyDown}
                onKeyUp={(e) => {
                  setSelectionStart(e.currentTarget.selectionStart);
                  setSelectionEnd(e.currentTarget.selectionEnd);
                  setCursorPosition(e.currentTarget.selectionStart);
                  setIsInputActive(true);
                }}
                onMouseUp={(e) => {
                  setSelectionStart(e.currentTarget.selectionStart);
                  setSelectionEnd(e.currentTarget.selectionEnd);
                  setCursorPosition(e.currentTarget.selectionStart);
                  setIsInputActive(true);
                }}
                onFocus={() => setIsInputActive(true)}
                onBlur={() => {
                  // 失去焦点时，如果没有内容则隐藏
                  if (!inputText.trim()) {
                    setIsInputActive(false);
                    setIsHovering(false);
                  }
                }}
                placeholder="开始记录你的想法..."
                className="w-full h-full bg-transparent border-none outline-none resize-none"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflow: 'hidden'
                }}
                autoFocus
              />
            </div>
          )}
          
          {/* 左侧页面显示区域 */}
          {(isHovering || inputText.trim()) && (
            <div className="absolute left-[15%] top-[25%] w-[30%] h-[50%] pointer-events-none">
              <div
                className="w-full h-full text-gray-700 text-sm leading-relaxed p-4 font-mono overflow-hidden"
                style={{
                  color: '#374151',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}
              >
                {selectionInfo.page === 'left' && selectionStart !== selectionEnd ? (
                  <>
                    {leftPage.substring(0, selectionInfo.start)}
                    <span style={{ backgroundColor: '#3B82F6', color: 'white' }}>
                      {leftPage.substring(selectionInfo.start, selectionInfo.end)}
                    </span>
                    {leftPage.substring(selectionInfo.end)}
                  </>
                ) : (
                  leftPage
                )}
              </div>
            </div>
          )}
          
          {/* 右侧页面显示区域 */}
          {(isHovering || inputText.trim()) && (
            <div className="absolute right-[15%] top-[25%] w-[30%] h-[50%] pointer-events-none">
              <div
                className="w-full h-full text-gray-700 text-sm leading-relaxed p-4 font-mono overflow-hidden"
                style={{
                  color: '#374151',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}
              >
                {selectionInfo.page === 'right' && selectionStart !== selectionEnd ? (
                  <>
                    {rightPage.substring(0, selectionInfo.start)}
                    <span style={{ backgroundColor: '#3B82F6', color: 'white' }}>
                      {rightPage.substring(selectionInfo.start, selectionInfo.end)}
                    </span>
                    {rightPage.substring(selectionInfo.end)}
                  </>
                ) : (
                  rightPage
                )}
              </div>
            </div>
          )}
          
          {/* 左侧页面光标显示 */}
          {(isHovering || inputText.trim()) && cursorInfo.page === 'left' && (
            <div className="absolute left-[15%] top-[25%] w-[30%] h-[50%] pointer-events-none">
              <div
                className="w-full h-full p-4 font-mono"
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  color: 'transparent'
                }}
              >
                {cursorInfo.text.substring(0, cursorInfo.position)}
                <span className="inline-block w-0.5 h-4 bg-gray-700 animate-pulse"></span>
                {cursorInfo.text.substring(cursorInfo.position)}
              </div>
            </div>
          )}
          
          {/* 右侧页面光标显示 */}
          {(isHovering || inputText.trim()) && cursorInfo.page === 'right' && (
            <div className="absolute right-[15%] top-[25%] w-[30%] h-[50%] pointer-events-none">
              <div
                className="w-full h-full p-4 font-mono"
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  color: 'transparent'
                }}
              >
                {cursorInfo.text.substring(0, cursorInfo.position)}
                <span className="inline-block w-0.5 h-4 bg-gray-700 animate-pulse"></span>
                {cursorInfo.text.substring(cursorInfo.position)}
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
            <img 
              src="/upload-icon.svg" 
              alt="Upload" 
              className="w-8 h-8 opacity-50"
            />
          )}
        </button>
      </div>

      {/* 右侧 Pack 按钮图片 */}
      <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
        <button
          onClick={handlePackToN8n}
          disabled={isSaving || !inputText.trim()}
          className="transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* 页面定位符 - 移到文本框下方 */}
      {totalPages > 1 && (
        <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-2" style={{ top: 'calc(25% + 50% + 20px)' }}>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentPage
                  ? 'bg-gray-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
