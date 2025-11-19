import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import pathModule from 'path';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { dir } = body;
  if (!dir) {
    return NextResponse.json({ ok: false, error: 'Missing dir' }, { status: 400 });
  }
  try {
    const absPath = pathModule.resolve(dir);
    const entries = fs.readdirSync(absPath, { withFileTypes: true });
    const items = entries.map((entry) => ({
      path: pathModule.join(absPath, entry.name),
      isDirectory: entry.isDirectory(),
    }));
    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

