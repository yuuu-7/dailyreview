// src/components/ActionList.tsx
interface ActionItem {
  task: string;
  project?: string;
}

interface ActionListProps {
  actions: ActionItem[];
  title?: string;
}

export default function ActionList({ actions, title = "行动清单" }: ActionListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
      <ul className="space-y-3">
        {actions.map((action, index) => (
          <li key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="text-gray-800 font-medium">{action.task}</p>
              {action.project && (
                <p className="text-sm text-gray-500 mt-1">项目: {action.project}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

