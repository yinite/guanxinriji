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

  const handleUpdateCounts = (target: TargetPerson, deltaPositive: number, deltaNegative: number) => {
    const currentTarget = record.targets[target];
    const newPos = Math.max(0, (currentTarget.positiveThoughtCount || 0) + deltaPositive);
    const newNeg = Math.max(0, (currentTarget.negativeThoughtCount || 0) + deltaNegative);

    const newRecord = {
      ...record,
      targets: {
        ...record.targets,
        [target]: {
          ...currentTarget,
          positiveThoughtCount: newPos,
          negativeThoughtCount: newNeg,
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
            "善恶之念，皆由心生。记录是为了觉察，觉察即是修行的开始。"
            </p>
        </div>
      </header>

      <div className="space-y-2">
        <TrackerCard
          target={TargetPerson.Wife}
          log={record.targets[TargetPerson.Wife]}
          onUpdate={(val) => handleUpdate(TargetPerson.Wife, val)}
          onUpdateCounts={(dp, dn) => handleUpdateCounts(TargetPerson.Wife, dp, dn)}
        />
        <TrackerCard
          target={TargetPerson.Son}
          log={record.targets[TargetPerson.Son]}
          onUpdate={(val) => handleUpdate(TargetPerson.Son, val)}
          onUpdateCounts={(dp, dn) => handleUpdateCounts(TargetPerson.Son, dp, dn)}
        />
        <TrackerCard
          target={TargetPerson.Parents}
          log={record.targets[TargetPerson.Parents]}
          onUpdate={(val) => handleUpdate(TargetPerson.Parents, val)}
          onUpdateCounts={(dp, dn) => handleUpdateCounts(TargetPerson.Parents, dp, dn)}
        />
      </div>
    </div>
  );
};