import React, { useState } from 'react';
import { DailyRecord, TargetPerson, TARGET_LABELS, EmotionLog } from '../types';
import { generateDharmaAdvice } from '../services/geminiService';
import { Sparkles, Save, Loader2 } from 'lucide-react';

interface ReflectionViewProps {
  record: DailyRecord;
  onUpdateRecord: (updatedRecord: DailyRecord) => void;
}

export const ReflectionView: React.FC<ReflectionViewProps> = ({ record, onUpdateRecord }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [localReflection, setLocalReflection] = useState(record.reflection);

  const handleSave = () => {
    onUpdateRecord({
      ...record,
      reflection: localReflection
    });
  };

  const handleGetAdvice = async () => {
    if (!localReflection.trim()) return;

    handleSave(); // Auto save before asking AI
    setIsGenerating(true);

    // Summarize emotion state for context
    const emotions = Object.entries(record.targets).map(([key, val]) => {
      const log = val as EmotionLog;
      return `${TARGET_LABELS[key as TargetPerson]}: ${log.hasNegativeEmotion ? '有情绪' : '平静'}`;
    }).join(', ');

    const advice = await generateDharmaAdvice(localReflection, emotions);
    
    onUpdateRecord({
      ...record,
      reflection: localReflection,
      aiAdvice: advice
    });
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6 pb-24 h-full flex flex-col">
      <header>
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">每日反省</h2>
        <p className="text-stone-500 text-sm">
          诚实面对内心，忏悔即是清净。
        </p>
      </header>

      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-1 flex-1 min-h-[200px] flex flex-col">
            <textarea
              className="w-full h-full p-4 rounded-xl text-stone-700 placeholder:text-stone-300 resize-none focus:outline-none focus:bg-stone-50 transition-colors"
              placeholder="记录今天发生的事情，无论是起心动念，还是言语行为。哪怕只有一丝不好的念头，也要记录下来，提醒自己五蕴皆空..."
              value={localReflection}
              onChange={(e) => setLocalReflection(e.target.value)}
              onBlur={handleSave}
            />
        </div>

        <div className="flex gap-3">
             <button
                onClick={handleSave}
                className="flex-1 bg-stone-100 text-stone-600 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-stone-200 transition-colors"
            >
                <Save size={18} />
                <span>保存记录</span>
            </button>
            <button
                onClick={handleGetAdvice}
                disabled={isGenerating || !localReflection.trim()}
                className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    isGenerating || !localReflection.trim()
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-teal-700 text-white shadow-md hover:bg-teal-800'
                }`}
            >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                <span>{record.aiAdvice ? '重新指引' : '智慧指引'}</span>
            </button>
        </div>

        {record.aiAdvice && (
          <div className="mt-4 bg-gradient-to-br from-stone-50 to-teal-50/30 rounded-2xl p-6 border border-stone-100 shadow-sm animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-teal-600/20"></div>
            <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles size={14} />
                智慧指引
            </h3>
            <div className="prose prose-stone prose-sm max-w-none">
              <p className="text-stone-700 leading-relaxed whitespace-pre-line font-serif">
                {record.aiAdvice}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};