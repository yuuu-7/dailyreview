// src/components/InsightCard.tsx
interface Insight {
  topic: string;
  summary: string;
  tags?: string[];
}

interface InsightCardProps {
  insights: Insight[];
  title?: string;
}

export default function InsightCard({ insights, title = "信息沉淀" }: InsightCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-semibold text-gray-800 mb-2">{insight.topic}</h3>
            <p className="text-gray-600 leading-relaxed">{insight.summary}</p>
            {insight.tags && insight.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {insight.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

