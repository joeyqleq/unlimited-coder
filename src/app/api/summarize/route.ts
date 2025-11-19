import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import pathModule from 'path';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { filePath, modelId } = body;
  if (!filePath) {
    return NextResponse.json({ ok: false, error: 'Missing filePath' }, { status: 400 });
  }
  try {
    const absPath = pathModule.resolve(filePath);
    const content = fs.readFileSync(absPath, 'utf-8');
    // Use Puter AI via fetch; placeholder implementation
    const summarizationPrompt = `Summarize the following file in bullet points:\n\n${content}`;
    const response = await fetch('https://api.puter.com/v2/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'system', content: summarizationPrompt }], model: modelId }),
    });
    const data = await response.json();
    const summary = data.message?.content ?? '';
    return NextResponse.json({ ok: true, summary });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

