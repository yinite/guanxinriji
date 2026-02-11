import React, { useState, useEffect } from 'react';
import { Nav } from './components/Nav';
import { TrackerView } from './views/TrackerView';
import { ReflectionView } from './views/ReflectionView';
import { StatsView } from './views/StatsView';
import { DailyRecord, AppState } from './types';
import { getTodayDateString, getInitialRecord, loadRecords, saveRecord } from './services/storage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppState['currentView']>('tracker');
  const [currentRecord, setCurrentRecord] = useState<DailyRecord | null>(null);

  // Load today's record on mount
  useEffect(() => {
    const today = getTodayDateString();
    const allRecords = loadRecords();
    
    if (allRecords[today]) {
      setCurrentRecord(allRecords[today]);
    } else {
      // Create fresh record for today
      const newRecord = getInitialRecord(today);
      saveRecord(newRecord);
      setCurrentRecord(newRecord);
    }
  }, []);

  const handleUpdateRecord = (updatedRecord: DailyRecord) => {
    saveRecord(updatedRecord);
    setCurrentRecord(updatedRecord);
  };

  // Helper to render current view
  const renderView = () => {
    if (!currentRecord) return <div className="flex h-screen items-center justify-center text-stone-400">Loading...</div>;

    switch (currentView) {
      case 'tracker':
        return <TrackerView record={currentRecord} onUpdateRecord={handleUpdateRecord} />;
      case 'reflection':
        return <ReflectionView record={currentRecord} onUpdateRecord={handleUpdateRecord} />;
      case 'stats':
        return <StatsView />;
      default:
        return <TrackerView record={currentRecord} onUpdateRecord={handleUpdateRecord} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-teal-100 selection:text-teal-900">
      <div className="max-w-md mx-auto min-h-screen bg-[#fdfbf7] shadow-2xl relative">
        <main className="p-6 h-full min-h-screen box-border">
          {renderView()}
        </main>
        <Nav currentView={currentView} onChangeView={setCurrentView} />
      </div>
    </div>
  );
};

export default App;
