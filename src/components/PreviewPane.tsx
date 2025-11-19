"use client";

import { useState } from 'react';
import { ScreenshotButton } from '@/components/ScreenshotButton';

export function PreviewPane() {
  const [url, setUrl] = useState<string>('about:blank');
  const iframeId = 'preview-frame';
  return (
    <div className="h-full w-full flex flex-col">
      <div className="h-7 flex items-center gap-2 px-2 border-b border-neutral-800 text-[11px]">
        <span className="text-neutral-500">Preview URL</span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-0.5 text-xs"
        />
        <ScreenshotButton iframeId={iframeId} />
      </div>
      <iframe id={iframeId} src={url} className="flex-1 border-0 bg-neutral-900" />
    </div>
  );
}
