import { FunctionComponent, ReactNode, useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabSelectorProps {
  tabs: Tab[];
  defaultTabId?: string;
  className?: string;
}

const TabSelector: FunctionComponent<TabSelectorProps> = ({ 
  tabs, 
  defaultTabId,
  className = '' 
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || (tabs.length > 0 ? tabs[0].id : ''));
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  
  return (
    <div className={`${className}`}>
      <div className="flex border-b border-zinc-300 dark:border-zinc-700 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`py-2 px-4 text-sm font-mono transition-colors ${
              activeTabId === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab?.content}
      </div>
    </div>
  );
};

export default TabSelector;