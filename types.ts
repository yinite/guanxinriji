export enum TargetPerson {
  Wife = 'Wife',
  Son = 'Son',
  Parents = 'Parents'
}

export interface EmotionLog {
  hasNegativeEmotion: boolean; // true if bad emotion, false if peaceful (Final Verdict)
  negativeThoughtCount: number; // 妄念 (Delusions/Negative thoughts)
  positiveThoughtCount: number; // 善念 (Wholesome/Positive thoughts)
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