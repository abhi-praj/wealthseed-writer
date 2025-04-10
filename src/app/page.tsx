'use client';

import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '../utils/ui';
import ApiKeyInput from '../components/ApiKeyInput';
import FreeChatMode from '../components/FreeChatMode';
import ContentBuilderMode from '../components/ContentBuilderMode';

export default function Home() {
  const [apiKey, setApiKey] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('free-chat');

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">WealthSeed Writer Bot</h1>
          <p className="text-gray-600">Create textbook-level financial literacy content with AI</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <ApiKeyInput onApiKeyChange={handleApiKeyChange} />
            
            <Tabs.Root 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <Tabs.List className="flex border-b border-gray-200">
                <Tabs.Trigger
                  value="free-chat"
                  className={cn(
                    'px-4 py-2 text-sm font-medium',
                    activeTab === 'free-chat' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  Free Chat Mode
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="content-builder"
                  className={cn(
                    'px-4 py-2 text-sm font-medium',
                    activeTab === 'content-builder' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  Content Builder Mode
                </Tabs.Trigger>
              </Tabs.List>
              
              <div className="mt-6">
                <Tabs.Content value="free-chat">
                  <FreeChatMode apiKey={apiKey} />
                </Tabs.Content>
                <Tabs.Content value="content-builder">
                  <ContentBuilderMode apiKey={apiKey} />
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} WealthSeed Financial Education. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
