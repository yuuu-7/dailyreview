// src/app/result/page.tsx
'use client';

import React from 'react';
import ResultPage from '../../components/ResultPage';

export default function ResultRoute() {
  const handleBack = () => {
    // 返回到主页
    window.location.href = '/';
  };

  // 模拟 webhook 返回的数据
  const mockResultData = {
    message: 'Successfully sent to n8n',
    data: JSON.stringify([
      {
        "publishSuggestion": [
          {
            "social_media_posts['即刻']": "今天意识到，所谓的'自律'，其核心可能不是意志力，而是通过设计环境来降低对意志力的依赖。让正确的行为变得更容易，让错误的行为变得更困难，这才是可持续的系统。🧠",
            "social_media_posts.x": "Stop trying to find more willpower. Start designing a better environment.\\n\\nThat's the real productivity hack.\\n\\n#productivity #selfimprovement"
          }
        ],
        "summary": [
          {
            "distilled_insights": []
          },
          {
            "distilled_insights": []
          }
        ],
        "todo": [
          {
            "待办": ["与张三安排关于新项目的会议", "准备下周的演示材料"],
            "distilled_insights": {
              "经验": ["将任务公开承诺给他人，是克服拖延的有效策略"],
              "点子": ["选题灵感：写一篇关于'数字极简主义'如何影响个人精力的专栏文章"]
            },
            "social_media_posts": {
              "即刻": {
                "content": "今天意识到，所谓的'自律'，其核心可能不是意志力，而是通过设计环境来降低对意志力的依赖。让正确的行为变得更容易，让错误的行为变得更困难，这才是可持续的系统。🧠"
              },
              "小红书": {
                "title": "今日份人生感悟｜我好像搞懂了自律的秘密",
                "content": "📔 今天记日记的时候突然想通一件事！\\n\\n我们总说要自律，要用意志力去对抗懒惰，但好像越是用力，就越是疲惫。\\n\\n后来发现，真正厉害的人，好像都不是意志力超人，而是环境的设计大师！✨\\n\\n他们会把手机放在另一个房间，减少分心；会把运动鞋放在门口，让出门锻炼变得顺理成章。\\n\\n与其每天和自己较劲，不如花点时间，为自己打造一个想不努力都难的环境。\\n\\n这可能才是普通人也能做到的、更轻松的自律吧～\\n\\n#自我成长 #自律 #学习方法 #人生感悟"
              },
              "x": {
                "content": "Stop trying to find more willpower. Start designing a better environment.\\n\\nThat's the real productivity hack.\\n\\n#productivity #selfimprovement"
              }
            }
          }
        ]
      }
    ]),
    timestamp: new Date().toISOString()
  };

  return (
    <ResultPage 
      resultData={mockResultData} // 传入模拟数据用于测试
      onBack={handleBack}
    />
  );
}
