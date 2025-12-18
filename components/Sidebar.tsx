
import React from 'react';
import { LayoutDashboard, MessageSquare, Settings, HelpCircle, LogOut, FileText } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  documentCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, documentCount }) => {
  const navItems = [
    { id: 'admin' as AppView, icon: LayoutDashboard, label: 'Admin Panel', description: 'Manage documents' },
    { id: 'customer' as AppView, icon: MessageSquare, label: 'Customer Chat', description: 'Live support interface' },
  ];

  return (
    <div className="w-72 h-full bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-all z-20">
      {/* Brand */}
      <div className="p-8">
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">DocuSupport</h1>
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">Enterprise AI</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Navigation</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group
              ${currentView === item.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' 
                : 'hover:bg-slate-800 hover:text-white'}
            `}
          >
            <item.icon size={20} className={currentView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} />
            <div className="text-left">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className={`text-[10px] ${currentView === item.id ? 'text-blue-200' : 'text-slate-500'}`}>
                {item.id === 'admin' ? `${documentCount} files stored` : item.description}
              </p>
            </div>
          </button>
        ))}
      </nav>

      {/* Footer Nav */}
      <div className="p-6 border-t border-slate-800 space-y-2">
        <button className="w-full flex items-center gap-4 px-4 py-2 text-sm font-medium hover:text-white transition-colors">
          <Settings size={18} />
          Settings
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-2 text-sm font-medium hover:text-white transition-colors">
          <HelpCircle size={18} />
          Support
        </button>
        <div className="mt-6 p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
          <p className="text-xs font-bold text-white mb-1">Free Trial</p>
          <p className="text-[10px] text-slate-500 mb-3">Upgrade for more storage and API credits.</p>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[45%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
