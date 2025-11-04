'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ContentPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/content/simple-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      setResult(data.content || 'No content generated');
    } catch (error) {
      console.error('Error:', error);
      setResult('Error generating content');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Content Generator</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Generate Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
          />
          <Button onClick={handleGenerate}>Generate</Button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
