import React from 'react';
import { AppState } from '../types';
import { Activity, BookOpen, BarChart2 } from 'lucide-react';

interface NavProps {
  currentView: AppState['currentView'];
  onChangeView: (view: AppState['currentView']) => void;
}

export const Nav: React.FC<NavProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: 'tracker', label: '今日记录', icon: Activity },
    { id: 'reflection', label: '反省忏悔', icon: BookOpen },
    { id: 'stats', label: '修行统计', icon: BarChart2 },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-stone-50 border-t border-stone-200 pb-safe z-50 shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                isActive ? 'text-teal-700' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};