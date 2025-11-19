import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get('id');
  const body = await req.json();
  const { messages, apiKey, apiUrl } = body;
  if (!providerId || !apiKey || !apiUrl) {
    return NextResponse.json({ ok: false, error: 'Missing providerId, apiKey, or apiUrl' }, { status: 400 });
  }
  try {
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ messages }),
    });
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

