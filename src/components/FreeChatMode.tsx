'use client';

import { useState } from 'react';
import { Button, Textarea, Card } from '../utils/ui';


interface FreeChatModeProps {
  apiKey: string;
}

export default function FreeChatMode({ apiKey }: FreeChatModeProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cohere', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          prompt: prompt,
          mode: 'free-chat'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const { content: result } = await response.json();
      setResponse(result);
    } catch (err) {
      setError('Error generating content. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask any question about financial literacy..."
          rows={5}
          className="w-full text-black"
        />
        <Button type="submit" disabled={isLoading || !prompt.trim()}>
          {isLoading ? 'Generating...' : 'Generate Content'}
        </Button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {response && (
        <Card className="mt-6">
          <h3 className="text-lg font-medium mb-2">Generated Content</h3>
          <div className="prose max-w-none">
            {response.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}