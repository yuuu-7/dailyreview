// src/app/page.tsx - 完整代码
"use client";
import { useState } from 'react';
import ActionList from '@/components/ActionList';
import InsightCard from '@/components/InsightCard';
import SocialMediaPost from '@/components/SocialMediaPost';
import SplashPage from '@/components/SplashPage';

// 从 webhook 返回的数据结构
interface WebhookResult {
  actionable_tasks: string[];
  distilled_insights: {
    lessons_learned: string[];
    ideas: string[];
  };
  social_media_posts: {
    jike: { content: string };
    xiaohongshu: { title: string; content: string };
    x: { content: string };
  };
}

// 从 Notion API 获取的数据结构
interface NotionResultData {
  todos: any[];
  knowledge: any[];
  drafts: any[];
}

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');
  const [webhookResults, setWebhookResults] = useState<WebhookResult | null>(null);
  const [notionResults, setNotionResults] = useState<NotionResultData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEnterApp = () => {
    setShowSplash(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('正在保存...');
    const res = await fetch('/api/add-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: note }),
    });
    if (res.ok) {
      setStatus('保存成功！');
      setNote('');
      setTimeout(() => setStatus(''), 2000);
    } else {
      setStatus('保存失败。');
    }
  };
  
  const handlePackage = async () => {
    setIsLoading(true);
    setWebhookResults(null);
    setNotionResults(null);
    
    try {
      // 1. 触发 n8n Webhook
      const webhookResponse = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (webhookResponse.ok) {
        // 如果 webhook 直接返回结果，直接使用
        const webhookData = await webhookResponse.json();
        if (webhookData.actionable_tasks) {
          setWebhookResults(webhookData);
        }
      }

      // 2. 等待一段时间后从 Notion 获取结果
      setTimeout(async () => {
        try {
          const res = await fetch('/api/get-results');
          const data = await res.json();
          setNotionResults(data);
        } catch (error) {
          console.error('获取 Notion 结果失败:', error);
        }
        setIsLoading(false);
      }, 15000); // 等待15秒让n8n处理
      
    } catch (error) {
      console.error('触发 webhook 失败:', error);
      setIsLoading(false);
    }
  };

  // 显示开屏页面
  if (showSplash) {
    return <SplashPage onEnter={handleEnterApp} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-gray-50 text-gray-800">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">DailyPack</h1>
        
        {/* 输入区域 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleAddNote}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-4 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={5}
              placeholder="记录你的灵感、想法、文章..."
            />
            <button type="submit" className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold">
              记录到Notion
            </button>
            {status && <p className="mt-2 text-center text-sm">{status}</p>}
          </form>
        </div>

        {/* 操作和展示区域 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <button onClick={handlePackage} disabled={isLoading} className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 font-bold text-lg disabled:bg-gray-400">
            {isLoading ? '正在打包中...' : '今日打包'}
          </button>

          {isLoading && <div className="text-center mt-4">请稍候，AI正在处理... (预计20秒)</div>}
          
          {/* 优先显示 webhook 返回的结果 */}
          {webhookResults && (
            <div className="mt-8 space-y-6">
              <ActionList 
                actions={webhookResults.actionable_tasks.map(task => ({ task }))}
                title="今日行动清单"
              />
              
              <InsightCard 
                insights={[
                  ...webhookResults.distilled_insights.lessons_learned.map(lesson => ({
                    topic: "经验总结",
                    summary: lesson
                  })),
                  ...webhookResults.distilled_insights.ideas.map(idea => ({
                    topic: "灵感想法",
                    summary: idea
                  }))
                ]}
                title="信息沉淀"
              />
              
              <SocialMediaPost 
                posts={[
                  { platform: 'jike', content: webhookResults.social_media_posts.jike.content },
                  { 
                    platform: 'xiaohongshu', 
                    title: webhookResults.social_media_posts.xiaohongshu.title,
                    content: webhookResults.social_media_posts.xiaohongshu.content 
                  },
                  { platform: 'x', content: webhookResults.social_media_posts.x.content }
                ]}
                title="创作内容"
              />
            </div>
          )}
          
          {/* 如果没有 webhook 结果，显示 Notion 结果 */}
          {!webhookResults && notionResults && (
            <div className="mt-8 space-y-6">
              <ActionList 
                actions={notionResults.todos.map((item: any) => ({
                  task: item.properties.Task.title[0].text.content,
                  project: item.properties.Project?.rich_text?.[0]?.text?.content
                }))}
                title="行动清单"
              />
              
              <InsightCard 
                insights={notionResults.knowledge.map((item: any) => ({
                  topic: item.properties.Topic.title[0].text.content,
                  summary: item.properties.Summary.rich_text[0].text.content,
                  tags: item.properties.Tags?.multi_select?.map((tag: any) => tag.name) || []
                }))}
                title="信息沉淀"
              />
              
              <SocialMediaPost 
                posts={notionResults.drafts.map((item: any) => ({
                  platform: item.properties.Platform.select.name.toLowerCase(),
                  content: item.properties.Content.rich_text[0].text.content
                }))}
                title="创作内容"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
