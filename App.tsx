
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import AdminPanel from './components/AdminPanel';
import { DocumentFile, Message, ChatState, AppView, BotConfig } from './types';
import { queryDocuments } from './services/geminiService';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    documents: [],
    currentView: 'admin',
    botConfig: {
      name: 'DocuSupport AI',
      rules: 'Always be polite. If unsure, ask the customer for clarification.'
    }
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Load from "Database" on mount
  useEffect(() => {
    const init = async () => {
      const [savedConfig, savedDocs] = await Promise.all([
        dbService.loadBotConfig(),
        dbService.loadDocuments()
      ]);

      setState(prev => ({
        ...prev,
        botConfig: savedConfig || prev.botConfig,
        documents: savedDocs || prev.documents
      }));
    };
    init();
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (state.documents.length + files.length > 100) {
      alert(`Max 100 files allowed.`);
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    const newDocuments: DocumentFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 100 * 1024 * 1024) {
        alert(`${file.name} is over 100MB.`);
        continue;
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const newDoc: DocumentFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type || 'application/octet-stream',
          base64,
          size: file.size,
          uploadDate: new Date(),
        };

        // Persist to DB
        await dbService.saveDocument(newDoc);
        newDocuments.push(newDoc);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    setState(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
    setIsUploading(false);
    e.target.value = '';
  }, [state.documents.length]);

  const handleRemoveDocument = useCallback(async (id: string) => {
    await dbService.deleteDocument(id);
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== id)
    }));
  }, []);

  const handleBotConfigChange = useCallback((botConfig: BotConfig) => {
    setState(prev => ({ ...prev, botConfig }));
  }, []);

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    await dbService.saveBotConfig(state.botConfig);
    setIsSavingConfig(false);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }));

    try {
      const response = await queryDocuments(text, state.documents, state.botConfig, state.messages);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false
      }));
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `Support Error: ${error instanceof Error ? error.message : "Technical issue."}`,
        timestamp: new Date(),
      };
      setState(prev => ({ ...prev, messages: [...prev.messages, errorMessage], isLoading: false }));
    }
  }, [state.documents, state.messages, state.botConfig]);

  const setView = (view: AppView) => {
    setState(prev => ({ ...prev, currentView: view }));
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar 
        currentView={state.currentView}
        onViewChange={setView}
        documentCount={state.documents.length}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {state.currentView === 'admin' ? (
          <AdminPanel 
            documents={state.documents}
            onUpload={handleFileUpload}
            onRemove={handleRemoveDocument}
            isUploading={isUploading}
            botConfig={state.botConfig}
            onBotConfigChange={handleBotConfigChange}
            onSaveConfig={handleSaveConfig}
            isSaving={isSavingConfig}
          />
        ) : (
          <ChatWindow 
            messages={state.messages}
            isLoading={state.isLoading}
            onSendMessage={handleSendMessage}
            hasDocs={state.documents.length > 0}
            botName={state.botConfig.name}
          />
        )}
      </main>
    </div>
  );
};

export default App;
