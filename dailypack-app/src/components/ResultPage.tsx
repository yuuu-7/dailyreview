// src/components/ResultPage.tsx
import React, { useState, useMemo } from 'react';

interface ResultPageProps {
  resultData?: any; // webhook 返回的数据
  onBack: () => void; // 返回按钮回调
}

export default function ResultPage({ resultData, onBack }: ResultPageProps) {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // 解析 webhook 数据，提取三个部分的信息
  const parseWebhookData = (data: any) => {
    console.log('=== 开始解析数据 ===');
    console.log('resultData 是否存在:', !!data);
    console.log('resultData.data 是否存在:', !!(data && data.data));
    console.log('resultData.data 类型:', typeof (data && data.data));
    
    if (!data || !data.data) {
      console.log('数据不存在，返回空结果');
      return { todoText: '', insightsText: '', socialText: '', keywordsText: '' };
    }

    try {
      let parsedData;

      // 如果 data 是字符串，先解析为 JSON
      if (typeof data.data === 'string') {
        console.log('data.data 是字符串，开始解析 JSON');
        parsedData = JSON.parse(data.data);
        console.log('JSON 解析成功，解析后的数据类型:', typeof parsedData);
        console.log('解析后的数据:', parsedData);
      } else {
        console.log('data.data 不是字符串，直接使用');
        parsedData = data.data;
      }

      // 处理新的数据格式
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        console.log('检测到数组格式数据，长度:', parsedData.length);
        
        // 检查是否是嵌套的 data 数组格式 [{ "data": [...] }]
        if (parsedData[0] && parsedData[0].data && Array.isArray(parsedData[0].data)) {
          console.log('检测到嵌套 data 数组格式');
          return parseSimpleTodoFormat(parsedData[0].data);
        }
        
        // 检查是否是简单的待办事项数组格式
        if (parsedData[0] && parsedData[0]["['待办']"]) {
          console.log('检测到简单待办事项格式');
          return parseSimpleTodoFormat(parsedData);
        }
        
        // 否则使用原来的复杂格式解析
        const mainData = parsedData[0];
        console.log('使用第一个元素进行解析:', mainData);
        const result = parseNewFormatData(mainData);
        console.log('parseNewFormatData 返回结果:', result);
        return result;
      }

      // 如果还是旧的格式，使用原来的解析逻辑
      if (Array.isArray(parsedData)) {
        console.log('使用旧格式解析逻辑');
        const result = parseArrayData(parsedData);
        console.log('parseArrayData 返回结果:', result);
        return result;
      }

      console.log('数据格式不匹配，返回空结果');

    } catch (error) {
      console.error('解析数据时出错:', error);
    }

    return { todoText: '', insightsText: '', socialText: '', keywordsText: '' };
  };

  // 解析简单待办事项格式
  const parseSimpleTodoFormat = (dataArray: any[]) => {
    console.log('=== parseSimpleTodoFormat 开始 ===');
    console.log('接收到的数据:', dataArray);
    
    const todoItems: string[] = [];
    const insights: string[] = [];
    const socialPosts: string[] = [];
    const keywords: string[] = [];
    
    dataArray.forEach((item, index) => {
      console.log(`处理第 ${index + 1} 个数据项:`, item);
      
      // 处理待办事项
      if (item["['待办']"]) {
        todoItems.push(item["['待办']"]);
        console.log(`提取到待办事项: ${item["['待办']"]}`);
      }
      
      // 处理洞察信息 - 支持多种字段名格式
      if (item["['洞察']"]) {
        insights.push(item["['洞察']"]);
        console.log(`提取到洞察: ${item["['洞察']"]}`);
      }
      
      // 处理 distilled_insights 字段
      if (item.distilled_insights && Array.isArray(item.distilled_insights)) {
        insights.push(...item.distilled_insights);
        console.log(`提取到 distilled_insights: ${item.distilled_insights.join(', ')}`);
      }
      
      // 处理社交媒体内容 - 支持多种字段名格式
      if (item["['社交媒体']"]) {
        socialPosts.push(item["['社交媒体']"]);
        console.log(`提取到社交媒体内容: ${item["['社交媒体']"]}`);
      }
      
      // 处理其他可能的字段名变体
      if (item["['经验']"]) {
        insights.push(`经验: ${item["['经验']"]}`);
        console.log(`提取到经验: ${item["['经验']"]}`);
      }
      
      if (item["['点子']"]) {
        insights.push(`点子: ${item["['点子']"]}`);
        console.log(`提取到点子: ${item["['点子']"]}`);
      }
      
      if (item["['即刻']"]) {
        socialPosts.push(`即刻: ${item["['即刻']"]}`);
        console.log(`提取到即刻内容: ${item["['即刻']"]}`);
      }
      
      if (item["['小红书']"]) {
        socialPosts.push(`小红书: ${item["['小红书']"]}`);
        console.log(`提取到小红书内容: ${item["['小红书']"]}`);
      }
      
      if (item["['X']"] || item["['x']"]) {
        socialPosts.push(`X: ${item["['X']"] || item["['x']"]}`);
        console.log(`提取到X内容: ${item["['X']"] || item["['x']"]}`);
      }
      
      // 处理 social_media_posts 字段格式
      if (item["social_media_posts['即刻']"]) {
        socialPosts.push(`即刻: ${item["social_media_posts['即刻']"]}`);
        console.log(`提取到即刻内容: ${item["social_media_posts['即刻']"]}`);
      }
      
      if (item["social_media_posts.x"]) {
        socialPosts.push(`X: ${item["social_media_posts.x"]}`);
        console.log(`提取到X内容: ${item["social_media_posts.x"]}`);
      }
      
      // 处理关键词 - 支持多种字段名格式
      if (item["['关键词']"]) {
        keywords.push(item["['关键词']"]);
        console.log(`提取到关键词: ${item["['关键词']"]}`);
      }
      
      // 处理 ["关键词"] 格式
      if (item["[\"关键词\"]"]) {
        keywords.push(item["[\"关键词\"]"]);
        console.log(`提取到关键词: ${item["[\"关键词\"]"]}`);
      }
      
      if (item.keywords) {
        if (Array.isArray(item.keywords)) {
          keywords.push(...item.keywords);
          console.log(`提取到关键词数组: ${item.keywords.join(', ')}`);
        } else {
          keywords.push(item.keywords);
          console.log(`提取到关键词: ${item.keywords}`);
        }
      }
    });
    
    const todoText = todoItems.join('\n');
    const insightsText = insights.join('\n');
    const socialText = socialPosts.join('\n\n');
    const keywordsText = keywords.join(', ');
    
    console.log('最终解析结果:');
    console.log('待办事项:', todoText);
    console.log('洞察总结:', insightsText);
    console.log('社交媒体:', socialText);
    console.log('关键词:', keywordsText);
    
    return {
      todoText,
      insightsText: insightsText || '暂无数据',
      socialText: socialText || '暂无数据',
      keywordsText: keywordsText || '暂无数据'
    };
  };

  // 解析新格式的数据
  const parseNewFormatData = (mainData: any) => {
    console.log('=== parseNewFormatData 开始 ===');
    console.log('接收到的 mainData:', mainData);
    let todoText = '', insightsText = '', socialText = '', keywordsText = '';

    // 处理待办事项
    console.log('检查待办事项...');
    console.log('mainData.todo 存在:', !!mainData.todo);
    console.log('mainData.todo 是数组:', Array.isArray(mainData.todo));
    console.log('mainData.todo 长度:', mainData.todo ? mainData.todo.length : 0);
    
    if (mainData.todo && Array.isArray(mainData.todo) && mainData.todo.length > 0) {
      const todoItem = mainData.todo[0];
      console.log('第一个 todo 项:', todoItem);
      console.log('todoItem.待办 存在:', !!todoItem.待办);
      console.log('todoItem.待办 是数组:', Array.isArray(todoItem.待办));
      console.log('todoItem.待办 长度:', todoItem.待办 ? todoItem.待办.length : 0);
      
      if (todoItem.待办 && Array.isArray(todoItem.待办) && todoItem.待办.length > 0) {
        todoText = todoItem.待办.join(', ');
        console.log('解析的待办事项:', todoText);
      }
    }
    
    // 处理洞察总结（从 todo 字段的 distilled_insights 中提取）
    console.log('检查洞察总结...');
    if (mainData.todo && Array.isArray(mainData.todo) && mainData.todo.length > 0) {
      const todoItem = mainData.todo[0];
      const insights: string[] = [];

      console.log('todoItem.distilled_insights 存在:', !!todoItem.distilled_insights);
      console.log('todoItem.distilled_insights 内容:', todoItem.distilled_insights);

      // 从 distilled_insights 中提取经验和点子
      if (todoItem.distilled_insights) {
        if (todoItem.distilled_insights.经验 && Array.isArray(todoItem.distilled_insights.经验)) {
          console.log('找到经验数组:', todoItem.distilled_insights.经验);
          insights.push(...todoItem.distilled_insights.经验);
        }
        if (todoItem.distilled_insights.点子 && Array.isArray(todoItem.distilled_insights.点子)) {
          console.log('找到点子数组:', todoItem.distilled_insights.点子);
          insights.push(...todoItem.distilled_insights.点子);
        }
      }

      // 如果 todo 中没有洞察，尝试从 summary 字段获取
      if (insights.length === 0 && mainData.summary && Array.isArray(mainData.summary)) {
        console.log('从 summary 字段获取洞察...');
        mainData.summary.forEach((item: any) => {
          if (item.distilled_insights && Array.isArray(item.distilled_insights)) {
            insights.push(...item.distilled_insights);
          }
        });
      }

      insightsText = insights.join('\n');
      console.log('解析的洞察总结:', insightsText);
    }
    
    // 处理社交媒体内容（从 todo 字段的 social_media_posts 中提取）
    console.log('检查社交媒体内容...');
    if (mainData.todo && Array.isArray(mainData.todo) && mainData.todo.length > 0) {
      const todoItem = mainData.todo[0];
      const socialPosts: string[] = [];
      
      console.log('todoItem.social_media_posts 存在:', !!todoItem.social_media_posts);
      console.log('todoItem.social_media_posts 内容:', todoItem.social_media_posts);
      
      if (todoItem.social_media_posts) {
        // 处理即刻内容
        if (todoItem.social_media_posts.即刻 && todoItem.social_media_posts.即刻.content) {
          console.log('找到即刻内容:', todoItem.social_media_posts.即刻.content);
          socialPosts.push(`即刻: ${todoItem.social_media_posts.即刻.content}`);
        }
        
        // 处理小红书内容
        if (todoItem.social_media_posts.小红书) {
          const xiaohongshu = todoItem.social_media_posts.小红书;
          console.log('找到小红书内容:', xiaohongshu);
          if (xiaohongshu.title && xiaohongshu.content) {
            socialPosts.push(`小红书: ${xiaohongshu.title}\n${xiaohongshu.content}`);
          }
        }
        
        // 处理X内容
        if (todoItem.social_media_posts.x && todoItem.social_media_posts.x.content) {
          console.log('找到X内容:', todoItem.social_media_posts.x.content);
          socialPosts.push(`X: ${todoItem.social_media_posts.x.content}`);
        }
      }
      
      socialText = socialPosts.join('\n\n');
      console.log('解析的社交媒体内容:', socialText);
    }
    
    // 如果 todo 中没有社交媒体内容，尝试从 publishSuggestion 字段获取
    if (socialText === '' && mainData.publishSuggestion && Array.isArray(mainData.publishSuggestion)) {
      const socialInsights: string[] = [];
      mainData.publishSuggestion.forEach((item: any) => {
        if (item["social_media_posts['即刻']"]) {
          socialInsights.push(`即刻: ${item["social_media_posts['即刻']"]}`);
        }
        if (item["social_media_posts.x"]) {
          socialInsights.push(`X: ${item["social_media_posts.x"]}`);
        }
      });
      socialText = socialInsights.join('\n\n');
    }
    
    // 处理关键词
    console.log('检查关键词...');
    if (mainData.keywords) {
      if (Array.isArray(mainData.keywords)) {
        keywordsText = mainData.keywords.join(', ');
        console.log('找到关键词数组:', mainData.keywords);
      } else {
        keywordsText = mainData.keywords;
        console.log('找到关键词:', mainData.keywords);
      }
    }
    
    console.log('=== parseNewFormatData 最终结果 ===');
    console.log('todoText:', todoText);
    console.log('insightsText:', insightsText);
    console.log('socialText:', socialText);
    console.log('keywordsText:', keywordsText);
    
    return { todoText, insightsText, socialText, keywordsText };
  };

  // 解析数组格式的数据
  const parseArrayData = (dataArray: any[]) => {
    let todoText = '', insightsText = '', socialText = '', keywordsText = '';

    // 处理待办事项（第一个数组）
    if (dataArray[0] && Array.isArray(dataArray[0]) && dataArray[0].length > 0) {
      const todoItem = dataArray[0][0];
      if (todoItem && todoItem["['待办']"]) {
        todoText = todoItem["['待办']"];
      }
    }

    // 处理洞察信息（第二个数组，如果存在）
    if (dataArray[1] && Array.isArray(dataArray[1]) && dataArray[1].length > 0) {
      const insights = dataArray[1].map((item: any) =>
        item.distilled_insights ? item.distilled_insights.join('; ') : ''
      ).filter(Boolean);
      insightsText = insights.join('\n');
    }

    // 处理第三个数组（也是洞察信息，如果存在）
    if (dataArray[2] && Array.isArray(dataArray[2]) && dataArray[2].length > 0) {
      const insights = dataArray[2].map((item: any) =>
        item.distilled_insights ? item.distilled_insights.join('; ') : ''
      ).filter(Boolean);
      socialText = insights.join('\n'); // Keeping it as socialText for the third box
    }

    return { todoText, insightsText, socialText, keywordsText };
  };

  // 使用 useMemo 缓存解析结果，避免重复解析
  const { todoText, insightsText, socialText, keywordsText } = useMemo(() => {
    console.log('=== useMemo 解析开始 ===');
    const result = parseWebhookData(resultData);
    console.log('=== useMemo 解析结果 ===', result);
    return result;
  }, [resultData]);

  // 关键调试：检查最终传递给渲染的值
  console.log('=== 最终渲染值检查 ===');
  console.log('todoText 最终值:', todoText);
  console.log('insightsText 最终值:', insightsText);
  console.log('socialText 最终值:', socialText);
  console.log('keywordsText 最终值:', keywordsText);
  console.log('todoText 是否为空:', !todoText);
  console.log('insightsText 是否为空:', !insightsText);
  console.log('socialText 是否为空:', !socialText);
  console.log('keywordsText 是否为空:', !keywordsText);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* 调试信息区域 */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="bg-yellow-500 text-black px-3 py-1 rounded text-sm font-bold hover:bg-yellow-400 transition-colors"
        >
          {showDebugInfo ? '隐藏调试' : '显示调试'}
        </button>
        
        {showDebugInfo && (
          <div className="mt-2 bg-yellow-100 border border-yellow-300 rounded-lg p-4 max-w-4xl max-h-96 overflow-auto">
            <h3 className="font-bold text-black mb-2">原始 Webhook 数据:</h3>
            <pre className="text-xs text-black whitespace-pre-wrap">
              {JSON.stringify(resultData, null, 2)}
            </pre>
            
            <h3 className="font-bold text-black mb-2 mt-4">解析后的数据结构:</h3>
            <pre className="text-xs text-black whitespace-pre-wrap">
              {(() => {
                if (!resultData || !resultData.data) return '无数据';
                try {
                  const parsed = typeof resultData.data === 'string' ? JSON.parse(resultData.data) : resultData.data;
                  return JSON.stringify(parsed, null, 2);
                } catch (e) {
                  return '解析失败: ' + (e instanceof Error ? e.message : String(e));
                }
              })()}
            </pre>
            
            <h3 className="font-bold text-black mb-2 mt-4">数据项详情:</h3>
            <div className="text-xs text-black">
              {(() => {
                if (!resultData || !resultData.data) return <div>无数据</div>;
                try {
                  const parsed = typeof resultData.data === 'string' ? JSON.parse(resultData.data) : resultData.data;
                  if (Array.isArray(parsed)) {
                    return parsed.map((item, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                        <div className="font-semibold">数据项 {index + 1}:</div>
                        <pre className="text-xs mt-1">{JSON.stringify(item, null, 2)}</pre>
                      </div>
                    ));
                  } else {
                    return <div>非数组格式数据</div>;
                  }
                } catch (e) {
                  return <div>解析失败: {e instanceof Error ? e.message : String(e)}</div>;
                }
              })()}
            </div>
            
            <h3 className="font-bold text-black mb-2 mt-4">最终解析结果:</h3>
            <div className="text-xs text-black">
              <div><strong>待办事项:</strong> {todoText || '暂无数据'}</div>
              <div><strong>洞察总结:</strong> {insightsText || '暂无数据'}</div>
              <div><strong>社交媒体:</strong> {socialText || '暂无数据'}</div>
              <div><strong>关键词:</strong> {keywordsText || '暂无数据'}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* 结果图片和文本框容器 */}
      <div className="relative flex items-center justify-center">
        <img
          src="/paper2@2x@2x.png"
          alt="Daily Report Result"
          className="w-4/5 h-4/5 object-contain"
          style={{
            filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.3)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2))'
          }}
        />

        {/* 文本框1 - 待办事项 */}
        <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 p-3" style={{ marginTop: '112px', marginLeft: '55px' }}>
          <div className="text-xs text-black font-bold leading-tight overflow-hidden whitespace-pre-wrap">
            {todoText ? (
              todoText.split('\n').map((item, index) => (
                <div key={index} className="flex items-start mb-3">
                  <div className="w-3 h-3 border border-gray-400 mr-2 mt-0.5 flex-shrink-0"></div>
                  <span className="flex-1">{item.trim()}</span>
                </div>
              ))
            ) : (
              <div className="flex items-start">
                <div className="w-3 h-3 border border-gray-400 mr-2 mt-0.5 flex-shrink-0"></div>
                <span className="flex-1">暂无数据</span>
              </div>
            )}
          </div>
        </div>

        {/* 文本框2 - 页面中间：洞察总结 */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-100 h-32 p-3" style={{ marginTop: '112px' }}>
          <div className="text-xs text-black font-bold leading-tight overflow-hidden whitespace-pre-wrap">
            {insightsText ? (
              insightsText.split('\n').map((item, index) => (
                <div key={index} className="mb-3">
                  {item.trim()}
                </div>
              ))
            ) : (
              <div>暂无数据</div>
            )}
          </div>
        </div>

        {/* 文本框3 - 日期 */}
        <div className="absolute top-1/4 left-1/2 transform -translate-y-1/2 w-80 h-12 p-3" style={{ marginTop: '32px', marginLeft: '-140px' }}>
          <div className="text-sm text-black font-bold leading-tight overflow-hidden whitespace-pre-wrap">
            {new Date().toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
        </div>

        {/* 文本框4 - 关键词 */}
        <div className="absolute top-1/4 left-1/2 transform -translate-y-1/2 w-80 h-16 p-3" style={{ marginTop: '72px', marginLeft: '-140px' }}>
          <div className="text-xs text-black font-bold leading-tight overflow-hidden whitespace-pre-wrap">
            {keywordsText ? keywordsText : '暂无数据'}
          </div>
        </div>

        {/* 文本框5 - 底部中央：额外洞察 */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-24 p-3" style={{ marginTop: '665px', marginLeft: '-160px' }}>
          <div className="text-xs text-black font-bold leading-tight overflow-hidden whitespace-pre-wrap">
            {socialText ? socialText : '暂无数据'}
          </div>
        </div>
      </div>

      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="absolute top-8 right-8 text-white hover:text-gray-300 transition-all duration-300"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
    </div>
  );
}