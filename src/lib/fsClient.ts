import { getPuter } from './puterClient';

export interface FileEntry {
  path: string;
  isDirectory: boolean;
}

/**
 * List files in a directory
 */
export async function listFiles(dir: string, backend: 'local' | 'puter'): Promise<FileEntry[]> {
  if (backend === 'puter') {
    const puter = getPuter();
    if (!puter) throw new Error('Puter not loaded');
    try {
      const entries = await puter.fs.list(dir);
      return entries.map((entry: any) => ({
        path: entry.path || entry.name,
        isDirectory: entry.isDirectory || entry.type === 'directory',
      }));
    } catch (err) {
      console.error('Failed to list files', err);
      return [];
    }
  } else {
    // Local backend - would need API route
    const res = await fetch('/api/fs/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dir }),
    });
    if (!res.ok) throw new Error('Failed to list files');
    return await res.json();
  }
}

/**
 * Read a file
 */
export async function readFile(path: string, backend: 'local' | 'puter'): Promise<string> {
  if (backend === 'puter') {
    const puter = getPuter();
    if (!puter) throw new Error('Puter not loaded');
    try {
      const content = await puter.fs.read(path);
      return typeof content === 'string' ? content : await content.text();
    } catch (err) {
      throw new Error(`Failed to read file: ${err}`);
    }
  } else {
    const res = await fetch('/api/fs/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    if (!res.ok) throw new Error('Failed to read file');
    const data = await res.json();
    return data.content;
  }
}

/**
 * Write to a file
 */
export async function writeFile(
  path: string,
  content: string,
  backend: 'local' | 'puter'
): Promise<void> {
  if (backend === 'puter') {
    const puter = getPuter();
    if (!puter) throw new Error('Puter not loaded');
    await puter.fs.write(path, content);
  } else {
    const res = await fetch('/api/fs/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content }),
    });
    if (!res.ok) throw new Error('Failed to write file');
  }
}

/**
 * Create a file or directory
 */
export async function createEntry(
  path: string,
  isDirectory: boolean,
  backend: 'local' | 'puter'
): Promise<void> {
  if (backend === 'puter') {
    const puter = getPuter();
    if (!puter) throw new Error('Puter not loaded');
    if (isDirectory) {
      await puter.fs.mkdir(path);
    } else {
      await puter.fs.write(path, '');
    }
  } else {
    const res = await fetch('/api/fs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, isDirectory }),
    });
    if (!res.ok) throw new Error('Failed to create entry');
  }
}

/**
 * Delete a file or directory
 */
export async function deleteEntry(path: string, backend: 'local' | 'puter'): Promise<void> {
  if (backend === 'puter') {
    const puter = getPuter();
    if (!puter) throw new Error('Puter not loaded');
    await puter.fs.unlink(path);
  } else {
    const res = await fetch('/api/fs/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    if (!res.ok) throw new Error('Failed to delete entry');
  }
}

/**
 * Apply a unified diff to a file
 */
export async function applyPatch(
  path: string,
  diff: string,
  backend: 'local' | 'puter'
): Promise<void> {
  // Read current content
  const currentContent = await readFile(path, backend);
  
  // Simple patch application (basic implementation)
  // For production, use a proper diff library like 'diff' or 'diff-match-patch'
  const lines = currentContent.split('\n');
  const diffLines = diff.split('\n');
  const result: string[] = [];
  let i = 0;
  
  for (const line of diffLines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      result.push(line.substring(1));
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      // Skip this line from original
      i++;
    } else if (line.startsWith(' ')) {
      result.push(line.substring(1));
      i++;
    } else if (!line.startsWith('@@') && !line.startsWith('diff')) {
      // Keep original line if not a diff marker
      if (i < lines.length) {
        result.push(lines[i]);
        i++;
      }
    }
  }
  
  // Add remaining lines
  while (i < lines.length) {
    result.push(lines[i]);
    i++;
  }
  
  await writeFile(path, result.join('\n'), backend);
}

/**
 * Save a summary to KV storage
 */
export async function saveSummary(path: string, summary: string): Promise<void> {
  const puter = getPuter();
  if (!puter) throw new Error('Puter not loaded');
  await puter.kv.set(`summary:${path}`, summary);
}

/**
 * Get a summary from KV storage
 */
export async function getSummary(path: string): Promise<string | null> {
  const puter = getPuter();
  if (!puter) return null;
  try {
    const summary = await puter.kv.get(`summary:${path}`);
    return summary || null;
  } catch (err) {
    return null;
  }
}

