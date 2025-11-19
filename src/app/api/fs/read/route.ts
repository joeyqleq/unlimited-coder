import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import pathModule from 'path';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { path: filePath } = body;
  if (!filePath) {
    return NextResponse.json({ ok: false, error: 'Missing path' }, { status: 400 });
  }
  try {
    const absPath = pathModule.resolve(filePath);
    const content = fs.readFileSync(absPath, 'utf-8');
    return NextResponse.json({ ok: true, content });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

