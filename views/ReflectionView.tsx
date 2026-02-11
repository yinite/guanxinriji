import React, { useState, useEffect, useMemo } from 'react';
import { DailyRecord, TargetPerson, TARGET_LABELS, EmotionLog } from '../types';
import { generateDharmaAdvice } from '../services/geminiService';
import { getAllRecordsArray } from '../services/storage';
import { Sparkles, Save, Loader2, Check, History, Calendar, Heart, Frown, Smile } from 'lucide-react';

interface ReflectionViewProps {
  record: DailyRecord;
  onUpdateRecord: (updatedRecord: DailyRecord) => void;
}

export const ReflectionView: React.FC<ReflectionViewProps> = ({ record, onUpdateRecord }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [localReflection, setLocalReflection] = useState(record.reflection);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load history records (excluding today)
  const historyRecords = useMemo(() => {
    const all = getAllRecordsArray();
    // Filter out today and sort descending by date
    return all
      .filter(r => r.date !== record.date)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [record.date]); // Re-calculate if today's date changes (rare) or component remounts

  // Sync local state if record changes externally
  useEffect(() => {
    setLocalReflection(record.reflection);
  }, [record.reflection]);

  const handleSave = async () => {
    if (saveStatus === 'saving') return;
    setSaveStatus('saving');
    await new Promise(resolve => setTimeout(resolve, 600));
    onUpdateRecord({ ...record, reflection: localReflection });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleBlur = () => {
    if (localReflection !== record.reflection) {
      onUpdateRecord({ ...record, reflection: localReflection });
    }
  };

  const handleGetAdvice = async () => {
    if (!localReflection.trim()) return;
    onUpdateRecord({ ...record, reflection: localReflection });
    setIsGenerating(true);
    
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

  // Helper to render emotion tags for history items
  const renderEmotionTags = (targets: DailyRecord['targets']) => {
    return (
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
            {(Object.keys(targets) as TargetPerson[]).map(target => {
                const isBad = targets[target].hasNegativeEmotion;
                return (
                    <span key={target} className={`
                        text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border
                        ${isBad 
                            ? 'bg-red-50 text-red-600 border-red-100' 
                            : 'bg-teal-50 text-teal-700 border-teal-100'}
                    `}>
                        {isBad ? <Frown size={10} /> : <Smile size={10} />}
                        {TARGET_LABELS[target]}
                    </span>
                );
            })}
        </div>
    );
  };

  return (
    <div className="space-y-8 pb-24 h-full flex flex-col">
      {/* Section 1: Today's Reflection */}
      <section className="flex flex-col gap-4">
        <header>
            <h2 className="text-2xl font-serif font-bold text-stone-800 mb-1">每日反省</h2>
            <p className="text-stone-500 text-sm">诚实面对内心，忏悔即是清净。</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-1 flex-col relative group">
            <textarea
              className="w-full min-h-[160px] p-4 rounded-xl text-stone-700 placeholder:text-stone-300 resize-none focus:outline-none focus:bg-stone-50 transition-colors pb-8"
              placeholder="记录今天发生的事情... 哪怕只有一丝不好的念头..."
              value={localReflection}
              onChange={(e) => {
                setLocalReflection(e.target.value);
                if (saveStatus === 'saved') setSaveStatus('idle');
              }}
              onBlur={handleBlur}
            />
             <div className="absolute bottom-3 right-4 text-xs text-stone-300 pointer-events-none">
                {localReflection.length} 字
             </div>
        </div>

        <div className="flex gap-3">
             <button
                onClick={handleSave}
                disabled={saveStatus !== 'idle'}
                className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    saveStatus === 'saved' ? 'bg-teal-100 text-teal-700 border border-teal-200' : 'bg-stone-100 text-stone-600'
                }`}
            >
                {saveStatus === 'saving' ? <Loader2 size={18} className="animate-spin" /> : saveStatus === 'saved' ? <Check size={18} /> : <Save size={18} />}
                <span>{saveStatus === 'saving' ? '保存中...' : saveStatus === 'saved' ? '已保存' : '保存记录'}</span>
            </button>
            <button
                onClick={handleGetAdvice}
                disabled={isGenerating || !localReflection.trim()}
                className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    isGenerating || !localReflection.trim() ? 'bg-stone-200 text-stone-400' : 'bg-teal-700 text-white shadow-md'
                }`}
            >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                <span>{record.aiAdvice ? '重新指引' : '智慧指引'}</span>
            </button>
        </div>

        {record.aiAdvice && (
          <div className="bg-gradient-to-br from-stone-50 to-teal-50/30 rounded-2xl p-5 border border-stone-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-teal-600/20"></div>
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles size={12} /> 今日指引
            </h3>
            <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line font-serif">{record.aiAdvice}</p>
          </div>
        )}
      </section>

      {/* Section 2: History Timeline */}
      <section className="border-t border-stone-200 pt-6">
        <h3 className="text-lg font-serif font-bold text-stone-700 mb-4 flex items-center gap-2">
            <History size={18} className="text-stone-400" />
            往期回顾
        </h3>

        <div className="space-y-4">
            {historyRecords.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-sm bg-stone-100/50 rounded-xl border border-dashed border-stone-200">
                    暂无历史记录，坚持修行，日久见心。
                </div>
            ) : (
                historyRecords.map((hist) => (
                    <div key={hist.date} className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 relative overflow-hidden">
                         {/* Date Header */}
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar size={14} className="text-teal-600" />
                            <span className="font-bold text-stone-700 font-mono text-sm">{hist.date}</span>
                        </div>

                        {/* Status Tags */}
                        {renderEmotionTags(hist.targets)}

                        {/* Reflection Content */}
                        <div className="prose prose-stone prose-sm max-w-none">
                            {hist.reflection ? (
                                <p className="text-stone-600 leading-relaxed text-sm whitespace-pre-wrap font-serif">
                                    {hist.reflection}
                                </p>
                            ) : (
                                <p className="text-stone-300 italic text-xs">当日未填写反省内容。</p>
                            )}
                        </div>

                        {/* AI Advice (if exists) */}
                        {hist.aiAdvice && (
                            <div className="mt-4 pt-3 border-t border-stone-50">
                                <p className="text-xs text-teal-700 bg-teal-50/50 p-3 rounded-lg leading-relaxed italic">
                                    <span className="font-bold not-italic mr-1">💡 指引:</span>
                                    {hist.aiAdvice}
                                </p>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
      </section>
    </div>
  );
};