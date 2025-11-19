import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import pathModule from 'path';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { path: targetPath } = body;
  if (!targetPath) {
    return NextResponse.json({ ok: false, error: 'Missing path' }, { status: 400 });
  }
  try {
    const absPath = pathModule.resolve(targetPath);
    const stat = fs.lstatSync(absPath);
    if (stat.isDirectory()) {
      fs.rmSync(absPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(absPath);
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

