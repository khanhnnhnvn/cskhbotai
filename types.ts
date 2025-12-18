
export type AppView = 'admin' | 'customer';

export interface BotConfig {
  name: string;
  rules: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  base64: string;
  size: number;
  uploadDate: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  documents: DocumentFile[];
  currentView: AppView;
  botConfig: BotConfig;
}
