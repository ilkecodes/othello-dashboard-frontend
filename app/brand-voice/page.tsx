'use client';

import { useState, useEffect } from 'react';
import { brandVoice, getClients } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, MessageSquare, BarChart3 } from 'lucide-react';

export default function BrandVoicePage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Step 1: Add Content
  const [contentText, setContentText] = useState('');
  const [platform, setPlatform] = useState('instagram');

  // Step 2: Generate Content
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadProfile();
      loadStats();
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const res = await getClients();
      setClients(res.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await brandVoice.get(selectedClient);
      setProfile(res.data);
    } catch (error) {
      console.log('No profile yet');
      setProfile(null);
    }
  };

  const loadStats = async () => {
    try {
      const res = await brandVoice.stats(selectedClient);
      setStats(res.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAddContent = async () => {
    if (!selectedClient || !contentText) {
      alert('Please select a client and enter content');
      return;
    }

    setLoading(true);
    try {
      await brandVoice.addCorpus({
        client_id: selectedClient,
        platform,
        text_content: contentText,
      });
      alert('✅ Content added!');
      setContentText('');
      loadStats();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBuildVoice = async () => {
    if (!selectedClient) return;

    setLoading(true);
    try {
      const res = await brandVoice.build(selectedClient);
      alert('✅ Brand voice created!');
      setProfile(res.data);
      loadStats();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedClient || !prompt) {
      alert('Please select a client and enter a prompt');
      return;
    }

    setLoading(true);
    try {
      const res = await brandVoice.generate({
        client_id: selectedClient,
        prompt,
        platform,
      });
      setGeneratedContent(res.data.text);
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">�� Brand Voice AI</h1>
        <p className="text-gray-600">Create AI-powered content that matches your brand's unique voice</p>
      </div>

      {/* Client Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Client</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a client..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClient && (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Content Items</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.corpus_items}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Generated Content</CardTitle>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.generated_contents}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.confidence_score}%</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Brand Voice Profile */}
          {profile && (
            <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle>✨ Brand Voice Profile</CardTitle>
                <CardDescription>AI-analyzed brand personality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-semibold">Tone:</span>{' '}
                  <Badge variant="secondary">{profile.tone}</Badge>
                </div>
                <div>
                  <span className="font-semibold">Summary:</span>
                  <p className="mt-1 text-gray-700">{profile.voice_summary}</p>
                </div>
                <div>
                  <span className="font-semibold">Confidence:</span>{' '}
                  <Badge variant="outline">{profile.confidence_score}%</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Add Content */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Step 1: Add Brand Content</CardTitle>
              <CardDescription>
                Add 5-10 examples of your brand's content (Instagram posts, tweets, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Paste your brand content here..."
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={5}
              />

              <Button onClick={handleAddContent} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Content
              </Button>
            </CardContent>
          </Card>

          {/* Step 2: Build Voice */}
          {stats && stats.corpus_items >= 3 && !profile && (
            <Card className="mb-6 border-purple-200">
              <CardHeader>
                <CardTitle>Step 2: Build Brand Voice</CardTitle>
                <CardDescription>
                  You have {stats.corpus_items} content items. Ready to analyze!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleBuildVoice} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Build Brand Voice with AI
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Generate Content */}
          {profile && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Step 3: Generate Content</CardTitle>
                <CardDescription>
                  Create brand-aligned content using AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="What do you want to post about? (e.g., 'Summer sale announcement')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />

                <Button onClick={handleGenerate} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Content
                </Button>

                {generatedContent && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">✨ Generated Content:</h4>
                    <p className="whitespace-pre-wrap">{generatedContent}</p>
                    <Button
                      className="mt-3"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(generatedContent)}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
