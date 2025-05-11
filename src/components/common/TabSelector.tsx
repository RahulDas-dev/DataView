import { FunctionComponent, ReactNode, useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabSelectorProps {
  tabs: Tab[];
  defaultTabId?: string;
  title?: string;
  className?: string;
}

const TabSelector: FunctionComponent<TabSelectorProps> = ({ 
  tabs, 
  defaultTabId,
  title,
  className = '',
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || (tabs.length > 0 ? tabs[0].id : ''));
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  
  return (
    <div className={`${className}`}>
      <div className="flex items-center mb-4">
        {/* Title and tabs in a row */}
        <div className="flex items-center">
          {title && (
            <div className="text-lg font-['Montserrat'] font-medium py-2 mr-6">
              {title}
            </div>
          )}
          
          {/* Tabs section */}
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`py-2 px-4 text-sm font-mono transition-all duration-300 ease-in-out relative ${
                  activeTabId === tab.id
                    ? 'text-zinc-900 dark:text-zinc-100 font-medium'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 opacity-70 hover:opacity-100'
                }`}
              >
                {tab.label}
                {activeTabId === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-500 dark:bg-zinc-400 transform transition-transform duration-300 ease-out animate-fadeIn" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="animate-fadeIn">
        {activeTab?.content}
      </div>
    </div>
  );
};

export default TabSelector;