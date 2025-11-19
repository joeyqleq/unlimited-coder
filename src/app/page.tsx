"use client";

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useIDEState } from '@/lib/ideState';
import { FileTree } from '@/components/FileTree';
import { CodeEditor } from '@/components/CodeEditor';
import { ChatPanel } from '@/components/ChatPanel';
import { TerminalPane } from '@/components/TerminalPane';
import { PreviewPane } from '@/components/PreviewPane';
import { ModelSelector } from '@/components/ModelSelector';
import { NPCSelector } from '@/components/NPCSelector';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { MenuBar } from '@/components/MenuBar';
import { CommandPalette } from '@/components/CommandPalette';
import { NPCManager } from '@/components/settings/NPCManager';
import { ProviderManager } from '@/components/settings/ProviderManager';
import { NPCServerManager } from '@/components/settings/NPCServerManager';
import { MCPStore } from '@/components/settings/MCPStore';
import { SummaryView } from '@/components/SummaryView';
import { BackendToggle } from '@/components/BackendToggle';
import { initPuterProject } from '@/components/boot/initPuterProject';
import { PuterIndicator } from '@/components/PuterIndicator';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { 
  Settings, 
  MessageSquare, 
  Terminal, 
  Monitor, 
  BarChart3,
  ChevronDown,
  ChevronUp,
  Folder,
  Code
} from 'lucide-react';
type HelpTopic = 'welcome' | 'docs' | 'shortcuts' | 'settings';

const HELP_CONTENT: Record<HelpTopic, { title: string; body: string[] }> = {
  welcome: {
    title: 'Welcome to Unlimited Coder',
    body: [
      'Use the Explorer to open files, the chat panel to collaborate with LLMs, and the bottom panel for preview and terminal access.',
      'Switch models or NPC personas from the toolbar to tailor responses for architecture, UI polish, or rapid prototyping.',
    ],
  },
  docs: {
    title: 'Documentation',
    body: [
      'Documentation links will appear here soon. For now, explore the Providers modal to connect Anthropic, OpenAI, or Gemini endpoints.',
      'Need API details? Use the chat panel to ask for quick references or generate code snippets.',
    ],
  },
  shortcuts: {
    title: 'Keyboard Shortcuts',
    body: [
      '⌘ + P opens the file prompt, while ⌘ + ⇧ + P opens this command palette.',
      'Use ⌘ + Enter inside inputs to submit faster. Command palette items can be fuzzy searched.',
    ],
  },
  settings: {
    title: 'Settings & Personalization',
    body: [
      'Open Providers, NPC servers, or the MCP store from the toolbar to tweak integrations.',
      'Theme switching, minimap visibility, and layout zoom controls live in the View menu.',
    ],
  },
};

