import React, { useState } from 'react';
import { TargetPerson, TARGET_LABELS, EmotionLog } from '../types';
import { User, Bell, Plus, Minus, Info, Heart, CloudLightning } from 'lucide-react';

interface TrackerCardProps {
  target: TargetPerson;
  log: EmotionLog;
  onUpdate: (hasNegativeEmotion: boolean) => void;
  onUpdateCounts: (deltaPositive: number, deltaNegative: number) => void;
}

const ZEN_PHRASES_GOOD = [
  "随喜功德。",
  "心生欢喜。",
  "一念善，福田生。",
  "慈悲即是观音。",
];

const ZEN_PHRASES_BAD = [
  "即时转念。",
  "凡所有相，皆是虚妄。",
  "退一步海阔天空。",
  "此时情绪，亦是无常。",
];

export const TrackerCard: React.FC<TrackerCardProps> = ({ 
  target, 
  log, 
  onUpdate, 
  onUpdateCounts
}) => {
  const isPeaceful = !log.hasNegativeEmotion;
  const negCount = log.negativeThoughtCount || 0;
  const posCount = log.positiveThoughtCount || 0;
  const [flashMsg, setFlashMsg] = useState<{text: string, type: 'good' | 'bad'} | null>(null);

  const handleIncrementGood = () => {
    onUpdateCounts(1, 0);
    const randomPhrase = ZEN_PHRASES_GOOD[Math.floor(Math.random() * ZEN_PHRASES_GOOD.length)];
    setFlashMsg({ text: randomPhrase, type: 'good' });
    setTimeout(() => setFlashMsg(null), 2500);
  };

  const handleIncrementBad = () => {
    onUpdateCounts(0, 1);
    const randomPhrase = ZEN_PHRASES_BAD[Math.floor(Math.random() * ZEN_PHRASES_BAD.length)];
    setFlashMsg({ text: randomPhrase, type: 'bad' });
    setTimeout(() => setFlashMsg(null), 2500);
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
      <div className="flex justify-between items-start mb-4 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isPeaceful ? 'bg-teal-50 text-teal-700' : 'bg-stone-200 text-stone-600'}`}>
            <User size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-700 font-serif tracking-wide">
                {TARGET_LABELS[target]}
            </h3>
            <p className="text-[10px] text-stone-400">今日总评</p>
          </div>
        </div>
        
        {/* Toggle Switch Style Summary */}
        <div className="flex bg-stone-100 rounded-lg p-1">
            <button
                onClick={() => onUpdate(false)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!log.hasNegativeEmotion ? 'bg-white text-teal-700 shadow-sm' : 'text-stone-400'}`}
            >
                清净
            </button>
            <button
                onClick={() => onUpdate(true)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${log.hasNegativeEmotion ? 'bg-white text-stone-700 shadow-sm' : 'text-stone-400'}`}
            >
                烦恼
            </button>
        </div>
      </div>

      {/* Counters Section */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Positive (Good Thoughts) */}
        <div className="bg-teal-50/50 rounded-xl p-3 border border-teal-100/50 flex flex-col items-center relative overflow-hidden group">
             <div className="flex justify-between w-full items-center mb-2 px-1">
                <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                   <Heart size={12} className="text-teal-500 fill-teal-500" /> 善念
                </span>
                <span className="font-mono text-lg font-bold text-teal-700">{posCount}</span>
             </div>
             
             <button
                onClick={handleIncrementGood}
                className="w-full py-2 bg-white border border-teal-200 text-teal-700 rounded-lg shadow-sm hover:bg-teal-50 active:scale-95 transition-all flex items-center justify-center gap-1"
             >
                <Plus size={14} strokeWidth={3} />
             </button>

             {/* Small decrement button for correction */}
             {posCount > 0 && (
                 <button 
                    onClick={() => onUpdateCounts(-1, 0)}
                    className="absolute top-1 right-1 p-1 text-teal-300 hover:text-teal-600 transition-colors opacity-0 group-hover:opacity-100"
                 >
                     <Minus size={10} />
                 </button>
             )}
        </div>

        {/* Negative (Bad Thoughts) */}
        <div className="bg-stone-100/50 rounded-xl p-3 border border-stone-200/50 flex flex-col items-center relative overflow-hidden group">
             <div className="flex justify-between w-full items-center mb-2 px-1">
                <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                   <CloudLightning size={12} className="text-stone-500" /> 妄念
                </span>
                <span className="font-mono text-lg font-bold text-stone-600">{negCount}</span>
             </div>
             
             <button
                onClick={handleIncrementBad}
                className="w-full py-2 bg-white border border-stone-300 text-stone-600 rounded-lg shadow-sm hover:bg-stone-200 active:scale-95 transition-all flex items-center justify-center gap-1"
             >
                <Plus size={14} strokeWidth={3} />
             </button>

             {/* Small decrement button for correction */}
             {negCount > 0 && (
                 <button 
                    onClick={() => onUpdateCounts(0, -1)}
                    className="absolute top-1 right-1 p-1 text-stone-300 hover:text-stone-500 transition-colors opacity-0 group-hover:opacity-100"
                 >
                     <Minus size={10} />
                 </button>
             )}
        </div>

      </div>
      
      {/* Flash Message Overlay */}
      {flashMsg && (
            <div className={`
                absolute bottom-4 left-0 right-0 mx-auto w-10/12 text-center animate-fade-in text-xs py-2 px-3 rounded-lg border font-serif z-10 shadow-sm
                ${flashMsg.type === 'good' ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-stone-200 text-stone-700 border-stone-300'}
            `}>
                {flashMsg.text}
            </div>
      )}

      {/* Footer Info */}
       <div className="mt-3 flex justify-center items-center gap-1 text-[10px] text-stone-300">
           <Info size={10} />
           <span>分别记录起心动念，观照内心比例</span>
       </div>
    </div>
  );
};