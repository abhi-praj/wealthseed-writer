'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Textarea, Label, Card, Checkbox } from '../utils/ui';


interface ContentBuilderFormData {
  module: string;
  submodules: string;
  keywords: string;
  miscRequirements: string;
  includeMathQuestions: boolean;
}

interface ContentBuilderModeProps {
  apiKey: string;
}

export default function ContentBuilderMode({ apiKey }: ContentBuilderModeProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ContentBuilderFormData>();
  const [response, setResponse] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data: ContentBuilderFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const submodulesArray = data.submodules.split('|').map(item => item.trim());
      const keywordsArray = data.keywords.split('|').map(item => item.trim());

      const response = await fetch('/api/cohere', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            mode: 'content-builder',
            moduleData: {
              module: data.module,
              submodules: submodulesArray,
              keywords: keywordsArray,
              miscRequirements: data.miscRequirements,
              includeMathQuestions: data.includeMathQuestions
            }
          })
        });

        if (!response.ok) {
          console.log(response);
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="module">Module Name</Label>
          <Input
            id="module"
            {...register('module', { required: 'Module name is required' })}
            placeholder="e.g., Personal Finance Basics"
            className="mt-1 text-black"
          />
          {errors.module && (
            <p className="text-red-500 text-sm mt-1">{errors.module.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="submodules">Submodules (pipe-separated)</Label>
          <Input
            id="submodules"
            {...register('submodules', { required: 'At least one submodule is required' })}
            placeholder="e.g., Budgeting | Saving | Debt Management"
            className="mt-1 text-black"
          />
          {errors.submodules && (
            <p className="text-red-500 text-sm mt-1">{errors.submodules.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="keywords">Keywords/Topics (pipe-separated)</Label>
          <Input
            id="keywords"
            {...register('keywords', { required: 'At least one keyword is required' })}
            placeholder="e.g., Emergency Fund | 50/30/20 Rule | Credit Score"
            className="mt-1 text-black"
          />
          {errors.keywords && (
            <p className="text-red-500 text-sm mt-1">{errors.keywords.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="miscRequirements">Additional Requirements</Label>
          <Textarea
            id="miscRequirements"
            {...register('miscRequirements')}
            placeholder="Any specific content requirements or focus areas..."
            rows={3}
            className="mt-1 text-black"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="includeMathQuestions" 
            {...register('includeMathQuestions')} 
          />
          <Label htmlFor="includeMathQuestions" className="cursor-pointer">
            Include inline math questions where appropriate (recommended for topics like taxes, interest rates, etc.)
          </Label>
        </div>

        <Button type="submit" disabled={isLoading}>
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
          <h3 className="text-black text-lg font-medium mb-2">Generated Content</h3>
          <div className="text-black prose max-w-none">
            {Object.entries(response).map(([submodule, content]) => (
              <div key={submodule} className="mb-8">
                <h4 className="text-lg font-semibold mb-4">{submodule}</h4>
                {content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}