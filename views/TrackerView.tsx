import React from 'react';
import { DailyRecord, TargetPerson } from '../types';
import { TrackerCard } from '../components/TrackerCard';

interface TrackerViewProps {
  record: DailyRecord;
  onUpdateRecord: (updatedRecord: DailyRecord) => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({ record, onUpdateRecord }) => {
  const handleUpdate = (target: TargetPerson, hasNegativeEmotion: boolean) => {
    const newRecord = {
      ...record,
      targets: {
        ...record.targets,
        [target]: {
          ...record.targets[target],
          hasNegativeEmotion,
        },
      },
    };
    onUpdateRecord(newRecord);
  };

  const handleIncrementThought = (target: TargetPerson) => {
    const currentCount = record.targets[target].negativeThoughtCount || 0;
    const newRecord = {
      ...record,
      targets: {
        ...record.targets,
        [target]: {
          ...record.targets[target],
          negativeThoughtCount: currentCount + 1,
        },
      },
    };
    onUpdateRecord(newRecord);
  };

  const handleDecrementThought = (target: TargetPerson) => {
    const currentCount = record.targets[target].negativeThoughtCount || 0;
    if (currentCount <= 0) return;

    const newRecord = {
      ...record,
      targets: {
        ...record.targets,
        [target]: {
          ...record.targets[target],
          negativeThoughtCount: currentCount - 1,
        },
      },
    };
    onUpdateRecord(newRecord);
  };

  const todayStr = new Date().toLocaleDateString('zh-CN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 pb-24">
      <header className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">观心日记</h1>
        <p className="text-stone-500 text-sm">{todayStr}</p>
        <div className="mt-4 p-4 bg-stone-100 rounded-lg border-l-4 border-teal-600">
            <p className="text-stone-700 text-sm italic font-serif leading-relaxed">
            "五蕴皆空，度一切苦厄。不要把不好的心情纠结带入到家人关系中。"
            </p>
        </div>
      </header>

      <div className="space-y-2">
        <TrackerCard
          target={TargetPerson.Wife}
          log={record.targets[TargetPerson.Wife]}
          onUpdate={(val) => handleUpdate(TargetPerson.Wife, val)}
          onIncrementThought={() => handleIncrementThought(TargetPerson.Wife)}
          onDecrementThought={() => handleDecrementThought(TargetPerson.Wife)}
        />
        <TrackerCard
          target={TargetPerson.Son}
          log={record.targets[TargetPerson.Son]}
          onUpdate={(val) => handleUpdate(TargetPerson.Son, val)}
          onIncrementThought={() => handleIncrementThought(TargetPerson.Son)}
          onDecrementThought={() => handleDecrementThought(TargetPerson.Son)}
        />
        <TrackerCard
          target={TargetPerson.Parents}
          log={record.targets[TargetPerson.Parents]}
          onUpdate={(val) => handleUpdate(TargetPerson.Parents, val)}
          onIncrementThought={() => handleIncrementThought(TargetPerson.Parents)}
          onDecrementThought={() => handleDecrementThought(TargetPerson.Parents)}
        />
      </div>
      
      <div className="text-center mt-6 px-6">
        <p className="text-xs text-stone-400 leading-relaxed">
           上方开关记录<span className="font-bold text-stone-500">最终结果</span>（今日是否清净）。<br/>
           卡片内记录<span className="font-bold text-stone-500">起心动念</span>（过程中的妄念次数）。
        </p>
      </div>
    </div>
  );
};