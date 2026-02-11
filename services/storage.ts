import { DailyRecord, TargetPerson } from '../types';

const STORAGE_KEY = 'mindful_mirror_data_v1';

export const getTodayDateString = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getInitialRecord = (date: string): DailyRecord => ({
  date,
  targets: {
    [TargetPerson.Wife]: { hasNegativeEmotion: false, negativeThoughtCount: 0 },
    [TargetPerson.Son]: { hasNegativeEmotion: false, negativeThoughtCount: 0 },
    [TargetPerson.Parents]: { hasNegativeEmotion: false, negativeThoughtCount: 0 },
  },
  reflection: '',
});

export const loadRecords = (): Record<string, DailyRecord> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to load records", e);
    return {};
  }
};

export const saveRecord = (record: DailyRecord) => {
  const records = loadRecords();
  records[record.date] = record;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return records;
};

export const getAllRecordsArray = (): DailyRecord[] => {
  const records = loadRecords();
  return Object.values(records).sort((a, b) => a.date.localeCompare(b.date));
};

export const getRawDataForExport = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

export const importDataFromJSON = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    // Basic validation: must be an object and not null
    if (typeof data !== 'object' || data === null) return false;
    
    // Check if it looks somewhat like our data structure
    const keys = Object.keys(data);
    if (keys.length > 0) {
        const firstItem = data[keys[0]];
        if (!firstItem || typeof firstItem !== 'object' || !('targets' in firstItem)) {
            return false;
        }
    }

    // Save strictly as stringified JSON
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};