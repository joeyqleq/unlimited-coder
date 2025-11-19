"use client";
import html2canvas from 'html2canvas';
import { getPuter } from '@/lib/puterClient';

export function ScreenshotButton({ iframeId }: { iframeId: string }) {
  async function handleCapture() {
    try {
      const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
      if (!iframe) throw new Error('Preview iframe not found');
      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc) throw new Error('Cannot access iframe document');
      const canvas = await html2canvas(iframeDoc.body);
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
      const puter = getPuter();
      if (!puter) throw new Error('Puter not loaded');
      const filePath = `/screenshots/${Date.now()}.png`;
      await puter.fs.write(filePath, blob);
      alert('Screenshot saved to ' + filePath);
    } catch (err: any) {
      alert('Failed to capture screenshot: ' + err.message);
    }
  }
  return (
    <button
      className="px-2 py-0.5 rounded bg-rose-600 text-xs text-white hover:bg-rose-500"
      onClick={handleCapture}
    >
      Screenshot
    </button>
  );
}
