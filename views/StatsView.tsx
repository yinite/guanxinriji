import React, { useMemo } from 'react';
import { DailyRecord, TargetPerson, TARGET_LABELS, EmotionLog } from '../types';
import { getAllRecordsArray, getRawDataForExport, importDataFromJSON } from '../services/storage';
import { Download, UploadCloud, Database, AlertCircle, TrendingDown, CheckCircle2, CalendarDays, Smile, Frown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const StatsView: React.FC = () => {
  const records = useMemo(() => getAllRecordsArray(), []);

  // Prepare data for the Bar Chart (Last 7 Days)
  const last7Days = records.slice(-7);
  
  const trendData = last7Days.map(r => {
    let negativeCount = 0;
    let totalThoughtCount = 0;

    Object.values(r.targets).forEach((t) => {
      const log = t as EmotionLog;
      if (log.hasNegativeEmotion) negativeCount++;
      totalThoughtCount += (log.negativeThoughtCount || 0);
    });

    const dateLabel = r.date.substring(5);
    return {
      date: dateLabel,
      agitation: negativeCount,
      thoughtCount: totalThoughtCount,
      peace: 3 - negativeCount,
    };
  });

  // Prepare data for Pie Chart
  const totalStats = {
    [TargetPerson.Wife]: { peaceful: 0, agitated: 0, thoughts: 0 },
    [TargetPerson.Son]: { peaceful: 0, agitated: 0, thoughts: 0 },
    [TargetPerson.Parents]: { peaceful: 0, agitated: 0, thoughts: 0 },
  };

  records.forEach(r => {
    (Object.keys(r.targets) as TargetPerson[]).forEach(target => {
      const log = r.targets[target];
      if (log.hasNegativeEmotion) {
        totalStats[target].agitated++;
      } else {
        totalStats[target].peaceful++;
      }
      totalStats[target].thoughts += (log.negativeThoughtCount || 0);
    });
  });

  const pieData = Object.entries(totalStats).map(([key, val]) => ({
    name: TARGET_LABELS[key as TargetPerson],
    agitated: val.agitated,
    peaceful: val.peaceful,
    thoughts: val.thoughts,
    total: val.agitated + val.peaceful
  }));

  let totalInteractions = records.length * 3;
  let totalPeacefulInteractions = 0;
  let totalThoughts = 0;
  
  pieData.forEach(p => {
    totalPeacefulInteractions += p.peaceful;
    totalThoughts += p.thoughts;
  });
  
  const peaceRate = totalInteractions > 0 
    ? Math.round((totalPeacefulInteractions / totalInteractions) * 100) 
    : 100;

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
      ? <div className="flex justify-center"><div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-500"><Frown size={14}/></div></div>
      : <div className="flex justify-center"><div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><Smile size={14}/></div></div>
  );

  // Reverse records for list view
  const recentRecords = [...records].reverse().slice(0, 30);

  return (
    <div className="space-y-8 pb-24 animate-fade-in">
       <header>
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">修行统计</h2>
        <p className="text-stone-500 text-sm">回首过往，观照无常。</p>
      </header>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex items-center justify-between">
         <div>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">总觉察念头</p>
            <p className="text-4xl font-serif font-bold text-stone-700 mt-1">{totalThoughts}<span className="text-sm font-normal text-stone-400 ml-1">次</span></p>
         </div>
         <div className="text-right">
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">综合清净度</p>
            <p className="text-2xl font-serif text-teal-700 mt-1">{peaceRate}%</p>
         </div>
      </div>

      {/* Status History Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
        <div className="p-4 border-b border-stone-100 flex items-center gap-2">
            <CalendarDays size={18} className="text-stone-400"/>
            <h3 className="text-stone-700 font-medium">每日状态明细</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-stone-50 text-stone-500 font-medium text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3">日期</th>
                        <th className="px-2 py-3 text-center">妻子</th>
                        <th className="px-2 py-3 text-center">儿子</th>
                        <th className="px-2 py-3 text-center">父母</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {recentRecords.map(r => (
                        <tr key={r.date} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-stone-600 whitespace-nowrap">{r.date.substring(5)}</td>
                            <td className="px-2 py-3"><StatusIcon isAgitated={r.targets[TargetPerson.Wife].hasNegativeEmotion} /></td>
                            <td className="px-2 py-3"><StatusIcon isAgitated={r.targets[TargetPerson.Son].hasNegativeEmotion} /></td>
                            <td className="px-2 py-3"><StatusIcon isAgitated={r.targets[TargetPerson.Parents].hasNegativeEmotion} /></td>
                        </tr>
                    ))}
                    {recentRecords.length === 0 && (
                        <tr><td colSpan={4} className="p-4 text-center text-stone-400">暂无数据</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <h3 className="text-stone-700 font-medium mb-4 ml-2 flex items-center gap-2">
            <TrendingDown size={18} className="text-stone-400"/>
            妄念趋势 (每日次数)
        </h3>
        <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                    <XAxis dataKey="date" stroke="#a8a29e" tick={{fill: '#78716c'}} />
                    <YAxis allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{stroke: '#d6d3d1'}} />
                    <Line type="monotone" dataKey="thoughtCount" stroke="#78716c" strokeWidth={3} dot={{r: 3, fill: '#78716c'}} />
                </LineChart>
            </ResponsiveContainer>
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