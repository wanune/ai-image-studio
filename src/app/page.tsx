'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Download, Loader2, ImageIcon, AlertCircle, Lightbulb } from 'lucide-react';

interface GeneratedImage {
  url: string;
  prompt: string;
}

const PROMPT_TEMPLATES = [
  { label: '赛博朋克城市', prompt: 'A futuristic cyberpunk city at night, neon lights reflecting on wet streets, flying cars in the sky, rain, ultra detailed, cinematic lighting, 8K' },
  { label: '水彩风景', prompt: 'A serene watercolor landscape painting of a misty mountain valley with a winding river, soft pastel colors, delicate brush strokes, artistic, gallery quality' },
  { label: '奇幻森林', prompt: 'An enchanted forest with glowing mushrooms, fireflies, ancient twisted trees, magical atmosphere, volumetric light rays through the canopy, fantasy art style' },
  { label: '太空站', prompt: 'Interior of a space station orbiting Saturn, large panoramic window showing the rings, sleek sci-fi design, ambient blue lighting, photorealistic' },
  { label: '日式庭院', prompt: 'A traditional Japanese zen garden in autumn, red maple trees, stone lantern, koi pond with clear water, wooden bridge, peaceful atmosphere, golden hour light' },
  { label: '机械生物', prompt: 'A mechanical dragon made of brass gears and copper pipes, steam rising from joints, intricate clockwork details, dark studio background, dramatic lighting' },
  { label: '海底世界', prompt: 'An underwater coral reef teeming with colorful tropical fish, sunbeams piercing through crystal clear water, sea turtles, vibrant colors, nature photography style' },
  { label: '复古海报', prompt: 'A vintage travel poster of Paris in the 1920s, art deco style, the Eiffel Tower at sunset, warm golden tones, elegant typography space, grain texture' },
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '图片生成失败，请重试');
        return;
      }

      if (data.imageUrls?.length) {
        const newImages: GeneratedImage[] = data.imageUrls.map((url: string) => ({
          url,
          prompt: prompt.trim(),
        }));
        setImages((prev) => [...newImages, ...prev]);
      }
    } catch {
      setError('网络请求失败，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  }, [prompt, loading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate]
  );

  const handleDownload = useCallback(async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // fallback: open in new tab
      window.open(url, '_blank');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F4F4F5]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#27272A] bg-[#0A0A0B]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#A78BFA] to-[#818CF8]">
              <ImageIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">AI Image Studio</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Prompt Input Area */}
        <section className="mb-10">
          <div className="rounded-xl border border-[#27272A] bg-[#141416] p-5">
            <label className="mb-3 block text-xs font-medium text-[#A1A1AA]">
              描述你想生成的图片
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例如：一只橘猫坐在窗台上，窗外是雨中的东京夜景，赛博朋克风格，霓虹灯光映射在玻璃上..."
              className="min-h-[100px] resize-none border-0 bg-transparent text-[15px] leading-relaxed text-[#F4F4F5] placeholder:text-[#52525B] focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={loading}
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-[#52525B]">
                Ctrl + Enter 快速生成
              </span>
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className="relative h-9 rounded-lg border-0 bg-gradient-to-r from-[#A78BFA] to-[#818CF8] px-5 text-sm font-medium text-white shadow-none transition-all hover:shadow-[0_0_20px_rgba(167,139,250,0.3)] disabled:opacity-40 disabled:hover:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Prompt Templates */}
          <div className="mt-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs text-[#52525B]">
              <Lightbulb className="h-3.5 w-3.5" />
              <span>试试这些创意</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PROMPT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => setPrompt(tpl.prompt)}
                  disabled={loading}
                  className="rounded-lg border border-[#27272A] bg-[#141416] px-3 py-1.5 text-xs text-[#A1A1AA] transition-all hover:border-[#A78BFA]/40 hover:bg-[#A78BFA]/10 hover:text-[#F4F4F5] disabled:opacity-40"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && images.length === 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl border border-[#27272A] bg-[#141416]"
              />
            ))}
          </div>
        )}

        {/* Image Gallery */}
        {images.length > 0 && (
          <section>
            <h2 className="mb-4 text-xs font-medium text-[#A1A1AA]">
              生成结果
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {images.map((img, index) => (
                <div
                  key={`${img.url}-${index}`}
                  className="group relative overflow-hidden rounded-xl border border-[#27272A] bg-[#141416] transition-colors hover:border-[#3F3F46]"
                  style={{ animation: 'fadeIn 0.5s ease-out' }}
                >
                  <div className="aspect-square">
                    <img
                      src={img.url}
                      alt={img.prompt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex w-full items-center justify-between p-4">
                      <p className="max-w-[70%] truncate text-xs text-white/80">
                        {img.prompt}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                        onClick={() =>
                          handleDownload(img.url, `ai-image-${Date.now()}.png`)
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && images.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#27272A] bg-[#141416]">
              <Sparkles className="h-7 w-7 text-[#52525B]" />
            </div>
            <p className="text-sm text-[#52525B]">
              输入描述，开始生成图片
            </p>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
