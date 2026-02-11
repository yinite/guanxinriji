import React, { useState } from 'react';
import { TargetPerson, TARGET_LABELS, EmotionLog } from '../types';
import { User, Bell, Plus, Minus, Info } from 'lucide-react';

interface TrackerCardProps {
  target: TargetPerson;
  log: EmotionLog;
  onUpdate: (hasNegativeEmotion: boolean) => void;
  onIncrementThought: () => void;
  onDecrementThought: () => void;
}

const ZEN_PHRASES = [
  "一念嗔心起，百万障门开。",
  "转念即菩提。",
  "凡所有相，皆是虚妄。",
  "退一步海阔天空。",
  "此时情绪，亦是无常。",
  "慈悲无敌。",
  "观自在，度一切苦厄。",
  "心如止水，鉴常明。",
];

export const TrackerCard: React.FC<TrackerCardProps> = ({ 
  target, 
  log, 
  onUpdate, 
  onIncrementThought,
  onDecrementThought
}) => {
  const isPeaceful = !log.hasNegativeEmotion;
  const count = log.negativeThoughtCount || 0;
  const [flashMsg, setFlashMsg] = useState<string | null>(null);

  const handleIncrement = () => {
    onIncrementThought();
    // Show random zen phrase
    const randomPhrase = ZEN_PHRASES[Math.floor(Math.random() * ZEN_PHRASES.length)];
    setFlashMsg(randomPhrase);
    setTimeout(() => setFlashMsg(null), 3000);
  };

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-5 transition-all duration-500 shadow-sm border mb-4
      ${isPeaceful 
        ? 'bg-white border-stone-200 shadow-stone-100' 
        : 'bg-stone-50 border-stone-300'
      }
    `}>
      {/* Header Section: Person & Daily Result */}
      <div className="flex justify-between items-start mb-5 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isPeaceful ? 'bg-teal-50 text-teal-700' : 'bg-stone-200 text-stone-600'}`}>
            <User size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-700 font-serif tracking-wide">
                {TARGET_LABELS[target]}
            </h3>
            <p className="text-[10px] text-stone-400">今日最终状态</p>
          </div>
        </div>
        
        {/* Toggle Switch Style Summary */}
        <div className="flex bg-stone-100 rounded-lg p-1">
            <button
                onClick={() => onUpdate(false)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!log.hasNegativeEmotion ? 'bg-white text-teal-700 shadow-sm' : 'text-stone-400'}`}
            >
                平和
            </button>
            <button
                onClick={() => onUpdate(true)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${log.hasNegativeEmotion ? 'bg-white text-stone-700 shadow-sm' : 'text-stone-400'}`}
            >
                烦恼
            </button>
        </div>
      </div>

      {/* Real-time Awareness Section */}
      <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-100/50">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
                <Bell size={12} className="text-stone-500"/>
                <span className="text-xs font-bold text-stone-600">
                    觉察念头
                </span>
                <div className="group relative">
                    <Info size={10} className="text-stone-300 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-1 w-40 p-2 bg-stone-800 text-stone-50 text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        记录每一次心中升起的不悦或妄念，即使没有发作也要记录，旨在观照内心。
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                 <span className="text-xs text-stone-400">今日次数:</span>
                 <span className="font-mono font-bold text-stone-600 text-lg min-w-[1.2em] text-center">{count}</span>
                 {count > 0 && (
                     <button 
                        onClick={onDecrementThought}
                        className="p-1 rounded-full text-stone-300 hover:bg-stone-200 hover:text-stone-500 transition-colors"
                        title="误触撤销"
                     >
                         <Minus size={12} />
                     </button>
                 )}
            </div>
        </div>
        
        <button
            onClick={handleIncrement}
            className="w-full py-3 bg-white border border-stone-200 text-stone-600 rounded-lg shadow-sm hover:bg-stone-50 active:scale-95 transition-all flex items-center justify-center gap-2 group"
        >
            <div className="bg-stone-100 p-1 rounded-full group-hover:bg-teal-100 transition-colors">
                <Plus size={16} className="text-stone-400 group-hover:text-teal-600" />
            </div>
            <span className="text-sm font-medium">刚起一念，立刻转念</span>
        </button>

        {flashMsg && (
            <div className="mt-2 text-center animate-fade-in bg-teal-50 text-teal-800 text-xs py-2 px-3 rounded-lg border border-teal-100 font-serif">
                {flashMsg}
            </div>
        )}
      </div>
      
      {!isPeaceful && !flashMsg && (
        <div className="mt-3 text-xs text-stone-400 italic text-center">
          “烦恼即菩提，觉察即解脱。”
        </div>
      )}
    </div>
  );
};