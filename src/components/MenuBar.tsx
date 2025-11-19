"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  FolderOpen, 
  Save, 
  Copy, 
  Scissors, 
  Clipboard,
  Undo,
  Redo,
  Search,
  Settings,
  ZoomIn,
  ZoomOut,
  GitBranch,
  Play,
  Terminal as TerminalIcon,
  HelpCircle,
  Code,
  Eye,
  Layout,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useIDEState } from '@/lib/ideState';
import { createEntry, listFiles, readFile } from '@/lib/fsClient';

type RunAction = 'debug' | 'run' | 'stop';
type HelpTopic = 'welcome' | 'docs' | 'shortcuts' | 'settings';

interface MenuBarProps {
  onShowTerminal: () => void;
  onClearTerminal: () => void;
  onTerminalMessage: (message: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  minimapEnabled: boolean;
  onToggleMinimap: () => void;
  onOpenCommandPalette: () => void;
  onRunCommand: (action: RunAction) => void;
  onShowHelp: (topic: HelpTopic) => void;
}

function emitEditorEvent(name: 'ide:go-to-symbol' | 'ide:go-to-line') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name));
}

const iconClass = 'mr-2 h-3 w-3 shrink-0 text-neutral-400';

export function MenuBar({
  onShowTerminal,
  onClearTerminal,
  onTerminalMessage,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  minimapEnabled,
  onToggleMinimap,
  onOpenCommandPalette,
  onRunCommand,
  onShowHelp,
}: MenuBarProps) {
  const menuContentClass =
    "w-52 bg-[#0f1624] border border-white/10 shadow-xl text-[12px] backdrop-blur-md";

  const {
    backend,
    projectRoot,
    setFiles,
    setCurrentFile,
    setEditorContent,
    setProjectRoot,
    setBackend,
  } = useIDEState();

  async function refreshFiles(root: string = projectRoot, backendOverride?: "local" | "puter") {
    try {
      const items = await listFiles(root, backendOverride ?? backend);
      setFiles(items);
    } catch (err: any) {
      console.error(err);
      alert("Failed to refresh files: " + err.message);
    }
  }

  function resolvePath(input: string) {
    if (!input) return "";
    if (input.startsWith("/")) return input;
    const base = projectRoot.endsWith("/") ? projectRoot.slice(0, -1) : projectRoot;
    return `${base}/${input}`;
  }

  async function handleNewFile() {
    const name = prompt("New file path (relative to project root):");
    if (!name) return;
    const path = resolvePath(name);
    await createEntry(path, false, backend);
    await refreshFiles();
    setCurrentFile(path);
    setEditorContent("");
  }

  async function handleOpenFile() {
    const pathInput = prompt("File path to open:");
    if (!pathInput) return;
    const path = resolvePath(pathInput);
    const content = await readFile(path, backend);
    setCurrentFile(path);
    setEditorContent(content);
  }

  async function handleCloneRepo() {
    const url = prompt("Git repository URL to clone:");
    if (!url) return;
    const folder = prompt("Clone into folder name:", url.split("/").pop()?.replace(/\.git$/, "") || "repo");
    if (!folder) return;
    try {
      const res = await fetch("/api/local/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd: "git", args: ["clone", url, folder] }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed to clone");
      setBackend("local");
      const newRoot = `./${folder}`;
      setProjectRoot(newRoot);
      await refreshFiles(newRoot, "local");
      alert("Cloned into " + newRoot);
    } catch (err: any) {
      alert("Clone failed: " + err.message);
    }
  }

  async function handleSetRoot() {
    const root = prompt("Project root (e.g. ./unlimited-coder or /path/to/project):", projectRoot);
    if (!root) return;
    setProjectRoot(root);
    await refreshFiles(root);
  }

  return (
    <div className="h-10 flex items-center justify-between px-2 border-b border-white/5 bg-[rgba(12,16,25,0.8)] backdrop-blur-md text-[11px] font-medium select-none">
      <div className="flex items-center gap-1">
        <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 font-semibold text-foreground shadow-sm">
          Unlimited Coder
        </span>
        <Separator orientation="vertical" className="h-5 mx-1 bg-white/5" />
        
        {/* File Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-3 text-[11px] font-medium hover:bg-white/5 rounded-md">
              File
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={menuContentClass} sideOffset={4}>
            <DropdownMenuItem onClick={handleNewFile}>
              <FileText className={iconClass} />
              New File
              <span className="ml-auto text-xs text-muted-foreground">⌘N</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenFile}>
              <FolderOpen className={iconClass} />
              Open File...
              <span className="ml-auto text-xs text-muted-foreground">⌘O</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSetRoot}>
              <FolderOpen className={iconClass} />
              Set Project Root
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCloneRepo}>
              <GitBranch className={iconClass} />
              Clone Git Repo
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Save className={iconClass} />
              Save
              <span className="ml-auto text-xs text-muted-foreground">⌘S</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Save className={iconClass} />
              Save As...
              <span className="ml-auto text-xs text-muted-foreground">⇧⌘S</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[11px] text-neutral-400">Current root</DropdownMenuLabel>
            <DropdownMenuItem className="text-[11px] text-neutral-300">
              {projectRoot || "./"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-3 text-[11px] font-medium hover:bg-white/5 rounded-md">
              Edit
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={menuContentClass} sideOffset={4}>
            <DropdownMenuItem>
              <Undo className={iconClass} />
              Undo
              <span className="ml-auto text-xs text-muted-foreground">⌘Z</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Redo className={iconClass} />
              Redo
              <span className="ml-auto text-xs text-muted-foreground">⇧⌘Z</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Scissors className={iconClass} />
              Cut
              <span className="ml-auto text-xs text-muted-foreground">⌘X</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className={iconClass} />
              Copy
              <span className="ml-auto text-xs text-muted-foreground">⌘C</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Clipboard className={iconClass} />
              Paste
              <span className="ml-auto text-xs text-muted-foreground">⌘V</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Search className={iconClass} />
              Find
              <span className="ml-auto text-xs text-muted-foreground">⌘F</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Search className={iconClass} />
              Replace
              <span className="ml-auto text-xs text-muted-foreground">⌥⌘F</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-3 text-[11px] font-medium hover:bg-white/5 rounded-md">
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={menuContentClass} sideOffset={4}>
            <DropdownMenuItem onClick={onZoomIn}>
              <ZoomIn className={iconClass} />
              Zoom In
              <span className="ml-auto text-xs text-muted-foreground">⌘=</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onZoomOut}>
              <ZoomOut className={iconClass} />
              Zoom Out
              <span className="ml-auto text-xs text-muted-foreground">⌘-</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onZoomReset}>
              <ZoomOut className={iconClass} />
              Reset Zoom
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onShowHelp('welcome')}>
              <Layout className={iconClass} />
              Appearance
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleMinimap}>
              <Eye className={iconClass} />
              {minimapEnabled ? 'Hide Minimap' : 'Show Minimap'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenCommandPalette}>
              <Code className={iconClass} />
              Command Palette...
              <span className="ml-auto text-xs text-muted-foreground">⌘⇧P</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Go Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-3 text-[11px] font-medium hover:bg-white/5 rounded-md">
              Go
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={menuContentClass} sideOffset={4}>
            <DropdownMenuItem onClick={handleOpenFile}>
              Go to File...
              <span className="ml-auto text-xs text-muted-foreground">⌘P</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => emitEditorEvent('ide:go-to-symbol')}>
              Go to Symbol...
              <span className="ml-auto text-xs text-muted-foreground">⌘⇧O</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => emitEditorEvent('ide:go-to-line')}>
              Go to Line...
              <span className="ml-auto text-xs text-muted-foreground">⌃G</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Run Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-3 text-[11px] font-medium hover:bg-white/5 rounded-md">
              Run
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={menuContentClass} sideOffset={4}>
            <DropdownMenuItem onClick={() => onRunCommand('debug')}>
              <Play className={iconClass} />
              Start Debugging
              <span className="ml-auto text-xs text-muted-foreground">F5</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRunCommand('run')}>
              Run Without Debugging
              <span className="ml-auto text-xs text-muted-foreground">⌃F5</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onRunCommand('stop')}>
              Stop
              <span className="ml-auto text-xs text-muted-foreground">⇧F5</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Terminal Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-3 text-[11px] font-medium hover:bg-white/5 rounded-md">
              Terminal
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={menuContentClass} sideOffset={4}>
            <DropdownMenuItem
              onClick={() => {
                onShowTerminal();
                onTerminalMessage('Opened new terminal session.');
              }}
            >
              <TerminalIcon className={iconClass} />
              New Terminal
              <span className="ml-auto text-xs text-muted-foreground">⌃`</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onShowTerminal();
                onTerminalMessage('Split terminals coming soon — showing primary terminal.');
              }}
            >
              Split Terminal
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClearTerminal}>
              Clear Terminal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-3 text-[11px] font-medium hover:bg-white/5 rounded-md">
              Help
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={menuContentClass} sideOffset={4}>
            <DropdownMenuItem onClick={() => onShowHelp('welcome')}>
              <HelpCircle className={iconClass} />
              Welcome
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShowHelp('docs')}>
              Documentation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShowHelp('shortcuts')}>
              Keyboard Shortcuts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onShowHelp('settings')}>
              <Settings className={iconClass} />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/50 border border-border/50">
          <Zap className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-medium text-muted-foreground">Puter.js</span>
        </div>
      </div>
    </div>
  );
}
