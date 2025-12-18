'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import AdminPanel from '@/components/AdminPanel';
import { DocumentFile, Message, ChatState, AppView, BotConfig } from '@/types';
import { apiService } from '@/services/apiService';

export default function Home() {
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

  // Load from API on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [savedConfig, savedDocs] = await Promise.all([
          apiService.getConfig(),
          apiService.getDocuments()
        ]);

        setState(prev => ({
          ...prev,
          botConfig: savedConfig || prev.botConfig,
          documents: savedDocs || prev.documents
        }));
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
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
      if (file.size > 100 * 1024 * 1024) { // 100MB
        alert(`${file.name} is over 100MB.`);
        continue;
      }

      try {
        const uploadedDoc = await apiService.uploadDocument(file);
        if (uploadedDoc) {
          newDocuments.push(uploadedDoc);
        }
      } catch (err) {
        console.error("Upload failed for file:", file.name, err);
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
    const success = await apiService.deleteDocument(id);
    if (success) {
      setState(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== id)
      }));
    }
  }, []);

  const handleBotConfigChange = useCallback((botConfig: BotConfig) => {
    setState(prev => ({ ...prev, botConfig }));
  }, []);

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    await apiService.saveConfig(state.botConfig);
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
      const responseText = await apiService.sendChat(text, state.messages);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
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
  }, [state.messages]);

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
}
