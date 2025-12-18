import { BotConfig, DocumentFile, Message } from '@/types';

export const apiService = {
    async getDocuments(): Promise<DocumentFile[]> {
        const res = await fetch('/api/documents');
        if (!res.ok) return [];
        const docs = await res.json();
        // Convert date strings back to Date objects if needed
        return docs.map((d: any) => ({ ...d, uploadDate: new Date(d.uploadDate) }));
    },

    async uploadDocument(file: File): Promise<DocumentFile | null> {
        const reader = new FileReader();
        return new Promise((resolve) => {
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const res = await fetch('/api/documents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: file.name,
                        type: file.type || 'application/octet-stream',
                        size: file.size,
                        base64
                    })
                });
                if (res.ok) {
                    const doc = await res.json();
                    resolve({ ...doc, uploadDate: new Date(doc.uploadDate) });
                } else {
                    resolve(null);
                }
            };
            reader.readAsDataURL(file);
        });
    },

    async deleteDocument(id: string): Promise<boolean> {
        const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
        return res.ok;
    },

    async getConfig(): Promise<BotConfig> {
        const res = await fetch('/api/config');
        if (!res.ok) return { name: 'DocuSupport AI', rules: '' };
        return res.json();
    },

    async saveConfig(config: BotConfig): Promise<boolean> {
        const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        return res.ok;
    },

    async sendChat(message: string, history: Message[]): Promise<string> {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history })
        });
        if (!res.ok) throw new Error('Failed to send message');
        const data = await res.json();
        return data.text;
    }
};
