"use client";

import { getPuter } from "@/lib/puterClient";
import { useIDEState } from "@/lib/ideState";

export async function initPuterProject(root: string) {
  const puter = getPuter();
  if (!puter) return;

  const { setFiles, setCurrentFile, setEditorContent } = useIDEState.getState();

  try {
    const items = await puter.fs.readdir(root);
    const normalized = items.map((item: any) => ({
      path: item.path,
      isDirectory: item.isDirectory ?? item.type === "directory",
    }));
    setFiles(normalized);

    // auto-open first non-directory file
    const firstFile = normalized.find((f: any) => !f.isDirectory);
    if (firstFile) {
      setCurrentFile(firstFile.path);
      const blob = await puter.fs.read(firstFile.path);
      const text = await blob.text();
      setEditorContent(text);
    }
  } catch (e) {
    console.error("Failed to init Puter project", e);
  }
}
