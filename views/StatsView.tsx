import React, { useMemo } from 'react';
import { DailyRecord, TargetPerson, TARGET_LABELS, EmotionLog } from '../types';
import { getAllRecordsArray, getRawDataForExport, importDataFromJSON } from '../services/storage';
import { Download, UploadCloud, Database, AlertCircle, TrendingDown, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
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

    // Format Date MM-DD
    const dateLabel = r.date.substring(5);
    return {
      date: dateLabel,
      agitation: negativeCount, // Days marked as "Agitated" summary
      thoughtCount: totalThoughtCount, // Specific thought instances
      peace: 3 - negativeCount,
    };
  });

  // Prepare data for Pie Chart (Overall Distribution)
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

  // Calculate Overall Peace Rate
  let totalDaysRecorded = records.length;
  let totalInteractions = totalDaysRecorded * 3;
  let totalPeacefulInteractions = 0;
  let totalThoughts = 0;
  
  pieData.forEach(p => {
    totalPeacefulInteractions += p.peaceful;
    totalThoughts += p.thoughts;
  });
  
  const peaceRate = totalInteractions > 0 
    ? Math.round((totalPeacefulInteractions / totalInteractions) * 100) 
    : 100;

  // Handlers for Data Management
  const handleExport = () => {
    const data = getRawDataForExport();
    if (!data) {
        alert("暂无数据可导出");
        return;
    }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindful_mirror_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTrigger = () => {
    document.getElementById('import-file')?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmMsg = "导入备份将覆盖当前的所有记录，确定要继续吗？";
    if (!window.confirm(confirmMsg)) {
        e.target.value = ''; // Reset
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importDataFromJSON(content)) {
            alert("数据恢复成功！页面将刷新。");
            window.location.reload();
        } else {
            alert("文件格式错误，请确保选择的是正确的备份文件。");
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in">
       <header>
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">修行统计</h2>
        <p className="text-stone-500 text-sm">
          回首过往，观照无常。
        </p>
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

      {/* Thought Frequency Chart (New) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <h3 className="text-stone-700 font-medium mb-4 ml-2 flex items-center gap-2">
            <TrendingDown size={18} className="text-stone-400"/>
            妄念趋势 (每日次数)
        </h3>
        <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                    <XAxis dataKey="date" stroke="#a8a29e" tick={{fill: '#78716c'}} />
                    <YAxis allowDecimals={false} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{stroke: '#d6d3d1'}}
                    />
                    <Line type="monotone" dataKey="thoughtCount" name="觉察次数" stroke="#78716c" strokeWidth={3} dot={{r: 4, fill: '#78716c'}} activeDot={{r: 6}} />
                </LineChart>
            </ResponsiveContainer>
        </div>
        <p className="text-center text-xs text-stone-400 mt-2">愿此曲线日渐趋零，复归清净。</p>
      </div>

       {/* Breakdown */}
       <div className="grid gap-4">
          <h3 className="text-stone-700 font-medium ml-2">觉察统计</h3>
          {pieData.map((d) => (
            <div key={d.name} className="bg-white p-4 rounded-xl border border-stone-100 flex items-center justify-between">
                <span className="font-bold text-stone-600">{d.name}</span>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-stone-400">觉察念头</span>
                        <span className="text-sm font-bold text-stone-700">{d.thoughts} 次</span>
                    </div>
                     <div className="w-px h-8 bg-stone-200"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-stone-400">烦恼天数</span>
                        <span className="text-sm font-medium text-stone-500">{d.agitated} / {d.total}</span>
                    </div>
                </div>
            </div>
          ))}
       </div>

       {/* Data Management Section */}
       <div className="border-2 border-dashed border-stone-200 rounded-2xl p-6 mt-8 bg-stone-50/50">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-stone-700 font-bold flex items-center gap-2">
                <Database size={18} />
                数据管理
            </h3>
            <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-1 rounded-full flex items-center gap-1 border border-teal-100">
                <CheckCircle2 size={10} />
                自动保存中
            </span>
        </div>
        
        <p className="text-xs text-stone-400 mb-4 leading-relaxed flex items-start gap-1">
            <AlertCircle size={12} className="mt-0.5 shrink-0" />
            数据存储在您的手机浏览器中。建议定期“导出备份”，以防清理缓存导致记录丢失。
        </p>
        
        <div className="flex gap-3">
            <button 
                onClick={handleExport}
                className="flex-1 py-3 px-4 rounded-xl border border-teal-600 text-teal-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors bg-white shadow-sm"
            >
                <Download size={16} />
                导出备份
            </button>
            <button 
                onClick={handleImportTrigger}
                className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-stone-600 font-medium text-sm flex items-center justify-center gap-2 hover:bg-stone-100 transition-colors bg-white shadow-sm"
            >
                <UploadCloud size={16} />
                导入恢复
            </button>
            <input 
                type="file" 
                id="import-file" 
                accept=".json" 
                className="hidden" 
                onChange={handleImportFile}
            />
        </div>
       </div>
    </div>
  );
};