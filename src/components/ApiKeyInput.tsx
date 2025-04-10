'use client';

import { useState, useEffect } from 'react';
import { Input, Button, Label } from '../utils/ui';

interface ApiKeyInputProps {
  onApiKeyChange: (apiKey: string) => void;
}

export default function ApiKeyInput({ onApiKeyChange }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [isStored, setIsStored] = useState<boolean>(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('cohereApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsStored(true);
      onApiKeyChange(storedApiKey);
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('cohereApiKey', apiKey);
      setIsStored(true);
      onApiKeyChange(apiKey);
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('cohereApiKey');
    setApiKey('');
    setIsStored(false);
    onApiKeyChange('');
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
      <Label htmlFor="apiKey" className="block mb-2">
        Cohere API Key {isStored && <span className="text-green-600 text-xs">(Saved)</span>}
      </Label>
      <div className="flex gap-2">
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Cohere API key"
          className="flex-1"
        />
        {isStored ? (
          <Button onClick={handleClearApiKey} variant="outline">
            Clear
          </Button>
        ) : (
          <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
            Save
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Your API key is stored locally in your browser and never sent to our servers.
        {!isStored && !apiKey && (
          <span className="block mt-1 text-amber-600">
            Please enter your Cohere API key to use the application in production mode.
          </span>
        )}
      </p>
    </div>
  );
}