// src/components/SocialMediaPost.tsx
interface SocialPost {
  platform: 'jike' | 'xiaohongshu' | 'x';
  content: string;
  title?: string; // 小红书可能需要标题
}

interface SocialMediaPostProps {
  posts: SocialPost[];
  title?: string;
}

const platformConfig = {
  jike: {
    name: '即刻',
    color: 'bg-green-500',
    icon: '📱'
  },
  xiaohongshu: {
    name: '小红书',
    color: 'bg-red-500',
    icon: '📖'
  },
  x: {
    name: 'X (Twitter)',
    color: 'bg-black',
    icon: '🐦'
  }
};

export default function SocialMediaPost({ posts, title = "创作内容" }: SocialMediaPostProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
      <div className="space-y-4">
        {posts.map((post, index) => {
          const config = platformConfig[post.platform];
          return (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className={`w-8 h-8 ${config.color} rounded-full flex items-center justify-center text-white text-sm mr-3`}>
                  {config.icon}
                </div>
                <h3 className="font-semibold text-gray-800">发往 {config.name}</h3>
              </div>
              {post.title && (
                <h4 className="font-medium text-gray-700 mb-2">{post.title}</h4>
              )}
              <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-300">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

