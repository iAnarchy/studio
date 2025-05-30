'use client';

import React from 'react';
import type { TabKey } from '@/types';
import { NAV_TAB_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface AppTabsProps {
  activeTab: TabKey;
  onSelectTab: (tabId: TabKey) => void;
  disabled: boolean;
}

const AppTabs: React.FC<AppTabsProps> = ({ activeTab, onSelectTab, disabled }) => {
  return (
    <div className="mb-8">
      <div className="bg-card p-2 rounded-lg shadow-md flex flex-wrap justify-center gap-2">
        {NAV_TAB_ITEMS.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => onSelectTab(tab.id)}
            disabled={disabled && tab.id !== NAV_TAB_ITEMS[0].id} // Keep first tab enabled or disable all based on parent logic
            className={`font-body flex-grow sm:flex-grow-0 transition-all duration-200 ease-in-out
              ${activeTab === tab.id 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-primary hover:bg-primary/10'}
              ${disabled && tab.id !== NAV_TAB_ITEMS[0].id ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <tab.icon className="mr-2 h-5 w-5" />
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AppTabs;
