import { NextRequest } from 'next/server';
import { spawn } from 'child_process';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { cmd, args = [], cwd = process.cwd() } = body;
  if (!cmd || typeof cmd !== 'string') {
    return new Response('Missing command', { status: 400 });
  }
  const proc = spawn(cmd, args, { cwd, shell: true });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      proc.stdout.on('data', (data) => controller.enqueue(encoder.encode(data)));
      proc.stderr.on('data', (data) => controller.enqueue(encoder.encode(data)));
      proc.on('close', () => controller.close());
    },
    cancel() {
      proc.kill();
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

