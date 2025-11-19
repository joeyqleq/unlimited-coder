"use client";

import { Suspense, useState, useEffect } from 'react';
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
import { cn } from '@/lib/utils';

type PanelView = 'editor' | 'chat' | 'terminal' | 'preview' | 'analytics';

export default function Page() {
  const { projectRoot } = useIDEState();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modalView, setModalView] = useState<'npc' | 'providers' | 'npcServer' | 'mcpStore' | 'summaries' | 'analytics'>('npc');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(false);
  
  useEffect(() => {
    initPuterProject(projectRoot);
  }, [projectRoot]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-b from-black/60 via-slate-950 to-slate-950 text-foreground">
      {/* Top Menu Bar - VS Code style */}
      <MenuBar />

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
              <CodeEditor />
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
              <ResizablePanel 
                defaultSize={bottomPanelCollapsed ? 5 : 30} 
                minSize={5}
                collapsible
              >
                <div className="h-full flex flex-col border-t border-white/5 bg-slate-950/70">
                  <div className="h-8 flex items-center justify-between px-3 border-b border-white/5 bg-white/5">
                    <Tabs defaultValue="preview" className="w-full">
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
                    </Tabs>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setBottomPanelCollapsed(!bottomPanelCollapsed)}
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
                      <Tabs defaultValue="preview" className="h-full flex flex-col">
                        <TabsContent value="preview" className="flex-1 m-0">
                <PreviewPane />
              </TabsContent>
                        <TabsContent value="terminal" className="flex-1 m-0">
                <TerminalPane />
              </TabsContent>
          </Tabs>
        </div>
                  )}
                </div>
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
    </div>
  );
}
