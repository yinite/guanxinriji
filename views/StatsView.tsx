import React, { useMemo } from 'react';
import { DailyRecord, TargetPerson, TARGET_LABELS, EmotionLog } from '../types';
import { getAllRecordsArray, getRawDataForExport, importDataFromJSON } from '../services/storage';
import { Download, UploadCloud, Database, AlertCircle, TrendingDown, CheckCircle2, CalendarDays, Smile, Frown, Scale, Heart, CloudLightning } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const StatsView: React.FC = () => {
  const records = useMemo(() => getAllRecordsArray(), []);

  // Prepare data for the Bar Chart (Last 10 Days)
  const last10Days = records.slice(-10);
  
  const trendData = last10Days.map(r => {
    let dayPos = 0;
    let dayNeg = 0;

    Object.values(r.targets).forEach((t) => {
      const log = t as EmotionLog;
      dayPos += (log.positiveThoughtCount || 0);
      dayNeg += (log.negativeThoughtCount || 0);
    });

    const dateLabel = r.date.substring(5);
    return {
      date: dateLabel,
      善念: dayPos,
      妄念: dayNeg,
    };
  });

  // Calculate totals
  let totalPos = 0;
  let totalNeg = 0;
  records.forEach(r => {
    Object.values(r.targets).forEach(t => {
       const log = t as EmotionLog;
       totalPos += (log.positiveThoughtCount || 0);
       totalNeg += (log.negativeThoughtCount || 0);
    });
  });
  
  const totalThoughts = totalPos + totalNeg;
  const goodRatio = totalThoughts > 0 ? Math.round((totalPos / totalThoughts) * 100) : 0;

  // Handlers
  const handleExport = () => {
    const data = getRawDataForExport();
    if (!data) { alert("暂无数据"); return; }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindful_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportTrigger = () => document.getElementById('import-file')?.click();

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm("覆盖当前记录？")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        if (importDataFromJSON(event.target?.result as string)) {
            alert("恢复成功");
            window.location.reload();
        } else {
            alert("文件错误");
        }
    };
    reader.readAsText(file);
  };

  // Helper for Status Icon in Table
  const StatusIcon = ({ isAgitated }: { isAgitated: boolean }) => (
    isAgitated 
      ? <div className="flex justify-center"><div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500"><Frown size={12}/></div></div>
      : <div className="flex justify-center"><div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><Smile size={12}/></div></div>
  );

  // Helper to show mini ratio
  const RatioText = ({ pos, neg }: { pos?: number, neg?: number }) => {
      const p = pos || 0;
      const n = neg || 0;
      if (p === 0 && n === 0) return <span className="text-stone-300">-</span>;
      return (
          <div className="flex items-center gap-1 text-[10px] justify-center">
              <span className="text-teal-600 font-bold">{p}</span>
              <span className="text-stone-300">/</span>
              <span className="text-stone-400">{n}</span>
          </div>
      )
  };

  // Reverse records for list view
  const recentRecords = [...records].reverse().slice(0, 30);

  return (
    <div className="space-y-8 pb-24 animate-fade-in">
       <header>
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">修行统计</h2>
        <p className="text-stone-500 text-sm">断恶修善，积功累德。</p>
      </header>

      {/* Summary Card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
             <div className="flex items-center gap-2 mb-2 text-teal-700">
                <Heart size={16} />
                <p className="text-xs font-bold uppercase tracking-wider">累计善念</p>
             </div>
             <p className="text-3xl font-serif font-bold text-stone-700">{totalPos}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
             <div className="flex items-center gap-2 mb-2 text-stone-500">
                <CloudLightning size={16} />
                <p className="text-xs font-bold uppercase tracking-wider">累计妄念</p>
             </div>
             <p className="text-3xl font-serif font-bold text-stone-700">{totalNeg}</p>
        </div>
      </div>
      
      {/* Ratio Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
           <div className="flex justify-between items-end mb-2">
               <span className="text-xs font-bold text-stone-500">善念占比</span>
               <span className="text-xl font-serif font-bold text-teal-700">{goodRatio}%</span>
           </div>
           <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
               <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${goodRatio}%` }}></div>
           </div>
           <p className="text-[10px] text-stone-400 mt-2 text-center">
               {goodRatio > 50 ? "随喜！正念强于妄念，继续保持。" : "加油！觉察妄念，转念即是菩提。"}
           </p>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <h3 className="text-stone-700 font-medium mb-4 ml-2 flex items-center gap-2">
            <Scale size={18} className="text-stone-400"/>
            每日善恶对比
        </h3>
        <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                    <XAxis dataKey="date" stroke="#a8a29e" tick={{fill: '#78716c'}} />
                    <YAxis allowDecimals={false} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                        cursor={{fill: '#f5f5f4'}} 
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="善念" stackId="a" fill="#2dd4bf" barSize={12} radius={[0, 0, 4, 4]} />
                    <Bar dataKey="妄念" stackId="a" fill="#a8a29e" barSize={12} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
        <div className="p-4 border-b border-stone-100 flex items-center gap-2">
            <CalendarDays size={18} className="text-stone-400"/>
            <h3 className="text-stone-700 font-medium">每日状态明细 (善/妄)</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-stone-50 text-stone-500 font-medium text-xs uppercase">
                    <tr>
                        <th className="px-3 py-3 w-20">日期</th>
                        <th className="px-1 py-3 text-center">妻子</th>
                        <th className="px-1 py-3 text-center">儿子</th>
                        <th className="px-1 py-3 text-center">父母</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {recentRecords.map(r => (
                        <tr key={r.date} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-3 py-3 font-mono text-stone-600 whitespace-nowrap text-xs">{r.date.substring(5)}</td>
                            <td className="px-1 py-3 text-center">
                                <RatioText pos={r.targets[TargetPerson.Wife].positiveThoughtCount} neg={r.targets[TargetPerson.Wife].negativeThoughtCount} />
                            </td>
                            <td className="px-1 py-3 text-center">
                                <RatioText pos={r.targets[TargetPerson.Son].positiveThoughtCount} neg={r.targets[TargetPerson.Son].negativeThoughtCount} />
                            </td>
                            <td className="px-1 py-3 text-center">
                                <RatioText pos={r.targets[TargetPerson.Parents].positiveThoughtCount} neg={r.targets[TargetPerson.Parents].negativeThoughtCount} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

       {/* Data Management */}
       <div className="border border-dashed border-stone-200 rounded-2xl p-5 bg-stone-50/50">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-stone-700 font-bold flex items-center gap-2 text-sm">
                <Database size={16} /> 数据备份
            </h3>
        </div>
        <div className="flex gap-2">
            <button onClick={handleExport} className="flex-1 py-2 px-3 rounded-lg border border-teal-600 text-teal-700 text-xs font-medium flex items-center justify-center gap-1 bg-white">
                <Download size={14} /> 导出
            </button>
            <button onClick={handleImportTrigger} className="flex-1 py-2 px-3 rounded-lg border border-stone-300 text-stone-600 text-xs font-medium flex items-center justify-center gap-1 bg-white">
                <UploadCloud size={14} /> 恢复
            </button>
            <input type="file" id="import-file" accept=".json" className="hidden" onChange={handleImportFile} />
        </div>
       </div>
    </div>
  );
};