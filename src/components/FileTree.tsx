"use client";

import { useIDEState } from "@/lib/ideState";
import { getPuter } from "@/lib/puterClient";
import { randomId } from "@/lib/randomId";
import { useEffect, useState } from "react";
import { ChevronRightIcon, ChevronDownIcon, FileTextIcon } from "@radix-ui/react-icons";

// Simple folder icon component since FolderIcon doesn't exist in radix-ui
function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 15 15" fill="currentColor">
      <path d="M1 3.5C1 3.22386 1.22386 3 1.5 3H6.08579C6.21839 3 6.34557 3.05268 6.43934 3.14645L8.29289 5H13.5C13.7761 5 14 5.22386 14 5.5V12.5C14 12.7761 13.7761 13 13.5 13H1.5C1.22386 13 1 12.7761 1 12.5V3.5ZM2 4V12H13V6H7.70711L5.85355 4.14645C5.80569 4.09859 5.74858 4.06234 5.68571 4.04014L2 4Z" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}

interface Node {
  path: string;
  name: string;
  isDir: boolean;
  children?: Node[];
  open?: boolean;
}

async function fetchChildren(dirPath: string): Promise<Node[]> {
  const puter = getPuter();
  if (!puter) return [];
  const items = await puter.fs.readdir(dirPath);
  return items.map((it: any) => ({
    path: it.path,
    name: it.name ?? it.path.split("/").pop() ?? it.path,
    isDir: it.isDirectory ?? it.type === "directory",
  }));
}

export function FileTree() {
  const { projectRoot, currentFile, setCurrentFile, setEditorContent } = useIDEState();
  const [rootNodes, setRootNodes] = useState<Node[]>([]);
  const [menu, setMenu] = useState<{ open: boolean; x: number; y: number; node: Node | null }>({
    open: false,
    x: 0,
    y: 0,
    node: null,
  });

  useEffect(() => {
    (async () => {
      const children = await fetchChildren(projectRoot);
      setRootNodes(children);
    })();
  }, [projectRoot]);

  async function onOpenFile(node: Node) {
    const puter = getPuter();
    if (!puter) return;
    try {
      const blob = await puter.fs.read(node.path);
      const text = await blob.text();
      setCurrentFile(node.path);
      setEditorContent(text);
    } catch (e) {
      console.error("Failed to read file", e);
    }
  }

  async function toggleNode(node: Node) {
    if (!node.isDir) {
      await onOpenFile(node);
      return;
    }
    if (!node.open) {
      const children = await fetchChildren(node.path);
      node.children = children;
      node.open = true;
    } else {
      node.open = false;
    }
    setRootNodes([...rootNodes]);
  }

  function onContextMenu(e: React.MouseEvent, node: Node) {
    e.preventDefault();
    setMenu({ open: true, x: e.clientX, y: e.clientY, node });
  }

  useEffect(() => {
    function onClose() {
      setMenu((m) => ({ ...m, open: false }));
    }
    const onEsc = (evt: KeyboardEvent) => {
      if (evt.key === "Escape") onClose();
    };
    window.addEventListener("click", onClose);
    window.addEventListener("contextmenu", onClose);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("click", onClose);
      window.removeEventListener("contextmenu", onClose);
      window.removeEventListener("keydown", onEsc);
    };
  }, []);

  async function copyPath(node?: Node | null) {
    if (!node) return;
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(node.path);
    }
  }

  async function openNode(node?: Node | null) {
    if (!node) return;
    await toggleNode(node);
  }

  function renderNode(node: Node, depth = 0) {
    const isActive = node.path === currentFile;
    return (
      <div key={node.path}>
        <button
          onClick={() => toggleNode(node)}
          onContextMenu={(e) => onContextMenu(e, node)}
          className={`w-full flex items-center gap-1 px-2 py-1 text-left text-[11px] rounded-md transition ${
            isActive ? "bg-white/10 text-neutral-50 border border-white/10" : "hover:bg-white/5"
          }`}
          style={{ paddingLeft: 8 + depth * 10 }}
        >
          {node.isDir ? (
            node.open ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />
          ) : (
            <span className="w-3 h-3" />
          )}
          {node.isDir ? <FolderIcon className="w-3 h-3 text-amber-400" /> : <FileTextIcon className="w-3 h-3 text-sky-400" />}
          <span className="truncate">{node.name}</span>
        </button>
        {node.isDir && node.open && node.children && (
          <div className="ml-0">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative py-1">
      {rootNodes.map((node) => renderNode(node))}

      {menu.open && menu.node && (
        <div
          className="fixed z-50 min-w-[180px] rounded-lg border border-white/10 bg-[#0f1624] shadow-xl text-xs text-neutral-100 backdrop-blur"
          style={{ left: menu.x + 4, top: menu.y + 4 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-white/5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">Actions</div>
            <div className="text-sm font-semibold truncate text-white">{menu.node.name}</div>
          </div>
          <button
            className="w-full text-left px-3 py-2 hover:bg-white/5 transition"
            onClick={() => {
              openNode(menu.node);
              setMenu((m) => ({ ...m, open: false }));
            }}
          >
            Open
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-white/5 transition"
            onClick={async () => {
              await copyPath(menu.node);
              setMenu((m) => ({ ...m, open: false }));
            }}
          >
            Copy path
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-white/5 transition"
            onClick={() => {
              setMenu((m) => ({ ...m, open: false }));
              useIDEState.getState().appendChat({
                id: randomId(),
                role: "user",
                content: `Inspect and help with file: ${menu.node?.path}`,
              });
            }}
          >
            Add to chat
          </button>
        </div>
      )}
    </div>
  );
}
