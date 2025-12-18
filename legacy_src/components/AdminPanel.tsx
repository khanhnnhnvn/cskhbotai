
import React, { useState } from 'react';
import { Upload, Trash2, FileText, HardDrive, FileCheck, AlertCircle, Loader2, Settings2, ShieldCheck, Save, Database, CheckCircle2 } from 'lucide-react';
import { DocumentFile, BotConfig } from '../types';

interface AdminPanelProps {
  documents: DocumentFile[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
  isUploading: boolean;
  botConfig: BotConfig;
  onBotConfigChange: (config: BotConfig) => void;
  onSaveConfig: () => Promise<void>;
  isSaving: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  documents, 
  onUpload, 
  onRemove, 
  isUploading, 
  botConfig, 
  onBotConfigChange,
  onSaveConfig,
  isSaving
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const totalSize = documents.reduce((acc, doc) => acc + doc.size, 0);
  const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

  const handleSave = async () => {
    await onSaveConfig();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200 uppercase tracking-tight">
                <Database size={10} />
                Database Connected
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm">Persistence enabled. All changes are stored in the secure backend.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 min-w-[160px]">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">DB Record Count</p>
                <p className="text-xl font-bold text-slate-900">{documents.length} / 100</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bot Configuration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Settings2 size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Agent Persona</h2>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
                    ${saveSuccess 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                      : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200'}
                    ${isSaving ? 'opacity-70 cursor-wait' : ''}
                  `}
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : saveSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
                  {isSaving ? 'Saving...' : saveSuccess ? 'Saved to DB' : 'Update Database'}
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bot Name</label>
                  <input 
                    type="text"
                    value={botConfig.name}
                    onChange={(e) => onBotConfigChange({ ...botConfig, name: e.target.value })}
                    placeholder="e.g. DocuSupport AI"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Behavior & Response Rules</label>
                  <textarea 
                    rows={5}
                    value={botConfig.rules}
                    onChange={(e) => onBotConfigChange({ ...botConfig, rules: e.target.value })}
                    placeholder="Define how the bot should behave..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Document Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <Database size={16} className="text-slate-400" />
                  MySQL Storage: Knowledge Assets
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {sizeInMB} MB total
                </div>
              </div>
              
              {documents.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                  <FileText size={48} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="text-sm">No data records found in MySQL.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-100">
                        <th className="px-6 py-4">Filename</th>
                        <th className="px-6 py-4">Size</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <FileText size={18} />
                              </div>
                              <span className="font-medium text-slate-700 truncate max-w-[200px]">{doc.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{(doc.size / 1024 / 1024).toFixed(2)} MB</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => onRemove(doc.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center hover:border-blue-400 transition-colors group relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                onChange={onUpload}
                multiple
                accept=".pdf,.txt,.doc,.docx"
                disabled={isUploading || documents.length >= 100}
              />
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-xl shadow-blue-200'}`}>
                  {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
                </div>
                <h3 className="text-md font-bold text-slate-900">
                  {isUploading ? 'Syncing...' : 'Upload Knowledge'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed px-4">
                  All uploads are automatically persisted to your MySQL database.
                </p>
              </div>
            </div>

            {/* Persistence Card */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-4">
                <Database size={20} />
              </div>
              <h4 className="font-bold text-sm">MySQL Integration</h4>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                The application is configured to store bot identity and training data in relational tables. This ensures 100% data durability across sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