export default function Page() {
  const { projectRoot } = useIDEState();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modalView, setModalView] = useState<'npc' | 'providers' | 'npcServer' | 'mcpStore' | 'summaries' | 'analytics'>('npc');
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(false);
  const [bottomPanelTab, setBottomPanelTab] = useState<'preview' | 'terminal'>('preview');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showMinimap, setShowMinimap] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [helpTopic, setHelpTopic] = useState<HelpTopic | null>(null);
  
  useEffect(() => {
    initPuterProject(projectRoot);
  }, [projectRoot]);

  const sendTerminalEvent = useCallback((detail: { text?: string; clear?: boolean }) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('ide:terminal-message', { detail }));
  }, []);

  const handleShowTerminal = useCallback(() => {
    setBottomPanelCollapsed(false);
    setBottomPanelTab('terminal');
  }, []);

  const handleShowPreview = useCallback(() => {
    setBottomPanelCollapsed(false);
    setBottomPanelTab('preview');
  }, []);

  const handleTerminalMessage = useCallback(
    (message: string) => {
      sendTerminalEvent({ text: message });
    },
    [sendTerminalEvent],
  );

  const handleClearTerminal = useCallback(() => {
    handleShowTerminal();
    sendTerminalEvent({ clear: true });
  }, [handleShowTerminal, sendTerminalEvent]);

  const handleRunCommand = useCallback(
    (action: 'debug' | 'run' | 'stop') => {
      handleShowTerminal();
      const text =
        action === 'debug'
          ? 'Starting debugger (simulated).'
          : action === 'run'
          ? 'Running project without debugger.'
          : 'Stopped active command.';
      sendTerminalEvent({ text: `[Run] ${text}` });
    },
    [handleShowTerminal, sendTerminalEvent],
  );

  const zoomIn = useCallback(() => setZoomLevel((z) => Math.min(1.5, +(z + 0.1).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoomLevel((z) => Math.max(0.5, +(z - 0.1).toFixed(2))), []);
  const resetZoom = useCallback(() => setZoomLevel(1), []);
  const toggleMinimap = useCallback(() => setShowMinimap((prev) => !prev), []);

  const openProviders = useCallback(() => {
    setModalView('providers');
    setSettingsOpen(true);
  }, [setModalView, setSettingsOpen]);

  const openNPCManager = useCallback(() => {
    setModalView('npc');
    setSettingsOpen(true);
  }, [setModalView, setSettingsOpen]);

  const openAnalytics = useCallback(() => {
    setModalView('analytics');
    setSettingsOpen(true);
  }, [setModalView, setSettingsOpen]);

  const commandPaletteCommands = useMemo(
    () => [
      { id: 'terminal', label: 'Show Terminal', description: 'Focus terminal panel', action: handleShowTerminal },
      { id: 'preview', label: 'Show Preview', description: 'Focus preview panel', action: handleShowPreview },
      { id: 'providers', label: 'Open Provider Manager', action: openProviders },
      { id: 'npc', label: 'Open NPC Manager', action: openNPCManager },
      { id: 'analytics', label: 'Open Analytics Dashboard', action: openAnalytics },
      { id: 'minimap', label: showMinimap ? 'Hide Minimap' : 'Show Minimap', action: toggleMinimap },
    ],
    [handleShowTerminal, handleShowPreview, openProviders, openNPCManager, openAnalytics, showMinimap, toggleMinimap],
  );

  const currentHelp = helpTopic ? HELP_CONTENT[helpTopic] : null;

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-b from-black/60 via-slate-950 to-slate-950 text-foreground"
      style={{ fontSize: `${Math.round(zoomLevel * 100)}%` }}
    >
      {/* Top Menu Bar - VS Code style */}
      <MenuBar
        onShowTerminal={handleShowTerminal}
        onClearTerminal={handleClearTerminal}
        onTerminalMessage={handleTerminalMessage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomReset={resetZoom}
        minimapEnabled={showMinimap}
        onToggleMinimap={toggleMinimap}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onRunCommand={handleRunCommand}
        onShowHelp={(topic) => setHelpTopic(topic)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Resizable */}
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel 
            defaultSize={15} 
            minSize={5}
            maxSize={30}
            collapsible
            className="border-r border-white/5 bg-slate-950/70"
          >
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="h-10 flex items-center justify-between px-3 border-b border-white/5 bg-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-neutral-300" />
                  <span className="text-sm font-semibold text-foreground">Explorer</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
            onClick={() => {
              setModalView('npc');
              setSettingsOpen(true);
            }}
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              {/* File Tree */}
              <div className="flex-1 overflow-auto p-2">
                <Suspense fallback={
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading files…
        </div>
                }>
            <FileTree />
          </Suspense>
        </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Editor/Chat Area */}
          <ResizablePanel defaultSize={70} minSize={40}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              {/* Top Bar - Model Selector & Controls */}
              <div className="h-12 flex items-center justify-between px-4 border-b border-white/5 bg-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-300">Model:</span>
            <ModelSelector />
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-300">NPC:</span>
            <NPCSelector />
                  </div>
                  <Separator orientation="vertical" className="h-4" />
            <BackendToggle />
          </div>
                <div className="flex items-center gap-3">
                  <PuterIndicator />
                  <ThemeSwitcher />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-[11px] min-w-[110px]"
              onClick={() => {
                setModalView('providers');
                setSettingsOpen(true);
              }}
            >
              Providers
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-[11px] min-w-[110px]"
              onClick={() => {
                setModalView('npcServer');
                setSettingsOpen(true);
              }}
            >
              MCP Servers
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-[11px] min-w-[110px]"
              onClick={() => {
                setModalView('mcpStore');
                setSettingsOpen(true);
              }}
            >
              MCP Store
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-[11px] min-w-[110px]"
              onClick={() => {
                      setModalView('analytics');
                setSettingsOpen(true);
              }}
            >
                    <BarChart3 className="h-3.5 w-3.5 mr-1" />
                    Analytics
                  </Button>
          </div>
        </div>

              {/* Editor and Chat Panels */}
              <ResizablePanel defaultSize={70} minSize={30}>
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  {/* Code Editor */}
                  <ResizablePanel defaultSize={65} minSize={30}>
                    <div className="h-full flex flex-col border-r border-white/5">
                      <div className="h-8 flex items-center justify-between px-3 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-2">
                          <Code className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">Editor</span>
                        </div>
            </div>
            <div className="flex-1 min-h-0">
              <CodeEditor showMinimap={showMinimap} />
            </div>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  {/* Chat Panel */}
                  <ResizablePanel defaultSize={35} minSize={25}>
                    <div className="h-full flex flex-col">
                      <div className="h-8 flex items-center justify-between px-3 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">AI Chat</span>
                        </div>
            </div>
            <div className="flex-1 min-h-0">
              <ChatPanel />
            </div>
        </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Bottom Panel - Terminal/Preview */}
              <ResizablePanel defaultSize={bottomPanelCollapsed ? 5 : 30} minSize={5} collapsible>
                <Tabs
                  value={bottomPanelTab}
                  onValueChange={(value) => setBottomPanelTab((value as 'preview' | 'terminal') ?? 'preview')}
                  className="h-full flex flex-col border-t border-white/5 bg-slate-950/70"
                >
                  <div className="h-8 flex items-center justify-between px-3 border-b border-white/5 bg-white/5">
                    <TabsList className="h-7">
                      <TabsTrigger value="preview" className="h-6 px-3 text-xs">
                        <Monitor className="h-3 w-3 mr-1.5" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="terminal" className="h-6 px-3 text-xs">
                        <Terminal className="h-3 w-3 mr-1.5" />
                        Terminal
                      </TabsTrigger>
                    </TabsList>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setBottomPanelCollapsed((prev) => !prev)}
                    >
                      {bottomPanelCollapsed ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  {!bottomPanelCollapsed && (
                    <div className="flex-1 min-h-0">
                      <TabsContent value="preview" className="flex-1 m-0" forceMount>
                        <PreviewPane />
                      </TabsContent>
                      <TabsContent value="terminal" className="flex-1 m-0" forceMount>
                        <TerminalPane />
                      </TabsContent>
                    </div>
                  )}
                </Tabs>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="w-[1100px] max-w-[calc(100vw-64px)] max-h-[90vh] overflow-hidden flex flex-col bg-[#0c1422] border border-white/10 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {modalView === 'npc'
            ? 'NPC Manager'
            : modalView === 'providers'
            ? 'Provider Manager'
            : modalView === 'npcServer'
            ? 'MCP Servers'
            : modalView === 'mcpStore'
            ? 'MCP Store'
            : modalView === 'analytics'
            ? 'Analytics & Usage'
            : 'Summaries'}
            </DialogTitle>
            <DialogDescription>
              {modalView === 'analytics'
                ? 'Track token usage, model performance, and costs'
                : modalView === 'mcpStore'
                ? 'One-click add curated MCP servers (local or remote)'
                : 'Manage your AI configuration'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
        {modalView === 'npc' ? (
          <NPCManager />
        ) : modalView === 'providers' ? (
          <ProviderManager />
        ) : modalView === 'npcServer' ? (
          <NPCServerManager />
        ) : modalView === 'mcpStore' ? (
          <MCPStore />
            ) : modalView === 'analytics' ? (
              <AnalyticsDashboard />
        ) : (
          <SummaryView />
        )}
          </div>
        </DialogContent>
      </Dialog>
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commandPaletteCommands}
      />
      <Dialog open={!!helpTopic} onOpenChange={(open) => { if (!open) setHelpTopic(null); }}>
        <DialogContent className="w-[520px] max-w-[calc(100vw-64px)] bg-[#0c1422] border border-white/10 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{currentHelp?.title ?? 'Help'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-neutral-200">
            {currentHelp
              ? currentHelp.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))
              : (
                <p>Select a help topic to get guidance and shortcuts.</p>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
