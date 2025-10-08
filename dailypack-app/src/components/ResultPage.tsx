// src/components/ResultPage.tsx
import React from 'react';

interface ResultPageProps {
  resultData?: any; // webhook 返回的数据
  onBack: () => void; // 返回按钮回调
}

export default function ResultPage({ resultData, onBack }: ResultPageProps) {
  // 解析 webhook 数据，提取三个部分的信息
  const parseWebhookData = (data: any) => {
    console.log('ResultPage 接收到的原始数据:', data);
    
    if (!data || !data.data) return { todoText: '', insightsText: '', socialText: '' };
    
    try {
      let parsedData;
      
      // 如果 data 是字符串，先解析为 JSON
      if (typeof data.data === 'string') {
        parsedData = JSON.parse(data.data);
      } else {
        parsedData = data.data;
      }
      
      console.log('解析后的数据:', parsedData);
      
      // 处理新的数据格式
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        const mainData = parsedData[0];
        return parseNewFormatData(mainData);
      }
      
      // 如果还是旧的格式，使用原来的解析逻辑
      if (Array.isArray(parsedData)) {
        return parseArrayData(parsedData);
      }
      
    } catch (error) {
      console.error('解析数据时出错:', error);
    }
    
    return { todoText: '', insightsText: '', socialText: '' };
  };

  // 解析新格式的数据
  const parseNewFormatData = (mainData: any) => {
    console.log('parseNewFormatData 接收到的数据:', mainData);
    let todoText = '', insightsText = '', socialText = '';
    
    // 处理待办事项
    if (mainData.todo && Array.isArray(mainData.todo) && mainData.todo.length > 0) {
      const todoItem = mainData.todo[0];
      if (todoItem.待办 && Array.isArray(todoItem.待办) && todoItem.待办.length > 0) {
        todoText = todoItem.待办.join(', ');
      }
    }
    console.log('解析的待办事项:', todoText);
    
    // 处理洞察总结（从 todo 字段的 distilled_insights 中提取）
    if (mainData.todo && Array.isArray(mainData.todo) && mainData.todo.length > 0) {
      const todoItem = mainData.todo[0];
      const insights: string[] = [];
      
      // 从 distilled_insights 中提取经验和点子
      if (todoItem.distilled_insights) {
        if (todoItem.distilled_insights.经验 && Array.isArray(todoItem.distilled_insights.经验)) {
          insights.push(...todoItem.distilled_insights.经验);
        }
        if (todoItem.distilled_insights.点子 && Array.isArray(todoItem.distilled_insights.点子)) {
          insights.push(...todoItem.distilled_insights.点子);
        }
      }
      
      // 如果 todo 中没有洞察，尝试从 summary 字段获取
      if (insights.length === 0 && mainData.summary && Array.isArray(mainData.summary)) {
        mainData.summary.forEach((item: any) => {
          if (item.distilled_insights && Array.isArray(item.distilled_insights)) {
            insights.push(...item.distilled_insights);
          }
        });
      }
      
      insightsText = insights.join('\n');
    }
    console.log('解析的洞察总结:', insightsText);
    
    // 处理额外洞察（从 publishSuggestion 字段）
    if (mainData.publishSuggestion && Array.isArray(mainData.publishSuggestion)) {
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
    console.log('解析的额外洞察:', socialText);
    
    return { todoText, insightsText, socialText };
  };

  // 解析数组格式的数据
  const parseArrayData = (dataArray: any[]) => {
    console.log('parseArrayData 接收到的 dataArray:', dataArray);
    let todoText = '', insightsText = '', socialText = '';
    
    // 处理待办事项（第一个数组）
    if (dataArray[0] && Array.isArray(dataArray[0]) && dataArray[0].length > 0) {
      const todoItem = dataArray[0][0];
      if (todoItem && todoItem["['待办']"]) {
        todoText = todoItem["['待办']"];
      }
    }
    console.log('Parsed todoText:', todoText);
    
    // 处理洞察信息（第二个数组，如果存在）
    if (dataArray[1] && Array.isArray(dataArray[1]) && dataArray[1].length > 0) {
      const insights = dataArray[1].map((item: any) => 
        item.distilled_insights ? item.distilled_insights.join('; ') : ''
      ).filter(Boolean);
      insightsText = insights.join('\n');
    }
    console.log('Parsed insightsText (from array 1):', insightsText);
    
    // 处理第三个数组（也是洞察信息，如果存在）
    if (dataArray[2] && Array.isArray(dataArray[2]) && dataArray[2].length > 0) {
      const insights = dataArray[2].map((item: any) => 
        item.distilled_insights ? item.distilled_insights.join('; ') : ''
      ).filter(Boolean);
      socialText = insights.join('\n'); // Keeping it as socialText for the third box
    }
    console.log('Parsed socialText (from array 2):', socialText);
    
    return { todoText, insightsText, socialText };
  };

  const { todoText, insightsText, socialText } = parseWebhookData(resultData);
  
  // 调试信息
  console.log('最终解析结果:', { todoText, insightsText, socialText });
  console.log('resultData 是否存在:', !!resultData);
  console.log('resultData.data 是否存在:', !!resultData?.data);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* 结果图片和文本框容器 */}
      <div className="relative flex items-center justify-center">
        <img
          src="/result-paper.png"
          alt="Daily Report Result"
          className="w-1/2 h-1/2 object-contain"
          style={{
            filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.3)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2))'
          }}
        />
        
        {/* 文本框1 - 洞察总结左边：待办事项 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-full -translate-y-1/2 -ml-32 w-32 h-20 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1 font-semibold">待办事项</div>
          <div className="text-sm text-gray-800 leading-tight overflow-hidden">
            {todoText || '暂无数据'}
          </div>
        </div>
        
        {/* 文本框2 - 页面中间：洞察总结 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-24 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1 font-semibold">洞察总结</div>
          <div className="text-sm text-gray-800 leading-tight overflow-hidden">
            {insightsText || '暂无数据'}
          </div>
        </div>
        
        {/* 文本框3 - 底部中央：额外洞察 */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 -ml-20 w-64 h-24 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1 font-semibold">额外洞察</div>
          <div className="text-sm text-gray-800 leading-tight overflow-hidden">
            {socialText || '暂无数据'}
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
