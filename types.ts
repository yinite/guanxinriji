export enum TargetPerson {
  Wife = 'Wife',
  Son = 'Son',
  Parents = 'Parents'
}

export interface EmotionLog {
  hasNegativeEmotion: boolean; // true if bad emotion, false if peaceful
  negativeThoughtCount: number; // Count of momentary negative thoughts
  note?: string;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  targets: {
    [key in TargetPerson]: EmotionLog;
  };
  reflection: string; // 每日反省/忏悔
  aiAdvice?: string; // AI generated advice based on reflection
}

export interface AppState {
  records: Record<string, DailyRecord>; // Keyed by date string
  currentView: 'tracker' | 'reflection' | 'stats';
}

export const TARGET_LABELS: Record<TargetPerson, string> = {
  [TargetPerson.Wife]: '妻子',
  [TargetPerson.Son]: '儿子',
  [TargetPerson.Parents]: '父母',
};