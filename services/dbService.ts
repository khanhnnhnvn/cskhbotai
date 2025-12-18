
import { BotConfig, DocumentFile } from "../types";

/**
 * DATABASE CONFIGURATION (LOADED FROM .ENV)
 * In a real backend, these would be used by a driver like 'mysql2'
 */
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '3306',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'docusupport_db'
};

const STORAGE_KEYS = {
  BOT_CONFIG: 'docusupport_bot_config',
  DOCUMENTS: 'docusupport_documents'
};

// Simulated API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dbService = {
  async saveBotConfig(config: BotConfig): Promise<boolean> {
    console.log(`Connecting to MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port}...`);
    console.log(`Using Database: ${DB_CONFIG.database}`);
    
    await delay(800); // Simulate database write latency
    localStorage.setItem(STORAGE_KEYS.BOT_CONFIG, JSON.stringify(config));
    return true;
  },

  async loadBotConfig(): Promise<BotConfig | null> {
    const data = localStorage.getItem(STORAGE_KEYS.BOT_CONFIG);
    return data ? JSON.parse(data) : null;
  },

  async saveDocument(doc: DocumentFile): Promise<boolean> {
    console.log(`Inserting document '${doc.name}' into MySQL table 'documents'...`);
    const existing = await this.loadDocuments();
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([...existing, doc]));
    return true;
  },

  async loadDocuments(): Promise<DocumentFile[]> {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!data) return [];
    const parsed = JSON.parse(data);
    // Restore Date objects
    return parsed.map((doc: any) => ({
      ...doc,
      uploadDate: new Date(doc.uploadDate)
    }));
  },

  async deleteDocument(id: string): Promise<boolean> {
    console.log(`Executing DELETE FROM documents WHERE id = '${id}'...`);
    const existing = await this.loadDocuments();
    const filtered = existing.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered));
    return true;
  }
};
